// Classi Tailwind condivise da pulsanti, campi e riquadri del prototipo.

export const buttonPrimary =
  'inline-flex items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

export const buttonSecondary =
  'inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

// Sottolineato anche a riposo: il colore da solo non basta a riconoscere un link (WCAG 1.4.1).
export const link =
  'rounded-sm font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900 hover:decoration-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

export const card = 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm';

export const fieldLabel = 'block text-sm font-medium text-slate-700';

export const fieldInput =
  'mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 aria-invalid:border-red-600';

export const fieldError = 'mt-1 text-sm text-red-700';

export const notice =
  'mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-900';

export const warning =
  'mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900';

export const table = 'min-w-full divide-y divide-slate-200 text-left text-sm';

export const th = 'px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500';

export const td = 'px-3 py-2 align-top';

/** Colonne secondarie: nascoste sugli schermi stretti per non far scorrere la tabella. */
export const desktopOnly = 'hidden md:table-cell';

/** Riepilogo delle colonne nascoste, mostrato solo sugli schermi stretti. */
export const mobileOnly = 'md:hidden';
