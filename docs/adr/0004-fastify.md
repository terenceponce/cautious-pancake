# ADR-0004: Fastify for the API

Date: 2026-09-14
Status: Accepted

## Context

Brief allows Express, Fastify, Nest.js, or native http, and grades throughput.
The framework only handles request plumbing — concurrency correctness lives in our
own framework-agnostic module — so the choice is about cheap, validated plumbing.

## Decision

Fastify: best throughput of the allowed options, JSON Schema validation and fast
serialization built into routes, first-class TypeScript support, minimal boilerplate.

## Consequences

- Hot path stays cheap without hand-rolled validation.
- Smaller ecosystem than Express; everything we need is built in.
- The router is not this system's real throughput bottleneck — the state layer is
  (see [ADR-0005](0005-in-memory-plus-redis.md)).
