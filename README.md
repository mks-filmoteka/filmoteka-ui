# Filmoteka UI

React UI for Filmoteka.

## Tech

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Keycloak
- Vitest

## Run locally

Use Node.js 24 and npm, matching the CI setup.

Copy [.env.example](.env.example) to `.env.local`. It contains the catalog, media, user and Keycloak URLs, with defaults for local development.

Install dependencies from the lockfile:

```bash
npm ci
```

Run dev server:

```bash
npm run dev
```

UI runs on:

```text
http://localhost:5173
```

Stop the dev server with `Ctrl+C`.

Catalog should be running on:

```text
http://localhost:8080
```

Media service should be running on:

```text
http://localhost:8081
```

For sign-in and personal film lists, also run the user service on [http://localhost:8082](http://localhost:8082) and Keycloak on [http://localhost:8180](http://localhost:8180).

The [shared Docker Compose setup](https://github.com/mks-filmoteka/filmoteka) provides these services and the Keycloak realm configuration.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run format:check
```

`lint` checks code and CSS, `test` runs the test suite, and `format:check` checks formatting.

To build and preview the production bundle locally, stop the dev server and run:

```bash
npm run build
npm run preview -- --port 5173 --strictPort
```

The preview uses port 5173 to match the default Keycloak and CORS settings. Stop it with `Ctrl+C`.
Build output is stored in `dist/`; delete that directory to clear it.

## Features

- film list
- film details
- create film
- edit film
- delete film
- actor page
- director page
- search
- filters
- sorting
- poster upload
- poster preview
- grid/list view
- sign-in and sign-out
- personal film lists

## Notes

- API and Keycloak URLs are configured through `VITE_*` environment variables. Restart the dev server after changing them, or rebuild for production.
- Sign-in uses the `filmoteka` realm and `filmoteka-ui` client in Keycloak.
- Catalog browsing is public. Personal film lists require sign-in; catalog editing and poster uploads require the `ADMIN` role.
- Posters are uploaded to `filmoteka-media`.
