# ADR-0003: TypeScript everywhere

Date: 2026-09-14
Status: Accepted

## Context

The core logic (stock decrementing, one-per-user enforcement) is exactly the kind of code
where a shape error becomes an oversell. The brief also grades code quality.

## Decision

TypeScript for both `server/` and `web/`, with strict mode on.

## Consequences

- Stock and purchase logic gets compile-time guarantees.
- Small build-step cost, handled by tsx (dev) and tsc (build).
- Types double as documentation for the API surface.
