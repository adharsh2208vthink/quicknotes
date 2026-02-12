# QuickNotes

A simple notes API + UI for demoing Claude Code features.

## Build & Run

```bash
npm install          # Install dependencies
npm start            # Start server at http://localhost:3000
npm test             # Run Jest tests
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

## Architecture

- **src/app.js** — Express routes (GET/POST/PUT/DELETE /api/notes)
- **src/db.js** — SQLite database layer (better-sqlite3)
- **src/server.js** — Entry point
- **public/index.html** — Single-page vanilla JS frontend
- **tests/notes.test.js** — API tests (Jest + supertest)

## Conventions

- Use `better-sqlite3` for all database access (synchronous API)
- Routes go in `src/app.js`; extract to `src/routes/` if adding many endpoints
- Tags are stored as JSON arrays in SQLite TEXT columns
- All API responses are JSON
- Tests use supertest against the Express app (no server needed)
- Frontend is vanilla JS — no frameworks, no build step
