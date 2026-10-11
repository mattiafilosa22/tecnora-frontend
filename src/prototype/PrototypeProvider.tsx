import { useMemo, useReducer, useState, type ReactNode } from 'react';
import { PrototypeContext } from './context';
import { todayIso } from './format';
import { reducer } from './reducer';
import { createSeed } from './seed';

// Lo stato vive solo in memoria: ricaricando la pagina si torna ai dati di esempio.
export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createSeed(todayIso()));
  const [today] = useState(todayIso);
  const value = useMemo(() => ({ state, dispatch, today }), [state, today]);

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}
