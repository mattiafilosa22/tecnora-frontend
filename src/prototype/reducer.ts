import { STATUS_LABEL, nextDueAfterCompletion } from './format';
import type { Activity, PrototypeState, Ticket } from './types';

export type Action =
  | { type: 'reset'; state: PrototypeState }
  | { type: 'createActivity'; activity: Activity }
  | { type: 'completeActivity'; id: string; date: string }
  | { type: 'createTicket'; ticket: Ticket }
  | { type: 'assignTicket'; id: string; assignee: string; at: string }
  | {
      type: 'setTicketStatus';
      id: string;
      status: 'in_carico' | 'in_attesa';
      at: string;
      note?: string;
    }
  | { type: 'closeTicket'; id: string; note: string; at: string };

/** Aggiorna il ticket se esiste e non è chiuso; altrimenti restituisce lo stato invariato. */
function updateOpenTicket(
  state: PrototypeState,
  id: string,
  update: (ticket: Ticket) => Ticket,
): PrototypeState {
  const ticket = state.tickets.find((t) => t.id === id);
  if (!ticket || ticket.status === 'chiuso') return state;
  const updated = update(ticket);
  return { ...state, tickets: state.tickets.map((t) => (t === ticket ? updated : t)) };
}

export function reducer(state: PrototypeState, action: Action): PrototypeState {
  switch (action.type) {
    case 'reset':
      return action.state;

    case 'createActivity':
      return { ...state, activities: [...state.activities, action.activity] };

    case 'completeActivity': {
      const activity = state.activities.find((a) => a.id === action.id);
      if (!activity) return state;
      const completed: Activity = {
        ...activity,
        lastCompletedOn: action.date,
        nextDue: nextDueAfterCompletion(activity.nextDue, activity.frequency, action.date),
      };
      return {
        ...state,
        activities: state.activities.map((a) => (a === activity ? completed : a)),
      };
    }

    case 'createTicket':
      return { ...state, tickets: [action.ticket, ...state.tickets] };

    case 'assignTicket':
      return updateOpenTicket(state, action.id, (t) => ({
        ...t,
        assignee: action.assignee,
        status: t.status === 'aperto' ? 'in_carico' : t.status,
        history: [
          ...t.history,
          { at: action.at, text: `Assegnato a ${action.assignee}: presa in carico` },
        ],
      }));

    case 'setTicketStatus': {
      const text = `Stato cambiato in «${STATUS_LABEL[action.status]}»`;
      return updateOpenTicket(state, action.id, (t) => ({
        ...t,
        status: action.status,
        history: [
          ...t.history,
          { at: action.at, text: action.note ? `${text}: ${action.note}` : text },
        ],
      }));
    }

    case 'closeTicket':
      return updateOpenTicket(state, action.id, (t) => ({
        ...t,
        status: 'chiuso',
        closedAt: action.at,
        closingNote: action.note,
        history: [...t.history, { at: action.at, text: `Ticket chiuso: ${action.note}` }],
      }));
  }
}
