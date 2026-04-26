# Express + Prisma + Google Sheets Bi-Directional Sync

This backend syncs `User` data between PostgreSQL (via Prisma) and Google Sheets.

If the required sync environment variables are missing, the server still boots and reports the missing configuration in `/health`, but sync routes return `503` until the missing values are provided.

## Features

- Dynamic field handling using table metadata and object keys.
- DB -> Sheet sync after Prisma create/update/delete routes.
- Sheet -> DB sync via `POST /sync-from-sheet`.
- Upsert + delete stale DB records not present in Sheet payload.
- Source flag (`db` | `sheet`) to prevent loop-back sync.
- Polling every 30 seconds by default.
- Error logging and centralized error handling.

## Run

1. Install dependencies:
   - `pnpm install`
2. Generate Prisma client:
   - `pnpm prisma generate`
3. Start backend:
   - `pnpm backend:dev`

Server defaults to `http://localhost:4000`.

## Environment Variables

Required:

- `DATABASE_URL`
- `GOOGLE_SYNC_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

Optional:

- `GOOGLE_SYNC_SHEET_NAME=Users`
- `SYNC_BACKEND_PORT=4000`
- `SYNC_POLL_INTERVAL_MS=30000`
- `SYNC_BACKEND_API_KEY=your-secret-key`

When `SYNC_BACKEND_API_KEY` is set, write routes expect either an `x-sync-api-key` header or an `apiKey` field in the JSON body.

For Google Apps Script, set the same value in `SYNC_API_KEY` so the trigger sends a matching header and body field.

You can also provide service account JSON using existing env support:

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`

## Routes

- `GET /health`
- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
- `POST /sync-to-sheet`
- `POST /sync-from-sheet`

### Request body format

For user mutations:

```json
{
  "source": "db",
  "data": {
    "name": "Alice",
    "email": "alice@example.com",
    "password": "hashed-password"
  }
}
```

For sync from sheet:

```json
{
  "source": "sheet",
  "rows": [
    { "id": 1, "name": "Alice", "email": "alice@example.com", "password": "hashed" }
  ]
}
```

Unknown keys are ignored automatically if they do not exist in the Prisma User table.
