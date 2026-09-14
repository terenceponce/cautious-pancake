# ADR-0001: Record decisions as ADRs

Date: 2026-09-14
Status: Accepted

## Context

The project brief asks us to justify our design choices. We want the reasoning behind
each decision to be visible without digging through git history or chat logs.

## Decision

Keep every meaningful decision as an ADR in `docs/adr/`, numbered in order
(`0001-short-title.md`). ADRs are never rewritten after the fact. When a decision
changes, append a dated amendment to the ADR explaining what changed and why.

## Consequences

- Slight overhead per decision, but the "why" is always on record.
- Each ADR doubles as a template for the next one.
- The interview brief's "justify your design choices" requirement is satisfied by default.
