# AGENTS.md

House rules for anyone (or anything) working in this repo.

## Keep it simple and concise

- Code and documentation should be as simple and short as reasonable.
- Write like a human, not an AI agent. No filler, no over-explaining, no boilerplate that wouldn't earn its place in a real codebase.
- Be verbose only when verbosity is genuinely the clearer option (e.g. a tricky concurrency detail worth a comment or two).

## Decisions get an ADR

- Anything we discuss and decide gets an Architecture Decision Record (ADR) in `docs/adr/`.
- ADRs are amended, never silently rewritten. To change a decision, append a dated amendment explaining what changed and why, so the file reads as the history of how the decision came about.
