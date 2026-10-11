import {
  DUE_HELP,
  DUE_LABEL,
  PRIORITY_HELP,
  PRIORITY_LABEL,
  STATUS_HELP,
  STATUS_LABEL,
  type DueStatus,
} from '../prototype/format';
import type { TicketPriority, TicketStatus } from '../prototype/types';

const base = 'inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium';

const STATUS_CLASS: Record<TicketStatus, string> = {
  aperto: 'bg-blue-100 text-blue-800',
  in_carico: 'bg-amber-100 text-amber-800',
  in_attesa: 'bg-slate-200 text-slate-700',
  chiuso: 'bg-green-100 text-green-800',
};

const PRIORITY_CLASS: Record<TicketPriority, string> = {
  urgente: 'bg-red-600 text-white',
  alta: 'bg-red-100 text-red-800',
  media: 'bg-amber-100 text-amber-800',
  bassa: 'bg-slate-100 text-slate-700',
};

const DUE_CLASS: Record<DueStatus, string> = {
  scaduta: 'bg-red-100 text-red-800',
  in_scadenza: 'bg-amber-100 text-amber-800',
  programmata: 'bg-green-100 text-green-800',
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`${base} ${STATUS_CLASS[status]}`} title={STATUS_HELP[status]}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`${base} ${PRIORITY_CLASS[priority]}`} title={PRIORITY_HELP[priority]}>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function DueBadge({ status }: { status: DueStatus }) {
  return (
    <span className={`${base} ${DUE_CLASS[status]}`} title={DUE_HELP[status]}>
      {DUE_LABEL[status]}
    </span>
  );
}
