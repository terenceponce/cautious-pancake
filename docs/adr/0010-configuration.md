# ADR-0010: Configuration via environment variables

Date: 2026-09-15
Status: Accepted

## Context

The sale window, stock, and store selection must be configurable per the brief, and
compose/dev/CI need to vary them without code changes.

## Decision

All configuration comes from environment variables, read once at startup and
validated with Zod:

- `PORT` (default 3000)
- `SALE_START`, `SALE_END` — ISO 8601 timestamps
- `STOCK` — positive integer
- `STORE` — `memory` (default) or `redis` (see [ADR-0005](0005-in-memory-plus-redis.md))
- `REDIS_URL` — used when `STORE=redis`

Dev uses a `.env` file; compose and CI set their own values.

The server clock is the authority: sale status is computed at request time from
`SALE_START`/`SALE_END`, not maintained as a cached state machine — no timers, no
drift between instances.

## Consequences

- One config mechanism for dev, compose, CI, and (documented) production.
- Changing the sale window mid-flight requires a restart; acceptable for this scope,
  noted rather than solved.
- Invalid config fails fast at boot with a clear message.
