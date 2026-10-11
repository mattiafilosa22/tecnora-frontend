import { Link } from 'react-router';
import { PageHeader } from '../components/PageHeader';
import { buttonPrimary, card, link } from '../components/styles';

const FLOWS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    text: 'Colpo d’occhio su edifici, attività in scadenza e ticket da gestire.',
  },
  {
    to: '/edifici',
    label: 'Edifici',
    text: 'Cerca un edificio e apri la sua scheda con referente, attività e ticket.',
  },
  {
    to: '/programma',
    label: 'Programma manutenzioni e pulizie',
    text: 'Segna un’attività come completata o pianificane una nuova.',
  },
  {
    to: '/ticket/nuovo',
    label: 'Apertura ticket',
    text: 'Segnala un guasto scegliendo edificio, categoria, priorità e allegati.',
  },
  {
    to: '/ticket',
    label: 'Gestione ticket',
    text: 'Filtra i ticket, assegna un tecnico, cambia lo stato e chiudi l’intervento.',
  },
];

export function IntroPage() {
  return (
    <>
      <PageHeader title="Prototipo Tecnora DFM" />
      <div className="max-w-3xl space-y-4 text-slate-700">
        <p>
          Questo prototipo serve a confermare insieme al committente i flussi principali e il
          perimetro dell’MVP di Tecnora DFM. Prototipo navigabile: non è il sistema definitivo.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Non è collegato a nessun sistema reale: nessun dato viene salvato o inviato.</li>
          <li>Edifici, persone, aziende e recapiti sono fittizi.</li>
          <li>
            Le modifiche restano solo nel browser e si perdono ricaricando la pagina o con
            «Ripristina dati di esempio».
          </li>
          <li>Grafica, testi e regole (stati, priorità, tempi) sono da validare.</li>
        </ul>
      </div>

      <h2 className="mt-8 mb-3 text-lg font-semibold text-slate-900">Flussi da provare</h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FLOWS.map((flow, i) => (
          <li key={flow.to} className={card}>
            <p className="text-xs font-medium text-slate-500">Flusso {i + 1}</p>
            <Link to={flow.to} className={link}>
              {flow.label}
            </Link>
            <p className="mt-1 text-sm text-slate-600">{flow.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <Link to="/dashboard" className={buttonPrimary}>
          Vai alla dashboard
        </Link>
      </div>
    </>
  );
}
