# ADR-0001: Record decisions as ADRs

Date: 2026-09-14
Status: Accepted

## Context

The brief asks us to justify our design choices, and we want the reasoning visible
without digging through git history or chat logs.

## Decision

Keep every meaningful decision as an ADR in `docs/adr/`, numbered in order
(`0001-short-title.md`). ADRs are editable until merged to `main`; after that,
changed only by dated amendment.

## Consequences

- Slight overhead per decision, but the "why" is always on record.
- The brief's "justify your design choices" requirement is satisfied by default.
