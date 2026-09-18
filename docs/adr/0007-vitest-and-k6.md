# ADR-0007: Vitest for correctness, k6 for load

Date: 2026-09-14
Status: Accepted

## Context

We need unit, integration, and contract tests, plus stress tests — thousands of
concurrent buyers hammering the purchase endpoint — and load numbers worth showing.

## Decision

- **Vitest** for everything that asserts behavior: unit, integration, contract
  suites, and in-process concurrency tests.
- **k6** for load: throughput and latency under sustained traffic, with report output
  for the README. Installed by the reviewer, never committed.

## Consequences

- One TS-native runner for correctness; no Jest-style config gymnastics.
- k6 reports give the stress-test section real evidence.
- Two tools to document; each has exactly one job.

## Amendments

- 2026-09-18 [#6](https://github.com/terenceponce/cautious-pancake/pull/6): The k6 scripts are TypeScript, not JavaScript. k6 executes them via native type-stripping, and `perf/` is a workspace with `@types/k6`, typechecked by the same `npm run typecheck` as everything else — one language across the repo. Initially written in JS on the "nothing checks them anyway" argument; reconsidered for consistency, since reviewers read the whole repo in one language.
