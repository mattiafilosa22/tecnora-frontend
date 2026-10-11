import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { DueBadge, DueLegend } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import {
  buttonPrimary,
  buttonSecondary,
  card,
  desktopOnly,
  fieldInput,
  fieldLabel,
  link,
  mobileOnly,
  table,
  td,
  th,
} from '../components/styles';
import { usePrototype } from '../prototype/context';
import {
  ACTIVITY_KINDS,
  FREQUENCY_LABEL,
  KIND_LABEL,
  dueStatus,
  formatDate,
  nextDueAfterCompletion,
} from '../prototype/format';
import type { Activity } from '../prototype/types';

export function SchedulePage() {
  const { state, dispatch, today } = usePrototype();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState<string>();

  const buildingFilter = searchParams.get('edificio') ?? '';
  const kindFilter = searchParams.get('tipo') ?? '';
  const flashMessage = message ?? (location.state as { message?: string } | null)?.message;

  const setFilter = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace: true });
  };

  const activities = state.activities
    .filter(
      (a) =>
        (!buildingFilter || a.buildingId === buildingFilter) &&
        (!kindFilter || a.kind === kindFilter),
    )
    .sort((a, b) => a.nextDue.localeCompare(b.nextDue));

  const complete = (activity: Activity) => {
    const nextDue = nextDueAfterCompletion(activity.nextDue, activity.frequency, today);
    dispatch({ type: 'completeActivity', id: activity.id, date: today });
    setMessage(`«${activity.title}» completata. Prossima scadenza: ${formatDate(nextDue)}.`);
  };

  return (
    <>
      <PageHeader
        title="Programma manutenzioni e pulizie"
        description="Le attività sono ricorrenti: quando ne confermi una come completata, la prossima scadenza avanza automaticamente in base alla frequenza."
        actions={
          <Link to="/programma/nuova" className={buttonPrimary}>
            Nuova attività
          </Link>
        }
      />

      <StatusMessage message={flashMessage} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="filtro-edificio" className={fieldLabel}>
            Edificio
          </label>
          <select
            id="filtro-edificio"
            className={fieldInput}
            value={buildingFilter}
            onChange={(e) => setFilter('edificio', e.target.value)}
          >
            <option value="">Tutti</option>
            {state.buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-tipo" className={fieldLabel}>
            Tipo
          </label>
          <select
            id="filtro-tipo"
            className={fieldInput}
            value={kindFilter}
            onChange={(e) => setFilter('tipo', e.target.value)}
          >
            <option value="">Tutti</option>
            {ACTIVITY_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DueLegend />

      {activities.length === 0 ? (
        <p className={card}>Nessuna attività con questi filtri.</p>
      ) : (
        <div className={`${card} overflow-x-auto p-0`}>
          <table className={table}>
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Attività</th>
                <th className={th}>Edificio</th>
                <th className={th}>Prossima scadenza</th>
                <th className={th}>Stato</th>
                <th className={`${th} ${desktopOnly}`}>Tipo</th>
                <th className={`${th} ${desktopOnly}`}>Frequenza</th>
                <th className={`${th} ${desktopOnly}`}>Assegnatario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.map((a) => {
                const building = state.buildings.find((b) => b.id === a.buildingId);
                return (
                  <tr key={a.id}>
                    {/* L'azione sta nella prima colonna, così resta visibile anche su mobile. */}
                    <td className={`${td} min-w-48`}>
                      <p className="font-medium">{a.title}</p>
                      {a.notes && <p className="text-xs text-slate-500">{a.notes}</p>}
                      <p className={`${mobileOnly} text-xs text-slate-500`}>
                        {`${KIND_LABEL[a.kind]} · ${FREQUENCY_LABEL[a.frequency]} · ${a.assignee}`}
                      </p>
                      <button
                        type="button"
                        className={`${buttonSecondary} mt-2 whitespace-nowrap`}
                        aria-label={`Segna come completata: ${a.title}`}
                        onClick={() => complete(a)}
                      >
                        Segna come completata
                      </button>
                    </td>
                    <td className={td}>
                      <Link to={`/edifici/${a.buildingId}`} className={link}>
                        {building?.name ?? '—'}
                      </Link>
                    </td>
                    <td className={`${td} whitespace-nowrap`}>{formatDate(a.nextDue)}</td>
                    <td className={td}>
                      <DueBadge status={dueStatus(a.nextDue, today)} />
                      {a.lastCompletedOn && (
                        <p className="mt-1 text-xs whitespace-nowrap text-slate-500">
                          Ultima: {formatDate(a.lastCompletedOn)}
                        </p>
                      )}
                    </td>
                    <td className={`${td} ${desktopOnly}`}>{KIND_LABEL[a.kind]}</td>
                    <td className={`${td} ${desktopOnly}`}>{FREQUENCY_LABEL[a.frequency]}</td>
                    <td className={`${td} ${desktopOnly}`}>{a.assignee}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
