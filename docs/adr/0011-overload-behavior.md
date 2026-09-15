# ADR-0011: Overload behavior under heavy traffic

Date: 2026-09-15
Status: Accepted

## Context

Thousands of concurrent buyers will hit one endpoint. The system must stay stable
when hammered, including after stock is exhausted — when the sale is over, traffic
usually isn't.

## Decision

- The purchase hot path does exactly two things: a clock read for the window check
  and the store's check-and-decrement. No allocation-heavy work, no extra I/O.
  A sold-out or closed sale resolves in microseconds, so post-sellout traffic is
  nearly free.
- Requests have timeouts; connections are kept alive; responses are tiny.
- Graceful SIGTERM shutdown and `/health` + `/ready` probes come from
  [ADR-0006](0006-infra-via-artifacts.md).
- In-app rate limiting is deliberately omitted: for a single sale this size, the
  load balancer's job in production (shown in the system diagram). Adding a limiter
  in-process would add state and contention to the one path that must stay cheap.

## Consequences

- Worst case under load is fast, deterministic rejections — not queued work or
  cascading failures.
- A reviewer hammering an ended sale gets instant 410s at high RPS; the k6 suite
  demonstrates this.
- If the real deployment had no LB, this decision would need revisiting.
