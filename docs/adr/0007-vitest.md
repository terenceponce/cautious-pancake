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
