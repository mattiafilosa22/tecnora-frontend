export type BuildingType = 'Uffici' | 'Residenziale' | 'Commerciale' | 'Scuola';

export interface Building {
  id: string;
  code: string;
  name: string;
  type: BuildingType;
  address: string;
  city: string;
  surfaceSqm: number;
  contact: { name: string; role: string; phone: string; email: string };
}

export type ActivityKind = 'manutenzione' | 'pulizia';

export type Frequency = 'settimanale' | 'mensile' | 'trimestrale' | 'semestrale' | 'annuale';

export interface Activity {
  id: string;
  buildingId: string;
  title: string;
  kind: ActivityKind;
  frequency: Frequency;
  /** YYYY-MM-DD */
  nextDue: string;
  assignee: string;
  lastCompletedOn?: string;
  notes?: string;
}

export type TicketStatus = 'aperto' | 'in_carico' | 'in_attesa' | 'chiuso';

export type TicketPriority = 'bassa' | 'media' | 'alta' | 'urgente';

export type TicketCategory =
  | 'Elettrico'
  | 'Idraulico'
  | 'Climatizzazione'
  | 'Ascensori'
  | 'Serramenti e accessi'
  | 'Pulizia straordinaria'
  | 'Altro';

export interface Attachment {
  name: string;
  sizeKb: number;
}

export interface TicketEvent {
  /** YYYY-MM-DDTHH:mm */
  at: string;
  text: string;
}

export interface Ticket {
  /** Es. 'TCK-1001' */
  id: string;
  buildingId: string;
  category: TicketCategory;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee?: string;
  attachments: Attachment[];
  openedAt: string;
  closedAt?: string;
  closingNote?: string;
  history: TicketEvent[];
}

export interface PrototypeState {
  buildings: Building[];
  activities: Activity[];
  tickets: Ticket[];
}
