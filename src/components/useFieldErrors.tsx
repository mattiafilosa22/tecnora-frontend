import { useEffect, useState } from 'react';
import { fieldError } from './styles';

/**
 * Errori di validazione collegati ai campi: `aria-invalid`, `aria-describedby` verso il messaggio
 * e focus sul primo campo errato dopo un invio non valido. `fieldIds` va dichiarato fuori dal
 * componente, nell'ordine in cui i campi compaiono nel form.
 */
export function useFieldErrors<F extends string>(fieldIds: Record<F, string>) {
  const [errors, setErrors] = useState<Partial<Record<F, string>>>({});

  // Dopo il render: quando riceve il focus il campo ha già aria-invalid e la descrizione, così il
  // lettore di schermo legge subito l'errore.
  useEffect(() => {
    const first = (Object.keys(fieldIds) as F[]).find((field) => errors[field]);
    if (first) document.getElementById(fieldIds[first])?.focus();
  }, [errors, fieldIds]);

  const errorId = (field: F) => `${fieldIds[field]}-errore`;

  const errorProps = (field: F) =>
    errors[field] ? { 'aria-invalid': true, 'aria-describedby': errorId(field) } : {};

  const errorMessage = (field: F) =>
    errors[field] ? (
      <p id={errorId(field)} className={fieldError}>
        {errors[field]}
      </p>
    ) : null;

  return { errors, setErrors, errorProps, errorMessage };
}
