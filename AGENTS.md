# AGENTS.md

House rules for anyone (or anything) working in this repo.

## Keep it simple and concise

- Code and documentation should be as simple and short as reasonable.
- Write like a human, not an AI agent. No filler, no over-explaining, no boilerplate that wouldn't earn its place in a real codebase.
- Be verbose only when verbosity is genuinely the clearer option (e.g. a tricky concurrency detail worth a comment or two).

## Decisions get an ADR

- Anything we discuss and decide gets an Architecture Decision Record (ADR) in `docs/adr/`.
- ADRs are drafts until merged to `main` — edit freely before that. Once on `main`, never rewrite: append a dated amendment explaining what changed and why, so the file reads as the history of the decision.
- Always link to the ADR file when mentioning one, e.g. `[ADR-0005](docs/adr/0005-in-memory-plus-redis.md)`, so IDE go-to-file works.

## Work happens in git worktrees

- Feature work is done in a git worktree, one per task, so multiple agents can work in parallel without sharing a working directory.
- Create worktrees outside the main checkout (e.g. `git worktree add ../bookipi-worktrees/<branch> -b <branch>`) and run the agent with that directory as its working directory.
- The main checkout stays on `main` and clean; finished work gets merged back from its branch.

## Conventional commits

- Commit messages follow Conventional Commits: `type(scope): description` — types like `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
- Subject is lowercase, imperative, no trailing period.
- Merges are squash-only, so the PR title becomes the commit on `main` — PR titles follow Conventional Commits too.
