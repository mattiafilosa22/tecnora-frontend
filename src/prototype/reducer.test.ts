import { describe, expect, it } from 'vitest';
import { reducer } from './reducer';
import { createSeed } from './seed';
import type { Ticket } from './types';

const TODAY = '2026-10-12';
const AT = '2026-10-12T10:30';

const ticket = (state: ReturnType<typeof createSeed>, id: string) =>
  state.tickets.find((t) => t.id === id) as Ticket;

describe('reducer', () => {
  it('reset sostituisce lo stato', () => {
    const fresh = createSeed(TODAY);
    const empty = { buildings: [], activities: [], tickets: [] };
    expect(reducer(empty, { type: 'reset', state: fresh })).toBe(fresh);
  });

  it('completeActivity registra il completamento e avanza la scadenza', () => {
    const state = createSeed(TODAY);
    // att-1: settimanale, scaduta da 3 giorni (2026-10-09).
    const next = reducer(state, { type: 'completeActivity', id: 'att-1', date: TODAY });
    const activity = next.activities.find((a) => a.id === 'att-1');
    expect(activity?.lastCompletedOn).toBe(TODAY);
    expect(activity?.nextDue).toBe('2026-10-16');
    expect(state.activities.find((a) => a.id === 'att-1')?.nextDue).toBe('2026-10-09');
  });

  it('createActivity aggiunge l’attività', () => {
    const state = createSeed(TODAY);
    const next = reducer(state, {
      type: 'createActivity',
      activity: {
        id: 'att-11',
        buildingId: 'ed-05',
        title: 'Pulizia parcheggio',
        kind: 'pulizia',
        frequency: 'mensile',
        nextDue: '2026-11-01',
        assignee: 'Pulizie Brillanti Demo Srl',
      },
    });
    expect(next.activities).toHaveLength(state.activities.length + 1);
    expect(next.activities.at(-1)?.title).toBe('Pulizia parcheggio');
  });

  it('createTicket aggiunge il ticket in testa', () => {
    const state = createSeed(TODAY);
    const created: Ticket = {
      id: 'TCK-1009',
      buildingId: 'ed-01',
      category: 'Elettrico',
      title: 'Interruttore guasto',
      description: 'Non si accende la luce.',
      priority: 'media',
      status: 'aperto',
      attachments: [],
      openedAt: AT,
      history: [{ at: AT, text: 'Ticket aperto' }],
    };
    const next = reducer(state, { type: 'createTicket', ticket: created });
    expect(next.tickets[0]).toBe(created);
    expect(next.tickets).toHaveLength(state.tickets.length + 1);
  });

  it('assignTicket su un ticket aperto lo prende in carico', () => {
    const state = createSeed(TODAY);
    const next = reducer(state, {
      type: 'assignTicket',
      id: 'TCK-1001',
      assignee: 'Idrotermica Demo Srl',
      at: AT,
    });
    const updated = ticket(next, 'TCK-1001');
    expect(updated.status).toBe('in_carico');
    expect(updated.assignee).toBe('Idrotermica Demo Srl');
    expect(updated.history.at(-1)).toEqual({
      at: AT,
      text: 'Assegnato a Idrotermica Demo Srl: presa in carico',
    });
  });

  it('assignTicket su un ticket in attesa non cambia lo stato', () => {
    const next = reducer(createSeed(TODAY), {
      type: 'assignTicket',
      id: 'TCK-1004',
      assignee: 'Sara Conti (tecnico interno)',
      at: AT,
    });
    expect(ticket(next, 'TCK-1004').status).toBe('in_attesa');
    expect(ticket(next, 'TCK-1004').assignee).toBe('Sara Conti (tecnico interno)');
  });

  it('setTicketStatus cambia lo stato e annota la cronologia', () => {
    const state = createSeed(TODAY);
    const paused = reducer(state, {
      type: 'setTicketStatus',
      id: 'TCK-1002',
      status: 'in_attesa',
      note: 'ricambio ordinato',
      at: AT,
    });
    expect(ticket(paused, 'TCK-1002').status).toBe('in_attesa');
    expect(ticket(paused, 'TCK-1002').history.at(-1)?.text).toBe(
      'Stato cambiato in «In attesa»: ricambio ordinato',
    );

    const resumed = reducer(paused, {
      type: 'setTicketStatus',
      id: 'TCK-1002',
      status: 'in_carico',
      at: AT,
    });
    expect(ticket(resumed, 'TCK-1002').status).toBe('in_carico');
    expect(ticket(resumed, 'TCK-1002').history.at(-1)?.text).toBe('Stato cambiato in «In carico»');
  });

  it('closeTicket chiude il ticket con la nota', () => {
    const next = reducer(createSeed(TODAY), {
      type: 'closeTicket',
      id: 'TCK-1003',
      note: 'Ascensore riavviato',
      at: AT,
    });
    const closed = ticket(next, 'TCK-1003');
    expect(closed.status).toBe('chiuso');
    expect(closed.closedAt).toBe(AT);
    expect(closed.closingNote).toBe('Ascensore riavviato');
    expect(closed.history.at(-1)?.text).toBe('Ticket chiuso: Ascensore riavviato');
  });

  it('un ticket chiuso non cambia più', () => {
    const state = createSeed(TODAY);
    // TCK-1006 è chiuso nei dati di esempio.
    expect(
      reducer(state, { type: 'assignTicket', id: 'TCK-1006', assignee: 'Altri', at: AT }),
    ).toBe(state);
    expect(
      reducer(state, { type: 'setTicketStatus', id: 'TCK-1006', status: 'in_carico', at: AT }),
    ).toBe(state);
    expect(reducer(state, { type: 'closeTicket', id: 'TCK-1006', note: 'Di nuovo', at: AT })).toBe(
      state,
    );
  });

  it('un id inesistente lascia lo stato invariato', () => {
    const state = createSeed(TODAY);
    expect(reducer(state, { type: 'completeActivity', id: 'att-999', date: TODAY })).toBe(state);
    expect(
      reducer(state, { type: 'assignTicket', id: 'TCK-9999', assignee: 'Nessuno', at: AT }),
    ).toBe(state);
    expect(reducer(state, { type: 'closeTicket', id: 'TCK-9999', note: 'x', at: AT })).toBe(state);
  });
});
