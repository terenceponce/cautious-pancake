# ADR-0005: In-memory default store with a real Redis implementation

Date: 2026-09-14
Status: Accepted

## Context

Concurrency correctness (no oversell, one-per-user) is the graded centerpiece. We also
want to show infra competence, without requiring reviewers to install Docker just to
run the project.

## Decision

A small `SaleStore` interface with two implementations:

- **In-memory (default):** a synchronous check-and-decrement is atomic on the Node
  event loop — no locks needed in a single process. Used for dev, unit/integration
  tests, and the default stress test run. Zero setup.
- **Redis:** atomic Lua script (one-per-user check + stock check + decrement in one
  command), used in the docker-compose run mode; stress tests can target either store.

The production story (multiple stateless app instances over Redis) is shown in the
system diagram.

## Consequences

- Reviewers run everything with npm alone; Redis is opt-in via compose.
- The distributed-safe version exists as tested code, not just a diagram.
- Two implementations to maintain (~50 extra lines); acceptable for the signal.
- In-memory mode loses purchase records on crash — accepted for dev; Redis mode is
  the production-credible one.

## Amendments

- 2026-09-15: Two implementations risk drifting apart. Mitigation: a contract test
  suite — the same behavioral assertions run against every `SaleStore` implementation
  in CI. Divergence between implementations becomes a failing build, not a production
  bug. The behavior spec lives in the shared suite, not in either impl.
