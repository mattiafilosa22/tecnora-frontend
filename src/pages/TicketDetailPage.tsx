import { useState, type FormEvent } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { PriorityBadge, TicketStatusBadge } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import { StatusMessage } from '../components/StatusMessage';
import {
  buttonPrimary,
  buttonSecondary,
  card,
  fieldInput,
  fieldLabel,
  link,
} from '../components/styles';
import { useFieldErrors } from '../components/useFieldErrors';
import { usePrototype } from '../prototype/context';
import { STATUS_HELP, TEAM, formatDateTime, nowIso } from '../prototype/format';

const FIELD_ID = { closingNote: 'ticket-nota-chiusura' };

export function TicketDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { state, dispatch } = usePrototype();
  const ticket = state.tickets.find((t) => t.id === id);

  const [assignee, setAssignee] = useState(TEAM[0]);
  const [statusNote, setStatusNote] = useState('');
  const [closingNote, setClosingNote] = useState('');
  const { setErrors, errorProps, errorMessage } = useFieldErrors(FIELD_ID);
  const [message, setMessage] = useState<string>();

  if (!ticket) {
    return (
      <>
        <PageHeader title="Ticket non trovato" />
        <Link to="/ticket" className={link}>
          Torna ai ticket
        </Link>
      </>
    );
  }

  const building = state.buildings.find((b) => b.id === ticket.buildingId);
  const flashMessage = message ?? (location.state as { message?: string } | null)?.message;

  const assign = () => {
    dispatch({ type: 'assignTicket', id: ticket.id, assignee, at: nowIso() });
    setMessage(`Ticket assegnato a ${assignee}.`);
  };

  const changeStatus = (status: 'in_carico' | 'in_attesa') => {
    const note = statusNote.trim() || undefined;
    dispatch({ type: 'setTicketStatus', id: ticket.id, status, note, at: nowIso() });
    setStatusNote('');
    setMessage(status === 'in_attesa' ? 'Ticket messo in attesa.' : 'Lavorazione ripresa.');
  };

  const close = (e: FormEvent) => {
    e.preventDefault();
    const note = closingNote.trim();
    if (!note) {
      setErrors({ closingNote: 'Descrivi l’intervento svolto prima di chiudere.' });
      return;
    }
    dispatch({ type: 'closeTicket', id: ticket.id, note, at: nowIso() });
    setErrors({});
    setClosingNote('');
    setMessage('Ticket chiuso. L’intervento risulta concluso.');
  };

  const isClosed = ticket.status === 'chiuso';
  const closedAt = ticket.closedAt ? formatDateTime(ticket.closedAt) : '—';
  const history = [...ticket.history].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <>
      <Link to="/ticket" className={`${link} text-sm`}>
        ← Tutti i ticket
      </Link>
      <PageHeader title={`${ticket.id} · ${ticket.title}`} />

      <StatusMessage message={flashMessage} />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <TicketStatusBadge status={ticket.status} describe={false} />
        <PriorityBadge priority={ticket.priority} />
        <span className="text-sm text-slate-600">{STATUS_HELP[ticket.status]}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Riepilogo</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-slate-500">Edificio</dt>
              <dd>
                <Link to={`/edifici/${ticket.buildingId}`} className={link}>
                  {building?.name ?? '—'}
                </Link>
              </dd>
              <dt className="text-slate-500">Categoria</dt>
              <dd>{ticket.category}</dd>
              <dt className="text-slate-500">Aperto il</dt>
              <dd>{formatDateTime(ticket.openedAt)}</dd>
              <dt className="text-slate-500">Assegnatario</dt>
              <dd>{ticket.assignee ?? 'Non assegnato'}</dd>
              <dt className="text-slate-500">Descrizione</dt>
              <dd className="whitespace-pre-line">{ticket.description}</dd>
              <dt className="text-slate-500">Allegati</dt>
              <dd>
                {ticket.attachments.length === 0 ? (
                  'Nessun allegato'
                ) : (
                  <ul>
                    {ticket.attachments.map((a, i) => (
                      <li key={`${a.name}-${i}`}>
                        {a.name} <span className="text-slate-500">(simulato)</span>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </dl>
          </section>

          {isClosed ? (
            <section className={card}>
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Chiusura</h2>
              <p className="text-sm">Ticket chiuso il {closedAt} — Nota: {ticket.closingNote}</p>
            </section>
          ) : (
            <>
              <section className={card}>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Assegnazione</h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="grow">
                    <label htmlFor="ticket-tecnico" className={fieldLabel}>
                      Tecnico
                    </label>
                    <select
                      id="ticket-tecnico"
                      className={fieldInput}
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                    >
                      {TEAM.map((member) => (
                        <option key={member} value={member}>
                          {member}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="button" className={buttonPrimary} onClick={assign}>
                    Assegna e prendi in carico
                  </button>
                </div>
              </section>

              {(ticket.status === 'in_carico' || ticket.status === 'in_attesa') && (
                <section className={card}>
                  <h2 className="mb-3 text-lg font-semibold text-slate-900">Cambio stato</h2>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="grow">
                      <label htmlFor="ticket-nota-stato" className={fieldLabel}>
                        Nota (facoltativa)
                      </label>
                      <input
                        id="ticket-nota-stato"
                        className={fieldInput}
                        placeholder="Es. in attesa del ricambio"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                      />
                    </div>
                    {ticket.status === 'in_carico' ? (
                      <button
                        type="button"
                        className={buttonSecondary}
                        onClick={() => changeStatus('in_attesa')}
                      >
                        Metti in attesa
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={buttonSecondary}
                        onClick={() => changeStatus('in_carico')}
                      >
                        Riprendi lavorazione
                      </button>
                    )}
                  </div>
                </section>
              )}

              <section className={card}>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Chiusura</h2>
                <form onSubmit={close} noValidate className="space-y-2">
                  <label htmlFor="ticket-nota-chiusura" className={fieldLabel}>
                    Nota di chiusura
                  </label>
                  <textarea
                    id="ticket-nota-chiusura"
                    rows={3}
                    className={fieldInput}
                    placeholder="Cosa è stato fatto per risolvere il problema"
                    value={closingNote}
                    onChange={(e) => setClosingNote(e.target.value)}
                    {...errorProps('closingNote')}
                  />
                  {errorMessage('closingNote')}
                  <button type="submit" className={buttonPrimary}>
                    Chiudi ticket
                  </button>
                </form>
              </section>
            </>
          )}
        </div>

        <section className={card}>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Cronologia</h2>
          <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
            {history.map((event, i) => (
              <li key={`${event.at}-${i}`}>
                <p className="text-xs text-slate-500">{formatDateTime(event.at)}</p>
                <p className="text-sm">{event.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
