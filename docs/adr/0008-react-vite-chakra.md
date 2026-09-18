# ADR-0008: React with Vite and Chakra UI

Date: 2026-09-14
Status: Accepted

## Context

The role is 80% backend; the frontend is a single-screen demo. Time spent styling is
time not spent on the graded concurrency and testing work.

## Decision

Vite + React + TypeScript for the app, Chakra UI for components, plain fetch for the
API calls. No state library — the screen needs one fetch on load and one on click.

## Consequences

- A tidy UI for near-zero styling effort.
- Chakra's component weight is the trade-off, justified by where the role's
  priorities actually are.
- If Chakra ever gets in the way of the demo, dropping to hand-rolled CSS for one
  screen is cheap.

## Amendments

- 2026-09-18 [#11](https://github.com/terenceponce/cautious-pancake/pull/11): Storefront polish pass — navbar, product card with countdown and stock bar, and a sign-in/sign-out flow gating purchase. The login flow is presentation, not authentication: a client-side session in localStorage. The API's identity model is unchanged (bare `userId`, per [ADR-0009](0009-api-surface.md)); real auth remains rejected there.
