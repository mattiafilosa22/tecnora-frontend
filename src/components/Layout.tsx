import { Link, NavLink, Outlet } from 'react-router';
import { usePrototype } from '../prototype/context';
import { createSeed } from '../prototype/seed';
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

export function Layout() {
  const { dispatch, today } = usePrototype();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
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
          <button
            type="button"
            className="font-medium underline underline-offset-2 hover:text-amber-700"
            onClick={() => dispatch({ type: 'reset', state: createSeed(today) })}
          >
            Ripristina dati di esempio
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
