import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function section(heading: string) {
  const element = screen.getByRole('heading', { name: heading }).closest('section');
  if (!element) throw new Error(`Sezione «${heading}» non trovata`);
  return element;
}

/** Il messaggio di conferma visibile: le regioni live restano nel DOM anche quando sono vuote. */
function statusMessage() {
  const filled = screen.getAllByRole('status').filter((el) => el.textContent);
  expect(filled).toHaveLength(1);
  return filled[0];
}

function openNewTicket() {
  renderAt('/ticket/nuovo');
  fireEvent.change(screen.getByLabelText('Edificio'), { target: { value: 'ed-02' } });
  fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Idraulico' } });
  fireEvent.change(screen.getByLabelText('Titolo'), {
    target: { value: 'Perdita sotto il lavandino' },
  });
  fireEvent.change(screen.getByLabelText('Descrizione'), {
    target: { value: 'Acqua sul pavimento della portineria.' },
  });
  fireEvent.click(screen.getByLabelText('Alta'));
  fireEvent.change(screen.getByLabelText('Allegati (simulati)'), {
    target: { files: [new File(['x'], 'foto-guasto.jpg', { type: 'image/jpeg' })] },
  });
  expect(screen.getByText('foto-guasto.jpg (1 KB)')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Invia ticket' }));
}

describe('App', () => {
  it('mostra l’introduzione al prototipo', () => {
    renderAt('/');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Prototipo Tecnora DFM' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/non è il sistema definitivo/)).toBeInTheDocument();
  });

  it('dalla navigazione cerca un edificio e ne apre la scheda', () => {
    renderAt('/dashboard');
    const nav = screen.getByRole('navigation', { name: 'Navigazione principale' });
    fireEvent.click(within(nav).getByRole('link', { name: 'Edifici' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Edifici' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Cerca edificio'), { target: { value: 'tigli' } });
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.queryByRole('link', { name: 'Residence Parco Nord' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Sede Uffici Via dei Tigli' }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sede Uffici Via dei Tigli' }),
    ).toBeInTheDocument();
    expect(within(section('Referente')).getByText('Giulia Marchetti')).toBeInTheDocument();
  });

  it('dalla scheda edificio apre un ticket con l’edificio già scelto', () => {
    renderAt('/edifici/ed-03');
    fireEvent.click(screen.getByRole('link', { name: 'Apri ticket per questo edificio' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Apri un ticket' })).toBeInTheDocument();
    expect(screen.getByLabelText('Edificio')).toHaveValue('ed-03');
  });

  it('segna un’attività come completata e mostra la prossima scadenza', () => {
    renderAt('/programma');
    fireEvent.click(
      screen.getByRole('button', { name: 'Segna come completata: Pulizia uffici e servizi' }),
    );
    expect(statusMessage()).toHaveTextContent(
      /«Pulizia uffici e servizi» completata\. Prossima scadenza: /,
    );
  });

  it('crea una nuova attività dopo la validazione', () => {
    renderAt('/programma/nuova');
    fireEvent.click(screen.getByRole('button', { name: 'Salva attività' }));
    const building = screen.getByLabelText('Edificio');
    const title = screen.getByLabelText('Descrizione attività');
    expect(building).toHaveAttribute('aria-invalid', 'true');
    expect(building).toHaveAccessibleDescription('Scegli un edificio.');
    expect(title).toHaveAttribute('aria-invalid', 'true');
    expect(title).toHaveAccessibleDescription('Scrivi una descrizione.');
    expect(screen.getByLabelText('Prima scadenza')).not.toHaveAttribute('aria-invalid');
    expect(building).toHaveFocus();

    fireEvent.change(screen.getByLabelText('Edificio'), { target: { value: 'ed-05' } });
    fireEvent.change(screen.getByLabelText('Descrizione attività'), {
      target: { value: 'Pulizia parcheggio interrato' },
    });
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'pulizia' } });
    fireEvent.change(screen.getByLabelText('Frequenza'), { target: { value: 'trimestrale' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salva attività' }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Programma manutenzioni e pulizie' }),
    ).toBeInTheDocument();
    expect(statusMessage()).toHaveTextContent(
      'Attività «Pulizia parcheggio interrato» aggiunta al programma.',
    );
    const row = screen.getByText('Pulizia parcheggio interrato').closest('tr');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText('Trimestrale')).toBeInTheDocument();
  });

  it('apre un ticket con allegato simulato e mostra il dettaglio', () => {
    openNewTicket();
    expect(
      screen.getByRole('heading', { level: 1, name: 'TCK-1009 · Perdita sotto il lavandino' }),
    ).toBeInTheDocument();
    expect(statusMessage()).toHaveTextContent('Ticket TCK-1009 aperto.');
    expect(screen.getByText('Aperto')).toBeInTheDocument();
    expect(within(section('Riepilogo')).getByText('foto-guasto.jpg')).toBeInTheDocument();
    expect(within(section('Cronologia')).getByText('Ticket aperto')).toBeInTheDocument();
  });

  it('prende in carico, sospende e chiude il ticket', () => {
    openNewTicket();
    fireEvent.change(screen.getByLabelText('Tecnico'), {
      target: { value: 'Idrotermica Demo Srl' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Assegna e prendi in carico' }));
    expect(screen.getByText('In carico')).toBeInTheDocument();
    expect(
      within(section('Cronologia')).getByText('Assegnato a Idrotermica Demo Srl: presa in carico'),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nota (facoltativa)'), {
      target: { value: 'serve un ricambio' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Metti in attesa' }));
    expect(screen.getByText('In attesa')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Riprendi lavorazione' }));
    expect(screen.getByText('In carico')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Chiudi ticket' }));
    const closingNote = screen.getByLabelText('Nota di chiusura');
    expect(closingNote).toHaveAttribute('aria-invalid', 'true');
    expect(closingNote).toHaveAccessibleDescription(
      'Descrivi l’intervento svolto prima di chiudere.',
    );
    expect(closingNote).toHaveFocus();

    fireEvent.change(closingNote, {
      target: { value: 'Sostituito il sifone' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Chiudi ticket' }));
    expect(screen.getByText('Chiuso')).toBeInTheDocument();
    expect(
      screen.getByText(/Ticket chiuso il .* — Nota: Sostituito il sifone/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Chiudi ticket' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Assegna e prendi in carico' }),
    ).not.toBeInTheDocument();
  });

  it('filtra i ticket per stato dall’indirizzo', () => {
    renderAt('/ticket?stato=chiuso');
    expect(screen.getByLabelText('Stato')).toHaveValue('chiuso');
    expect(screen.getByText('2 ticket')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'TCK-1006' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'TCK-1007' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'TCK-1001' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Azzera filtri' }));
    expect(screen.getByText('8 ticket')).toBeInTheDocument();
  });

  it('dalla dashboard porta all’elenco con lo stesso numero di ticket da gestire', () => {
    renderAt('/dashboard');
    const cardLink = screen.getByRole('link', { name: /Ticket da gestire/ });
    expect(cardLink).toHaveTextContent('6');
    fireEvent.click(cardLink);
    expect(screen.getByLabelText('Stato')).toHaveValue('da_gestire');
    expect(screen.getByText('6 ticket')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'TCK-1006' })).not.toBeInTheDocument();
  });

  it('sposta il focus sul titolo e aggiorna il documento a ogni cambio di pagina', () => {
    renderAt('/dashboard');
    expect(document.title).toBe('Dashboard · Tecnora DFM (prototipo)');
    const nav = screen.getByRole('navigation', { name: 'Navigazione principale' });
    fireEvent.click(within(nav).getByRole('link', { name: 'Edifici' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Edifici' })).toHaveFocus();
    expect(document.title).toBe('Edifici · Tecnora DFM (prototipo)');
    expect(screen.getByRole('link', { name: 'Vai al contenuto' })).toHaveAttribute(
      'href',
      '#contenuto',
    );
  });

  it('chiede conferma prima di ripristinare i dati di esempio', () => {
    openNewTicket();
    fireEvent.click(screen.getByRole('button', { name: 'Ripristina dati di esempio' }));
    fireEvent.click(screen.getByRole('button', { name: 'No, mantieni le modifiche' }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'TCK-1009 · Perdita sotto il lavandino' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ripristina dati di esempio' })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Ripristina dati di esempio' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sì, ripristina' }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ticket non trovato' }),
    ).toBeInTheDocument();
    expect(statusMessage()).toHaveTextContent('Dati di esempio ripristinati');
  });

  it('avvisa se il link punta a un edificio inesistente', () => {
    renderAt('/ticket/nuovo?edificio=ed-99');
    expect(screen.getByText(/«ed-99»\) non esiste nei dati di esempio/)).toBeInTheDocument();
    expect(screen.getByLabelText('Edificio')).toHaveValue('');
  });

  it('mostra un messaggio per le pagine inesistenti', () => {
    renderAt('/rotta-inesistente');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Pagina non trovata' }),
    ).toBeInTheDocument();
  });
});
