# ADR-0002: Monorepo with npm workspaces

Date: 2026-09-14
Status: Accepted

## Context

The deliverable is one repo containing an API server, a React frontend, docs, and
tests. Reviewers should be able to clone and run everything with minimal steps.

## Decision

Single repo using npm workspaces:

- `apps/server/` — the API
- `apps/web/` — the React frontend
- `packages/api-types/` — the API contract, shared by both apps
- root `package.json` orchestrating shared scripts (dev, test, stress)

## Consequences

- One clone, one install, one set of commands in the README.
- Shared TypeScript config without publishing anything.
- No Turborepo/Nx — overkill at this size.
