# System Diagram

The deployed shape, as built and as it would scale. The docker-compose stack runs
the bottom diagram's topology on one machine: nginx is the edge (static files +
`/api` reverse proxy), Fastify is stateless, and all mutable sale state lives in
Redis behind an atomic Lua script.

## Architecture

```mermaid
flowchart LR
  subgraph clients
    B["Browser"]
  end

  subgraph edge["Edge — nginx (compose) / LB + CDN (production)"]
    NG["Static React bundle + /api reverse proxy"]
  end

  subgraph app["Stateless API tier — scales horizontally"]
    S1["Fastify instance"]
    S2["Fastify instance"]
  end

  R[("Redis — stock counter + buyers set<br/>atomic Lua check-and-decrement")]

  B --> NG
  NG --> S1
  NG --> S2
  S1 --> R
  S2 --> R
```

Two invariants hold everywhere:

- **No oversell / one per user** — the stock check, the dedupe check, and the
  mutation happen inside one atomic unit: a Lua script inside Redis, safe across
  any number of app instances ([ADR-0005](adr/0005-in-memory-plus-redis.md)).
- **Sale window** — enforced at the route with a clock read before any store
  round trip, so traffic outside the window never touches Redis
  ([ADR-0011](adr/0011-overload-behavior.md)).

The in-memory store used in dev and tests is the same logic with the atomicity
provided by the Node event loop instead — single-process only, zero setup.

## One purchase, end to end

```mermaid
sequenceDiagram
  participant B as Browser
  participant E as nginx edge
  participant A as Fastify instance
  participant R as Redis

  B->>E: POST /api/purchase {userId}
  E->>A: proxied
  A->>A: window check (clock read — no I/O)
  alt outside window
    A-->>B: 403 sale_not_active (store never touched)
  else inside window
    A->>R: EVALSHA attemptPurchase(buyers, stock, userId)
    R->>R: Lua: SISMEMBER → stock > 0 → SADD + DECR (atomic)
    R-->>A: success | already_purchased | sold_out
    A-->>B: 200 | 409 | 410
  end
```

After sellout the hot path is a clock read plus a single Redis script that
immediately rejects — measured at p95 13ms under a sustained 200-VU flood
(see the stress-test section of the README).

## Scaling path

1. **More Fastify instances** — they are stateless; Redis is the only shared
   state, and the Lua script keeps it correct under any fan-out. The compose
   stack models this with one instance; production adds replicas behind the LB.
2. **Redis** — a single Redis handles ~100k ops/s of scripts like ours; the
   first real bottleneck is vertical (bigger Redis), not app-tier.
3. **Managed over self-run** — for a small team, managed Redis plus a managed
   container platform (Fly/Render/ECS) delivers this topology without owning a
   cluster. Self-run Kubernetes is explicitly rejected in
   [ADR-0006](adr/0006-infra-via-artifacts.md).

## Development mode

```mermaid
flowchart LR
  B["Browser"] --> V["Vite dev server<br/>(proxy /api — one origin, no CORS)"]
  V --> F["Fastify"]
  F --> M["In-memory store<br/>(event-loop atomic)"]
```

Both modes share the same routes, contract types, and tests; the store swaps by
configuration ([ADR-0010](adr/0010-configuration.md)).
