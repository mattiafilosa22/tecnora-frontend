import { Link } from 'react-router';
import { DueBadge, PriorityBadge, TicketStatusBadge } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import { buttonPrimary, buttonSecondary, card, link } from '../components/styles';
import { usePrototype } from '../prototype/context';
import { PRIORITY_RANK, dueStatus, formatDate } from '../prototype/format';

export function DashboardPage() {
  const { state, today } = usePrototype();
  const buildingName = (id: string) => state.buildings.find((b) => b.id === id)?.name ?? '—';

  const dueSoon = state.activities.filter((a) => dueStatus(a.nextDue, today) !== 'programmata');
  const overdue = dueSoon.filter((a) => dueStatus(a.nextDue, today) === 'scaduta').length;
  const upcoming = [...state.activities]
    .sort((a, b) => a.nextDue.localeCompare(b.nextDue))
    .slice(0, 5);

  const openTickets = state.tickets
    .filter((t) => t.status !== 'chiuso')
    .sort(
      (a, b) =>
        PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
        b.openedAt.localeCompare(a.openedAt),
    );
  const urgent = openTickets.filter((t) => t.priority === 'urgente').length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Situazione sintetica di edifici, attività programmate e ticket di pronto intervento."
        actions={
          <>
            <Link to="/ticket/nuovo" className={buttonPrimary}>
              Apri un ticket
            </Link>
            <Link to="/programma/nuova" className={buttonSecondary}>
              Pianifica attività
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/edifici" className={`${card} block hover:border-blue-300`}>
          <p className="text-sm text-slate-600">Edifici gestiti</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{state.buildings.length}</p>
          <p className="mt-1 text-sm text-slate-500">Vai all’elenco edifici</p>
        </Link>
        <Link to="/programma" className={`${card} block hover:border-blue-300`}>
          <p className="text-sm text-slate-600">Attività da fare entro 7 giorni</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{dueSoon.length}</p>
          <p className="mt-1 text-sm text-slate-500">di cui {overdue} già scadute</p>
        </Link>
        <Link to="/ticket?stato=da_gestire" className={`${card} block hover:border-blue-300`}>
          <p className="text-sm text-slate-600">Ticket da gestire (non ancora chiusi)</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{openTickets.length}</p>
          <p className="mt-1 text-sm text-slate-500">di cui {urgent} urgenti</p>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Prossime attività</h2>
          <ul className="divide-y divide-slate-100">
            {upcoming.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-slate-500">
                    {buildingName(a.buildingId)} · {formatDate(a.nextDue)}
                  </p>
                </div>
                <DueBadge status={dueStatus(a.nextDue, today)} />
              </li>
            ))}
          </ul>
          <Link to="/programma" className={`${link} mt-3 inline-block text-sm`}>
            Vedi tutto il programma
          </Link>
        </section>

        <section className={card}>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Ticket da gestire</h2>
          {openTickets.length === 0 ? (
            <p className="text-slate-500">Nessun ticket da gestire.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {openTickets.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div>
                    <Link to={`/ticket/${t.id}`} className={link}>
                      {t.id} · {t.title}
                    </Link>
                    <p className="text-sm text-slate-500">{buildingName(t.buildingId)}</p>
                  </div>
                  <div className="flex gap-1">
                    <PriorityBadge priority={t.priority} />
                    <TicketStatusBadge status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
