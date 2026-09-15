# ADR-0012: Frontend serving and API origin

Date: 2026-09-15
Status: Accepted

## Context

The browser must reach both the React app and the API, in dev and in compose. An
undecided origin story means either CORS configuration to maintain or a muddied
topology.

## Decision

One origin everywhere; the app always calls same-origin `/api`:

- **Dev:** the Vite dev server proxies `/api` to the Fastify server. No CORS code
  anywhere.
- **Compose:** an nginx container serves the built frontend and reverse-proxies
  `/api` to the server container — the edge/static-plus-API shape the production
  topology uses.

## Consequences

- No CORS headers, no origin allowlists, nothing to misconfigure.
- Dev and compose behave identically from the browser's perspective.
- The system diagram's edge layer maps directly onto the compose setup.
