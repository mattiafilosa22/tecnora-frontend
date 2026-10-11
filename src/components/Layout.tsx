import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { usePrototype } from '../prototype/context';
import { createSeed } from '../prototype/seed';
import { StatusMessage } from './StatusMessage';
import { buttonPrimary } from './styles';

const NAV_ITEMS = [
  { to: '/', label: 'Introduzione', end: true },
  { to: '/dashboard', label: 'Dashboard', end: false },
  { to: '/edifici', label: 'Edifici', end: false },
  { to: '/programma', label: 'Programma attività', end: false },
  { to: '/ticket', label: 'Ticket', end: false },
];

const navLinkBase = 'inline-block border-b-2 px-3 py-2 text-sm font-medium';

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? `${navLinkBase} border-blue-700 text-blue-700`
    : `${navLinkBase} border-transparent text-slate-600 hover:text-slate-900`;
}

const bannerButton = 'font-medium underline underline-offset-2 hover:text-amber-700';

export function Layout() {
  const { dispatch, today } = usePrototype();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const lastPathname = useRef(pathname);

  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string>();
  const resetButton = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  // A ogni cambio di pagina il focus va sul titolo, così i lettori di schermo annunciano la
  // nuova schermata. Al primo caricamento si lascia il focus dove lo mette il browser.
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    setResetMessage(undefined);
    mainRef.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [pathname]);

  useEffect(() => {
    if (confirmingReset) confirmButton.current?.focus();
    else if (wasConfirming.current) resetButton.current?.focus();
    wasConfirming.current = confirmingReset;
  }, [confirmingReset]);

  const reset = () => {
    dispatch({ type: 'reset', state: createSeed(today) });
    setConfirmingReset(false);
    setResetMessage(
      'Dati di esempio ripristinati: le modifiche fatte durante la demo sono state annullate.',
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-blue-700 focus:shadow"
      >
        Vai al contenuto
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-lg font-bold text-slate-900">
              Tecnora DFM
            </Link>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
              Prototipo · dati fittizi
            </span>
          </div>
          <Link to="/ticket/nuovo" className={buttonPrimary}>
            Apri un ticket
          </Link>
        </div>
        <nav aria-label="Navigazione principale" className="mx-auto max-w-6xl overflow-x-auto px-4">
          <ul className="flex gap-1 whitespace-nowrap">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={navLinkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm text-amber-900">
          <p>
            Prototipo per validare flussi e perimetro: i dati sono di esempio e le modifiche si
            perdono ricaricando la pagina.
          </p>
          {confirmingReset ? (
            <div className="flex flex-wrap items-center gap-3">
              <span>Annullare tutte le modifiche fatte durante la demo?</span>
              <button ref={confirmButton} type="button" className={bannerButton} onClick={reset}>
                Sì, ripristina
              </button>
              <button
                type="button"
                className={bannerButton}
                onClick={() => setConfirmingReset(false)}
              >
                No, mantieni le modifiche
              </button>
            </div>
          ) : (
            <button
              ref={resetButton}
              type="button"
              className={bannerButton}
              onClick={() => {
                setResetMessage(undefined);
                setConfirmingReset(true);
              }}
            >
              Ripristina dati di esempio
            </button>
          )}
        </div>
        <div className="mx-auto max-w-6xl px-4">
          <StatusMessage
            message={resetMessage}
            className="pb-2 text-sm font-medium text-amber-900"
          />
        </div>
      </div>

      <main
        ref={mainRef}
        id="contenuto"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-6 focus:outline-none"
      >
        <Outlet />
      </main>
    </div>
  );
}
