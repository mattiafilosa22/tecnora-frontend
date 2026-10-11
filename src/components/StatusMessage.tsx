import { useEffect, useRef, useState } from 'react';
import { notice } from './styles';

interface StatusMessageProps {
  message?: string;
  className?: string;
}

/**
 * Regione live sempre presente nel DOM: il testo viene inserito dopo il montaggio, perché i
 * lettori di schermo annunciano solo i cambiamenti di una regione già esistente.
 */
export function StatusMessage({ message, className = notice }: StatusMessageProps) {
  const [shown, setShown] = useState<string>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShown(message);
    // Porta in vista il messaggio quando l'azione è avvenuta più in basso nella pagina.
    if (message) ref.current?.scrollIntoView?.({ block: 'nearest' });
  }, [message]);

  return (
    <div ref={ref} role="status">
      {shown && <p className={className}>{shown}</p>}
    </div>
  );
}
