import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import {
  buttonPrimary,
  buttonSecondary,
  card,
  fieldInput,
  fieldLabel,
  warning,
} from '../components/styles';
import { useFieldErrors } from '../components/useFieldErrors';
import { usePrototype } from '../prototype/context';
import {
  PRIORITY_HELP,
  PRIORITY_LABEL,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  nextTicketId,
  nowIso,
} from '../prototype/format';
import type { Attachment, TicketCategory, TicketPriority } from '../prototype/types';

type Field = 'building' | 'title' | 'description';

// Nell'ordine in cui compaiono nel form: il focus va al primo campo con errore.
const FIELD_ID: Record<Field, string> = {
  building: 'ticket-edificio',
  title: 'ticket-titolo',
  description: 'ticket-descrizione',
};

export function NewTicketPage() {
  const { state, dispatch } = usePrototype();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedBuilding = searchParams.get('edificio');
  const unknownBuilding =
    requestedBuilding !== null && !state.buildings.some((b) => b.id === requestedBuilding);

  const [buildingId, setBuildingId] = useState(unknownBuilding ? '' : (requestedBuilding ?? ''));
  const [category, setCategory] = useState<TicketCategory>('Altro');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('media');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { setErrors, errorProps, errorMessage } = useFieldErrors(FIELD_ID);

  const addFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments((current) => [
      ...current,
      ...files.map((f) => ({ name: f.name, sizeKb: Math.ceil(f.size / 1024) })),
    ]);
    // Permette di selezionare di nuovo lo stesso file dopo averlo rimosso.
    e.target.value = '';
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found: Partial<Record<Field, string>> = {};
    if (!state.buildings.some((b) => b.id === buildingId)) found.building = 'Scegli un edificio.';
    if (!title.trim()) found.title = 'Scrivi un titolo breve.';
    if (!description.trim()) found.description = 'Descrivi il problema.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const id = nextTicketId(state.tickets);
    const at = nowIso();
    dispatch({
      type: 'createTicket',
      ticket: {
        id,
        buildingId,
        category,
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'aperto',
        attachments,
        openedAt: at,
        history: [{ at, text: 'Ticket aperto' }],
      },
    });
    navigate(`/ticket/${id}`, {
      state: { message: `Ticket ${id} aperto. Ora può essere preso in carico da un tecnico.` },
    });
  };

  return (
    <>
      <PageHeader
        title="Apri un ticket"
        description="Segnala un guasto o un intervento urgente. Il ticket viene preso in carico da un tecnico, che lo aggiorna fino alla chiusura."
      />

      {unknownBuilding && (
        <p className={`${warning} max-w-2xl`}>
          L’edificio indicato nel link («{requestedBuilding}») non esiste nei dati di esempio:
          sceglilo dall’elenco qui sotto.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className={`${card} max-w-2xl space-y-4`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ticket-edificio" className={fieldLabel}>
              Edificio
            </label>
            <select
              id="ticket-edificio"
              className={fieldInput}
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              {...errorProps('building')}
            >
              <option value="">Scegli un edificio…</option>
              {state.buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errorMessage('building')}
          </div>
          <div>
            <label htmlFor="ticket-categoria" className={fieldLabel}>
              Categoria
            </label>
            <select
              id="ticket-categoria"
              className={fieldInput}
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
            >
              {TICKET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="ticket-titolo" className={fieldLabel}>
            Titolo
          </label>
          <input
            id="ticket-titolo"
            className={fieldInput}
            maxLength={80}
            placeholder="Es. Perdita d’acqua nel bagno del 1° piano"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            {...errorProps('title')}
          />
          {errorMessage('title')}
        </div>

        <div>
          <label htmlFor="ticket-descrizione" className={fieldLabel}>
            Descrizione
          </label>
          <textarea
            id="ticket-descrizione"
            rows={4}
            className={fieldInput}
            placeholder="Cosa succede, dove esattamente, da quando"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            {...errorProps('description')}
          />
          {errorMessage('description')}
        </div>

        <fieldset>
          <legend className={fieldLabel}>Priorità</legend>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {TICKET_PRIORITIES.map((p) => (
              <div key={p} className="flex gap-2 rounded-md border border-slate-200 p-2">
                <input
                  id={`priorita-${p}`}
                  type="radio"
                  name="priorita"
                  value={p}
                  checked={priority === p}
                  onChange={() => setPriority(p)}
                  aria-describedby={`priorita-${p}-aiuto`}
                  className="mt-1"
                />
                <div>
                  <label htmlFor={`priorita-${p}`} className="text-sm font-medium">
                    {PRIORITY_LABEL[p]}
                  </label>
                  <p id={`priorita-${p}-aiuto`} className="text-xs text-slate-500">
                    {PRIORITY_HELP[p]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="ticket-allegati" className={fieldLabel}>
            Allegati (simulati)
          </label>
          <input
            id="ticket-allegati"
            type="file"
            multiple
            className="mt-1 block text-sm"
            onChange={addFiles}
          />
          <p className="mt-1 text-xs text-slate-500">
            I file non vengono caricati: il prototipo ne conserva solo il nome.
          </p>
          {attachments.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm">
              {attachments.map((a, i) => (
                <li key={`${a.name}-${i}`} className="flex items-center gap-2">
                  <span>
                    {a.name} ({a.sizeKb} KB)
                  </span>
                  <button
                    type="button"
                    className="text-red-700 underline"
                    aria-label={`Rimuovi ${a.name}`}
                    onClick={() => setAttachments((current) => current.filter((_, j) => j !== i))}
                  >
                    Rimuovi
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className={buttonPrimary}>
            Invia ticket
          </button>
          <Link to="/ticket" className={buttonSecondary}>
            Annulla
          </Link>
        </div>
      </form>
    </>
  );
}
