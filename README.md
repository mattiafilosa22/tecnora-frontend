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
