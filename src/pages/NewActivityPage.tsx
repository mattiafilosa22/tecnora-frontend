import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import {
  buttonPrimary,
  buttonSecondary,
  card,
  fieldError,
  fieldInput,
  fieldLabel,
} from '../components/styles';
import { usePrototype } from '../prototype/context';
import {
  ACTIVITY_KINDS,
  FREQUENCIES,
  FREQUENCY_LABEL,
  KIND_LABEL,
  TEAM,
  nextActivityId,
} from '../prototype/format';
import type { ActivityKind, Frequency } from '../prototype/types';

export function NewActivityPage() {
  const { state, dispatch, today } = usePrototype();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [buildingId, setBuildingId] = useState(searchParams.get('edificio') ?? '');
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<ActivityKind>('manutenzione');
  const [frequency, setFrequency] = useState<Frequency>('mensile');
  const [nextDue, setNextDue] = useState(today);
  const [assignee, setAssignee] = useState(TEAM[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!state.buildings.some((b) => b.id === buildingId)) found.building = 'Scegli un edificio.';
    if (!title.trim()) found.title = 'Scrivi una descrizione.';
    if (!nextDue) found.nextDue = 'Indica la data della prima scadenza.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const cleanTitle = title.trim();
    dispatch({
      type: 'createActivity',
      activity: {
        id: nextActivityId(state.activities),
        buildingId,
        title: cleanTitle,
        kind,
        frequency,
        nextDue,
        assignee,
        notes: notes.trim() || undefined,
      },
    });
    navigate('/programma', {
      state: { message: `Attività «${cleanTitle}» aggiunta al programma.` },
    });
  };

  return (
    <>
      <PageHeader
        title="Nuova attività ricorrente"
        description="Pianifica una manutenzione o una pulizia che si ripete nel tempo. Dopo ogni completamento la scadenza avanza in base alla frequenza scelta."
      />

      <form onSubmit={handleSubmit} noValidate className={`${card} max-w-2xl space-y-4`}>
        <div>
          <label htmlFor="attivita-edificio" className={fieldLabel}>
            Edificio
          </label>
          <select
            id="attivita-edificio"
            className={fieldInput}
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
          >
            <option value="">Scegli un edificio…</option>
            {state.buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.building && (
            <p role="alert" className={fieldError}>
              {errors.building}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="attivita-titolo" className={fieldLabel}>
            Descrizione attività
          </label>
          <input
            id="attivita-titolo"
            className={fieldInput}
            placeholder="Es. Pulizia parcheggio interrato"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && (
            <p role="alert" className={fieldError}>
              {errors.title}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="attivita-tipo" className={fieldLabel}>
              Tipo
            </label>
            <select
              id="attivita-tipo"
              className={fieldInput}
              value={kind}
              onChange={(e) => setKind(e.target.value as ActivityKind)}
            >
              {ACTIVITY_KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="attivita-frequenza" className={fieldLabel}>
              Frequenza
            </label>
            <select
              id="attivita-frequenza"
              className={fieldInput}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {FREQUENCY_LABEL[f]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="attivita-scadenza" className={fieldLabel}>
              Prima scadenza
            </label>
            <input
              id="attivita-scadenza"
              type="date"
              className={fieldInput}
              value={nextDue}
              onChange={(e) => setNextDue(e.target.value)}
            />
            {errors.nextDue && (
              <p role="alert" className={fieldError}>
                {errors.nextDue}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="attivita-assegnatario" className={fieldLabel}>
              Assegnatario
            </label>
            <select
              id="attivita-assegnatario"
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
        </div>

        <div>
          <label htmlFor="attivita-note" className={fieldLabel}>
            Note
          </label>
          <textarea
            id="attivita-note"
            rows={3}
            className={fieldInput}
            placeholder="Facoltative: indicazioni per chi svolge l’attività"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className={buttonPrimary}>
            Salva attività
          </button>
          <Link to="/programma" className={buttonSecondary}>
            Annulla
          </Link>
        </div>
      </form>
    </>
  );
}
