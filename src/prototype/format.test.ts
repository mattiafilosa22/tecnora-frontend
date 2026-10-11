import { describe, expect, it } from 'vitest';
import {
  addDays,
  addFrequency,
  dueStatus,
  formatDateTime,
  nextActivityId,
  nextDueAfterCompletion,
  nextTicketId,
} from './format';
import { createSeed } from './seed';

describe('addDays', () => {
  it('attraversa mesi e anni', () => {
    expect(addDays('2026-12-29', 5)).toBe('2027-01-03');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('addFrequency', () => {
  it.each([
    ['2026-10-12', 'settimanale', '2026-10-19'],
    ['2026-12-29', 'settimanale', '2027-01-05'],
    ['2026-10-12', 'mensile', '2026-11-12'],
    ['2026-01-31', 'mensile', '2026-02-28'],
    ['2027-12-15', 'mensile', '2028-01-15'],
    ['2026-11-30', 'trimestrale', '2027-02-28'],
    ['2026-08-31', 'semestrale', '2027-02-28'],
    ['2026-10-12', 'annuale', '2027-10-12'],
    ['2028-02-29', 'annuale', '2029-02-28'],
  ] as const)('%s + %s → %s', (from, frequency, expected) => {
    expect(addFrequency(from, frequency)).toBe(expected);
  });
});

describe('nextDueAfterCompletion', () => {
  it('in anticipo avanza di un solo periodo', () => {
    expect(nextDueAfterCompletion('2026-10-20', 'mensile', '2026-10-12')).toBe('2026-11-20');
  });

  it('nel giorno di scadenza avanza di un periodo', () => {
    expect(nextDueAfterCompletion('2026-10-12', 'settimanale', '2026-10-12')).toBe('2026-10-19');
  });

  it('in forte ritardo salta i periodi persi mantenendo la cadenza', () => {
    expect(nextDueAfterCompletion('2026-10-01', 'settimanale', '2026-10-30')).toBe('2026-11-05');
    expect(nextDueAfterCompletion('2026-10-01', 'settimanale', '2026-10-29')).toBe('2026-11-05');
    expect(nextDueAfterCompletion('2026-01-15', 'trimestrale', '2026-10-12')).toBe('2026-10-15');
  });
});

describe('dueStatus', () => {
  const today = '2026-10-12';

  it.each([
    ['2026-10-11', 'scaduta'],
    ['2026-10-12', 'in_scadenza'],
    ['2026-10-19', 'in_scadenza'],
    ['2026-10-20', 'programmata'],
  ] as const)('%s → %s', (nextDue, expected) => {
    expect(dueStatus(nextDue, today)).toBe(expected);
  });
});

describe('formatDateTime', () => {
  it('aggiunge l’orario alla data', () => {
    expect(formatDateTime('2026-10-12T09:05')).toMatch(/2026 alle 09:05$/);
  });
});

describe('id progressivi', () => {
  it('nextTicketId parte da TCK-1001 e segue il massimo esistente', () => {
    expect(nextTicketId([])).toBe('TCK-1001');
    expect(nextTicketId(createSeed('2026-10-12').tickets)).toBe('TCK-1009');
  });

  it('nextActivityId segue il massimo numerico, non l’ordine alfabetico', () => {
    expect(nextActivityId([])).toBe('att-1');
    expect(nextActivityId(createSeed('2026-10-12').activities)).toBe('att-11');
  });
});
