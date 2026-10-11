import { createContext, useContext, type Dispatch } from 'react';
import type { Action } from './reducer';
import type { PrototypeState } from './types';

export interface PrototypeContextValue {
  state: PrototypeState;
  dispatch: Dispatch<Action>;
  /** Data odierna (YYYY-MM-DD), fissata all'avvio del prototipo. */
  today: string;
}

export const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function usePrototype(): PrototypeContextValue {
  const value = useContext(PrototypeContext);
  if (!value) {
    throw new Error('usePrototype va usato dentro <PrototypeProvider>');
  }
  return value;
}
