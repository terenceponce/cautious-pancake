# Flash Sale System

A high-throughput flash sale platform (take-home project). Work in progress.

- [Project instructions](./INSTRUCTIONS.md)

## Design choices

The short version of every trade-off; the ADRs carry the full reasoning.

- **TypeScript monorepo** — npm workspaces: `apps/server`, `apps/web`, `packages/api-types` ([ADR-0002](docs/adr/0002-monorepo-npm-workspaces.md), [ADR-0003](docs/adr/0003-typescript.md))
- **Fastify** — best throughput of the allowed frameworks; the sale logic stays framework-agnostic ([ADR-0004](docs/adr/0004-fastify.md))
- **Dual store: in-memory by default, Redis opt-in** — atomic on the Node event loop for zero-setup runs; the same logic as an atomic Lua script for the distributed shape; one contract test suite proves both behave identically ([ADR-0005](docs/adr/0005-in-memory-plus-redis.md))
- **No auth: bare `userId`** — the brief's identity model; production would pass a verified JWT claim with the store contract unchanged. Considered and rejected: self-minted JWT, simulated IdP, Better Auth ([ADR-0009](docs/adr/0009-api-surface.md))
- **Env-var config** — the sale window is immutable per-run config; a sale database is unasked scope ([ADR-0010](docs/adr/0010-configuration.md))
- **Overload behavior** — microsecond hot path, instant rejections after sellout; rate limiting left to the load balancer ([ADR-0011](docs/adr/0011-overload-behavior.md))
- **Infra via artifacts** — Dockerfile, compose mode, CI, and production topology docs; no local cluster ([ADR-0006](docs/adr/0006-infra-via-artifacts.md))
- **Vitest for correctness, k6 for load** — one TS-native runner for behavior, an industry-standard generator for throughput numbers ([ADR-0007](docs/adr/0007-vitest-and-k6.md))
- **React + Vite + Chakra** — the frontend is 20% of the role; the time budget follows ([ADR-0008](docs/adr/0008-react-vite-chakra.md))
- **One origin for frontend and API** — Vite proxy in dev, nginx edge in compose; no CORS anywhere ([ADR-0012](docs/adr/0012-frontend-serving.md))
