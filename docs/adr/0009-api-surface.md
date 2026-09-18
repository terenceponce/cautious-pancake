# ADR-0009: API surface and purchase outcome semantics

Date: 2026-09-15
Status: Accepted

## Context

The brief requires status, purchase, and purchase-check endpoints. The frontend and
the shared types package both consume these shapes, so they need to be decided once,
up front.

## Decision

Three routes under `/api`, shapes defined in `packages/api-types`:

- `GET /api/sale/status` → `{ status: 'upcoming' | 'active' | 'ended', startsAt, endsAt, stockRemaining }`
- `POST /api/purchase` with `{ userId }` → outcome enum in the body plus a matching
  status code:
  - `success` — 200
  - `already_purchased` — 409
  - `sold_out` — 410
  - `sale_not_active` — 403 (before start or after end)
  - invalid userId — 400
- `GET /api/purchase/:userId` → `{ purchased: boolean }` — 200 either way; the
  answer is data, not an error.

Check order on the purchase route: sale window first (cheap clock read, fails fast
outside the window), then the store's check-and-decrement. Outcome ordering matches
the store: `already_purchased` wins over `sold_out` when both are true.

`userId` is a free-form identifier with no authentication — per the brief, "enter a
user identifier" is the whole identity model. One-per-user is enforced per identifier.

Alternatives considered for identity:

- **Self-minted JWT** (login endpoint issuing tokens for any username): a JWT's value
  comes from a trusted issuer verifying identity first; with no user store or IdP,
  this is cryptographically decorated but security-identical to a bare `userId`.
- **JWT with a simulated IdP**: verified `Authorization: Bearer` on purchase/check,
  dev-only token endpoint framed as the IdP mock. Production API shape at ~half a
  day's cost; defensible, but spends scope the brief spends elsewhere.
- **Real auth (e.g. Better Auth)**: proper accounts, but drags in a database, schema,
  signup/login UI, and a day of work for a requirement nobody asked for — and adds
  register/login friction to the one flow the brief wants smooth.

In production, `userId` would come from a verified JWT/session claim and the
`SaleStore` contract would be unchanged.

## Consequences

- The frontend branches on one enum; the HTTP codes are for correctness tooling,
  not for the UI.
- `stockRemaining` in status keeps scarcity visible without extra endpoints.
- No auth means a user could enter different identifiers; that limitation is
  inherent to the brief and stays out of scope.

## Amendments

- 2026-09-18 [#11](https://github.com/terenceponce/cautious-pancake/pull/11): `GET /api/sale/status` additionally returns `stockTotal` — additive, needed by the frontend's scarcity bar. No behavior or auth changes.
