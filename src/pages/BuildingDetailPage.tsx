import { Link, useParams } from 'react-router';
import { DueBadge, PriorityBadge, TicketStatusBadge } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import { buttonPrimary, buttonSecondary, card, link } from '../components/styles';
import { usePrototype } from '../prototype/context';
import { FREQUENCY_LABEL, KIND_LABEL, dueStatus, formatDate } from '../prototype/format';
import type { Activity } from '../prototype/types';

const activitySummary = (a: Activity) =>
  `${KIND_LABEL[a.kind]} · ${FREQUENCY_LABEL[a.frequency]} · prossima scadenza ${formatDate(a.nextDue)}`;

export function BuildingDetailPage() {
  const { id } = useParams();
  const { state, today } = usePrototype();
  const building = state.buildings.find((b) => b.id === id);

  if (!building) {
    return (
      <>
        <PageHeader title="Edificio non trovato" />
        <Link to="/edifici" className={link}>
          Torna agli edifici
        </Link>
      </>
    );
  }

  const activities = state.activities
    .filter((a) => a.buildingId === building.id)
    .sort((a, b) => a.nextDue.localeCompare(b.nextDue));
  const tickets = state.tickets
    .filter((t) => t.buildingId === building.id)
    .sort((a, b) => Number(a.status === 'chiuso') - Number(b.status === 'chiuso'));
  const { contact } = building;

  return (
    <>
      <Link to="/edifici" className={`${link} text-sm`}>
        ← Tutti gli edifici
      </Link>
      <PageHeader
        title={building.name}
        description={`${building.address}, ${building.city}`}
        actions={
          <>
            <Link to={`/ticket/nuovo?edificio=${building.id}`} className={buttonPrimary}>
              Apri ticket per questo edificio
            </Link>
            <Link to={`/programma/nuova?edificio=${building.id}`} className={buttonSecondary}>
              Pianifica attività
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Dati anagrafici</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-slate-500">Codice</dt>
            <dd>{building.code}</dd>
            <dt className="text-slate-500">Tipo</dt>
            <dd>{building.type}</dd>
            <dt className="text-slate-500">Superficie</dt>
            <dd>{building.surfaceSqm.toLocaleString('it-IT')} m²</dd>
            <dt className="text-slate-500">Indirizzo</dt>
            <dd>
              {building.address}, {building.city}
            </dd>
          </dl>
        </section>

        <section className={card}>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Referente</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-slate-500">Nome</dt>
            <dd>{contact.name}</dd>
            <dt className="text-slate-500">Ruolo</dt>
            <dd>{contact.role}</dd>
            <dt className="text-slate-500">Telefono</dt>
            <dd>{contact.phone}</dd>
            <dt className="text-slate-500">Email</dt>
            <dd>
              <a href={`mailto:${contact.email}`} className={link}>
                {contact.email}
              </a>
            </dd>
          </dl>
        </section>

        <section className={card}>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Attività programmate</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500">Nessuna attività programmata.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activities.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-slate-500">{activitySummary(a)}</p>
                  </div>
                  <DueBadge status={dueStatus(a.nextDue, today)} />
                </li>
              ))}
            </ul>
          )}
          <Link
            to={`/programma?edificio=${building.id}`}
            className={`${link} mt-3 inline-block text-sm`}
          >
            Vedi nel programma
          </Link>
        </section>

        <section className={card}>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Ticket</h2>
          {tickets.length === 0 ? (
            <p className="text-sm text-slate-500">Nessun ticket per questo edificio.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <Link to={`/ticket/${t.id}`} className={link}>
                    {t.id} · {t.title}
                  </Link>
                  <div className="flex gap-1">
                    <PriorityBadge priority={t.priority} />
                    <TicketStatusBadge status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            to={`/ticket?edificio=${building.id}`}
            className={`${link} mt-3 inline-block text-sm`}
          >
            Vedi tutti i ticket dell’edificio
          </Link>
        </section>
      </div>
    </>
  );
}
