# tecnora-frontend

Tecnora — frontend admin (React, TanStack Query, Tailwind)

## Requisiti

- Node.js 20+
- npm

## Setup

```sh
cp .env.example .env
npm ci
npm run dev
```

L'app è disponibile su http://localhost:5173.

## Prototipo MVP (dati fittizi)

L'app contiene un prototipo navigabile di Tecnora DFM, pensato per confermare con il committente i
flussi principali e il perimetro dell'MVP. Non è il sistema definitivo e non ha integrazione con
le API: `VITE_API_URL` non è usata dal prototipo.

Edifici, referenti, aziende e recapiti sono inventati. I dati vivono solo in memoria: ricaricando
la pagina, o con il pulsante «Ripristina dati di esempio», si torna alla situazione iniziale. Le
scadenze sono calcolate rispetto alla data del giorno, quindi la demo resta attuale.

### Avvio

```sh
npm ci
npm run dev
```

Aprire http://localhost:5173.

### Schermate

| Percorso           | Schermata                                                    |
| ------------------ | ------------------------------------------------------------ |
| `/`                | Introduzione: scopo del prototipo e flussi da provare        |
| `/dashboard`       | Edifici gestiti, attività entro 7 giorni, ticket da gestire  |
| `/edifici`         | Elenco edifici con ricerca e filtro per tipo                 |
| `/edifici/:id`     | Scheda edificio: dati, referente, attività e ticket          |
| `/programma`       | Programma manutenzioni e pulizie, con completamento attività |
| `/programma/nuova` | Nuova attività ricorrente                                    |
| `/ticket`          | Elenco ticket con filtri per stato, priorità ed edificio     |
| `/ticket/nuovo`    | Apertura ticket con allegati simulati                        |
| `/ticket/:id`      | Dettaglio ticket: cronologia, assegnazione, stato e chiusura |

### Demo per il committente

1. **Introduzione** (`/`): spiegare che è un prototipo con dati fittizi, utile a validare flussi e
   perimetro.
2. **Dashboard**: leggere le tre card (edifici, attività entro 7 giorni, ticket aperti) e le liste
   «Prossime attività» e «Ticket da gestire».
3. **Edifici**: cercare «Tigli», aprire «Sede Uffici Via dei Tigli» e mostrare dati anagrafici,
   referente, attività e ticket dell'edificio.
4. **Programma**: premere «Segna come completata» su un'attività scaduta e leggere la nuova
   scadenza; poi «Nuova attività» e salvare un'attività ricorrente.
5. **Apri un ticket**: scegliere edificio, categoria e priorità, scrivere titolo e descrizione,
   allegare una foto (simulata) e inviare.
6. **Dettaglio ticket**: «Assegna e prendi in carico», poi «Metti in attesa» e «Riprendi
   lavorazione», infine scrivere la nota e «Chiudi ticket». Mostrare la cronologia.
7. **Ticket**: filtrare per stato, priorità o edificio e usare «Azzera filtri».

Da confermare con il committente: stati dei ticket, livelli di priorità e tempi indicativi,
categorie, regola di ricorrenza (la scadenza avanza mantenendo la cadenza) e assegnatari.

## Variabili d'ambiente

| Variabile      | Default                     | Descrizione         |
| -------------- | --------------------------- | ------------------- |
| `VITE_API_URL` | `http://localhost:8000/api` | URL base delle API. |

`VITE_API_URL` è risolta in fase di build da Vite: per cambiarla serve una nuova build.

## Script

| Comando                | Descrizione                                |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Server di sviluppo Vite                    |
| `npm run build`        | Typecheck e build di produzione in `dist/` |
| `npm run preview`      | Anteprima locale della build               |
| `npm run lint`         | ESLint                                     |
| `npm run typecheck`    | Controllo dei tipi TypeScript              |
| `npm test`             | Test Vitest (esecuzione singola)           |
| `npm run test:watch`   | Test Vitest in watch mode                  |
| `npm run format`       | Formatta i file con Prettier               |
| `npm run format:check` | Verifica la formattazione Prettier         |

## Docker

### Sviluppo

```sh
docker compose up --build
```

Avvia Vite in ascolto su `0.0.0.0:5173`, con il codice montato come volume: http://localhost:5173.

Su Docker Desktop (macOS/Windows) l'HMR può non rilevare le modifiche ai file: in quel caso avviare
con `VITE_USE_POLLING=true docker compose up --build`.

### Produzione

```sh
docker build --target production --build-arg VITE_API_URL=https://api.example.com/api -t tecnora-frontend .
docker run -p 8080:80 tecnora-frontend
```

L'immagine serve la build con nginx, con fallback SPA su `index.html`. `VITE_API_URL` va passata
come `--build-arg`: non viene letta a runtime.

## CI

GitHub Actions esegue lint, typecheck, test e build a ogni push su `main` e `develop` e a ogni pull
request.

## Note

`package-lock.json` è versionato: installare le dipendenze con `npm ci`.
