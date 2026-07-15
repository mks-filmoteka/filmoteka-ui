# Filmoteka UI

React UI for Filmoteka.

## Tech

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Vitest

## Run locally

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

UI runs on:

```text
http://localhost:5173
```

Backend should be running on:

```text
http://localhost:8080
```

Media service should be running on:

```text
http://localhost:8081
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
```

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

## Notes

- API URLs are currently hardcoded.
- No login/security yet.
- User is treated as admin for now.
- Posters are uploaded to `filmoteka-media`.
