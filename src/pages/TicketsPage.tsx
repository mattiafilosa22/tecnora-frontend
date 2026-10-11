import { Link, useSearchParams } from 'react-router';
import { PriorityBadge, TicketStatusBadge } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import {
  buttonPrimary,
  buttonSecondary,
  card,
  fieldInput,
  fieldLabel,
  link,
  table,
  td,
  th,
} from '../components/styles';
import { usePrototype } from '../prototype/context';
import {
  PRIORITY_LABEL,
  PRIORITY_RANK,
  STATUS_LABEL,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  formatDateTime,
} from '../prototype/format';

export function TicketsPage() {
  const { state } = usePrototype();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = searchParams.get('stato') ?? '';
  const priorityFilter = searchParams.get('priorita') ?? '';
  const buildingFilter = searchParams.get('edificio') ?? '';

  const setFilter = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace: true });
  };

  const buildingName = (id: string) => state.buildings.find((b) => b.id === id)?.name ?? '—';

  const tickets = state.tickets
    .filter(
      (t) =>
        (!statusFilter || t.status === statusFilter) &&
        (!priorityFilter || t.priority === priorityFilter) &&
        (!buildingFilter || t.buildingId === buildingFilter),
    )
    .sort(
      (a, b) =>
        Number(a.status === 'chiuso') - Number(b.status === 'chiuso') ||
        PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
        b.openedAt.localeCompare(a.openedAt),
    );

  return (
    <>
      <PageHeader
        title="Ticket di pronto intervento"
        description="Le segnalazioni di guasti e interventi urgenti. Apri un ticket per vedere la cronologia, assegnarlo o chiuderlo."
        actions={
          <Link to="/ticket/nuovo" className={buttonPrimary}>
            Apri un ticket
          </Link>
        }
      />

      <div className="mb-4 grid items-end gap-3 sm:grid-cols-4">
        <div>
          <label htmlFor="filtro-stato" className={fieldLabel}>
            Stato
          </label>
          <select
            id="filtro-stato"
            className={fieldInput}
            value={statusFilter}
            onChange={(e) => setFilter('stato', e.target.value)}
          >
            <option value="">Tutti</option>
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-priorita" className={fieldLabel}>
            Priorità
          </label>
          <select
            id="filtro-priorita"
            className={fieldInput}
            value={priorityFilter}
            onChange={(e) => setFilter('priorita', e.target.value)}
          >
            <option value="">Tutti</option>
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-ticket-edificio" className={fieldLabel}>
            Edificio
          </label>
          <select
            id="filtro-ticket-edificio"
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
          <button
            type="button"
            className={buttonSecondary}
            onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
          >
            Azzera filtri
          </button>
        </div>
      </div>

      <p className="mb-2 text-sm text-slate-600">{tickets.length} ticket</p>

      {tickets.length === 0 ? (
        <p className={card}>Nessun ticket con questi filtri.</p>
      ) : (
        <div className={`${card} overflow-x-auto p-0`}>
          <table className={table}>
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Codice</th>
                <th className={th}>Titolo</th>
                <th className={th}>Edificio</th>
                <th className={th}>Categoria</th>
                <th className={th}>Priorità</th>
                <th className={th}>Stato</th>
                <th className={th}>Assegnatario</th>
                <th className={th}>Aperto il</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className={`${td} whitespace-nowrap`}>
                    <Link to={`/ticket/${t.id}`} className={link}>
                      {t.id}
                    </Link>
                  </td>
                  <td className={td}>{t.title}</td>
                  <td className={td}>{buildingName(t.buildingId)}</td>
                  <td className={td}>{t.category}</td>
                  <td className={td}>
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className={td}>
                    <TicketStatusBadge status={t.status} />
                  </td>
                  <td className={td}>{t.assignee ?? 'Non assegnato'}</td>
                  <td className={`${td} whitespace-nowrap`}>{formatDateTime(t.openedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
