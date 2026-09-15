# ADR-0006: Infra via artifacts, not a local cluster

Date: 2026-09-14
Status: Accepted

## Context

Infra competence is worth showing, but the brief says deployment is not required, and
a take-home must run smoothly for reviewers. LocalStack or a local Kubernetes cluster
would make the dev environment fragile and the repo hard to evaluate — and running
your own K8s carries operational cost a small team shouldn't take on lightly.

## Decision

Show infra competence through runnable/readable artifacts:

- Production-grade Dockerfile (multi-stage, non-root, healthcheck).
- docker-compose full-stack mode (optional; the npm-only path stays the default).
- GitHub Actions CI: lint, typecheck, tests, container build.
- Production topology in the README and system diagram, recommending managed services
  over self-run K8s.
- Ops hygiene in the app: `/health` + `/ready`, graceful SIGTERM shutdown, structured
  logging.

Explicitly rejected: LocalStack and local K8s as the dev environment; setup helpers in
another language with committed binaries — opaque to reviewers, a platform matrix to
maintain, wrapping a setup that is already two commands. Glue that outgrows npm
scripts is written in TypeScript.

## Consequences

- Strong infra signal that stays cheap to review; the default path is zero-friction.
- CI doubles as proof the tests pass on a clean machine.
- The managed-services-over-K8s recommendation demonstrates sizing infrastructure to
  the team that has to operate it.
