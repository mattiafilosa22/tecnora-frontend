import type {
  Activity,
  ActivityKind,
  BuildingType,
  Frequency,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from './types';

// Le date sono stringhe ISO (YYYY-MM-DD) e i calcoli avvengono in UTC, così i risultati non
// dipendono dal fuso orario né dal cambio dell'ora legale.

export type DueStatus = 'scaduta' | 'in_scadenza' | 'programmata';

const pad = (n: number) => String(n).padStart(2, '0');

function localDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayIso(): string {
  return localDate(new Date());
}

export function nowIso(): string {
  const d = new Date();
  return `${localDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** Se il giorno non esiste nel mese di arrivo si usa l'ultimo del mese (31/01 → 28/02). */
function addMonths(iso: string, n: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + n, 1));
  target.setUTCDate(Math.min(day, daysInMonth(target.getUTCFullYear(), target.getUTCMonth())));
  return toIso(target);
}

const FREQUENCY_MONTHS: Record<Exclude<Frequency, 'settimanale'>, number> = {
  mensile: 1,
  trimestrale: 3,
  semestrale: 6,
  annuale: 12,
};

export function addFrequency(iso: string, f: Frequency): string {
  return f === 'settimanale' ? addDays(iso, 7) : addMonths(iso, FREQUENCY_MONTHS[f]);
}

/** Avanza la scadenza mantenendo la cadenza, finché supera la data di completamento. */
export function nextDueAfterCompletion(nextDue: string, f: Frequency, completedOn: string): string {
  let next = addFrequency(nextDue, f);
  while (next <= completedOn) {
    next = addFrequency(next, f);
  }
  return next;
}

export function dueStatus(nextDue: string, today: string): DueStatus {
  if (nextDue < today) return 'scaduta';
  if (nextDue <= addDays(today, 7)) return 'in_scadenza';
  return 'programmata';
}

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}

export function formatDateTime(isoDt: string): string {
  return `${formatDate(isoDt.slice(0, 10))} alle ${isoDt.slice(11, 16)}`;
}

function maxNumericSuffix(ids: string[], prefix: string, fallback: number): number {
  return ids.reduce((max, id) => {
    const n = Number(id.slice(prefix.length));
    return id.startsWith(prefix) && Number.isFinite(n) && n > max ? n : max;
  }, fallback);
}

export function nextTicketId(tickets: Ticket[]): string {
  const max = maxNumericSuffix(tickets.map((t) => t.id), 'TCK-', 1000);
  return `TCK-${max + 1}`;
}

export function nextActivityId(activities: Activity[]): string {
  const max = maxNumericSuffix(activities.map((a) => a.id), 'att-', 0);
  return `att-${max + 1}`;
}

export const FREQUENCIES: Frequency[] = [
  'settimanale',
  'mensile',
  'trimestrale',
  'semestrale',
  'annuale',
];

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  settimanale: 'Settimanale',
  mensile: 'Mensile',
  trimestrale: 'Trimestrale',
  semestrale: 'Semestrale',
  annuale: 'Annuale',
};

export const ACTIVITY_KINDS: ActivityKind[] = ['manutenzione', 'pulizia'];

export const KIND_LABEL: Record<ActivityKind, string> = {
  manutenzione: 'Manutenzione',
  pulizia: 'Pulizia',
};

export const BUILDING_TYPES: BuildingType[] = ['Uffici', 'Residenziale', 'Commerciale', 'Scuola'];

export const TICKET_STATUSES: TicketStatus[] = ['aperto', 'in_carico', 'in_attesa', 'chiuso'];

export const STATUS_LABEL: Record<TicketStatus, string> = {
  aperto: 'Aperto',
  in_carico: 'In carico',
  in_attesa: 'In attesa',
  chiuso: 'Chiuso',
};

export const STATUS_HELP: Record<TicketStatus, string> = {
  aperto: 'Segnalazione ricevuta, nessun tecnico assegnato',
  in_carico: 'Un tecnico è assegnato e sta gestendo l’intervento',
  in_attesa: 'Intervento sospeso (es. ricambi o accesso ai locali)',
  chiuso: 'Intervento concluso con nota di chiusura',
};

/** Dalla più grave alla meno grave: è anche l'ordine di visualizzazione. */
export const TICKET_PRIORITIES: TicketPriority[] = ['urgente', 'alta', 'media', 'bassa'];

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  bassa: 'Bassa',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

const TO_CONFIRM = ' (tempi indicativi da confermare)';

export const PRIORITY_HELP: Record<TicketPriority, string> = {
  urgente: `Rischio per persone o attività bloccata: intervento entro 4 ore${TO_CONFIRM}`,
  alta: `Disservizio importante: intervento entro 1 giorno lavorativo${TO_CONFIRM}`,
  media: `Problema che non blocca le attività: intervento entro 3 giorni lavorativi${TO_CONFIRM}`,
  bassa: `Piccolo inconveniente: intervento alla prima occasione utile${TO_CONFIRM}`,
};

export const PRIORITY_RANK: Record<TicketPriority, number> = {
  urgente: 0,
  alta: 1,
  media: 2,
  bassa: 3,
};

export const DUE_LABEL: Record<DueStatus, string> = {
  scaduta: 'Scaduta',
  in_scadenza: 'In scadenza (7 giorni)',
  programmata: 'Programmata',
};

export const DUE_HELP: Record<DueStatus, string> = {
  scaduta: 'La scadenza è passata: l’attività va svolta il prima possibile',
  in_scadenza: 'Da svolgere entro i prossimi 7 giorni',
  programmata: 'Scadenza oltre i prossimi 7 giorni',
};

export const TICKET_CATEGORIES: TicketCategory[] = [
  'Elettrico',
  'Idraulico',
  'Climatizzazione',
  'Ascensori',
  'Serramenti e accessi',
  'Pulizia straordinaria',
  'Altro',
];

/** Assegnatari fittizi. */
export const TEAM: string[] = [
  'Luca Ferri (tecnico interno)',
  'Sara Conti (tecnico interno)',
  'Idrotermica Demo Srl',
  'Pulizie Brillanti Demo Srl',
  'Elevatori Demo Spa',
];
