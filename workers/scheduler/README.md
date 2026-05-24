# Pawn Island Scheduler Worker

This Worker is the secure calendar backend for the static GitHub Pages scheduler.

The browser should never receive Google credentials. Deploy this Worker on Cloudflare, point `https://api.pawnislandacademy.com/scheduler` at it, and share the booking calendar with the Google service-account email.

## Required secrets

Set these with `wrangler secret put ...`:

```bash
wrangler secret put GOOGLE_CLIENT_EMAIL
wrangler secret put GOOGLE_PRIVATE_KEY
```

Optional email confirmations through Resend:

```bash
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_FROM
```

## Calendar setup

1. Create a Google Cloud service account with Calendar API enabled.
2. Create a JSON key for the service account.
3. Share the booking calendar with the service-account email with permission to make changes.
4. Put the service-account `client_email` into `GOOGLE_CLIENT_EMAIL`.
5. Put the `private_key` into `GOOGLE_PRIVATE_KEY`, preserving `\n` line breaks.
6. Set `GOOGLE_CALENDAR_ID` in `wrangler.toml` to the shared calendar ID.

The Worker uses Google Calendar FreeBusy to check conflicts and Events Insert to create confirmed bookings.

## D1 setup

```bash
wrangler d1 create pawn-island-scheduler
wrangler d1 execute pawn-island-scheduler --file=./schema.sql
```

Copy the generated `database_id` into `wrangler.toml`.

## Deploy

```bash
cd workers/scheduler
wrangler deploy
```

After deploy, update `data/scheduler-config.json` if the public Worker route differs from:

```json
"apiBaseUrl": "https://api.pawnislandacademy.com/scheduler"
```

## API

- `GET /scheduler/event-types`
- `GET /scheduler/availability?eventType=private-online-60&from=2026-06-01&days=21&timeZone=America/New_York`
- `POST /scheduler/holds`
- `POST /scheduler/bookings`
