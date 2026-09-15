# ADR-0007: Vitest for all test layers

Date: 2026-09-14
Status: Accepted

## Context

We need unit tests, API integration tests, and stress tests that hammer the purchase
endpoint with thousands of concurrent requests. One tool should cover all three.

## Decision

Vitest: TS-native with no config gymnastics, fast, and worker-thread support lets the
stress tests simulate many concurrent buyers in-process.

## Consequences

- Single test runner and config for every layer.
- Less universally known than Jest; the API is close enough that reviewers won't blink.
- Stress tests run in CI without special infrastructure.

## Amendments

- 2026-09-15: Correctness stays in Vitest (unit, integration, contract, and
  in-process concurrency tests), but load testing moves to k6: an industry-standard
  load generator with report output for the README. Vitest keeps asserting behavior;
  k6 proves throughput and latency under load. k6 is installed by the reviewer, not
  committed to the repo.
