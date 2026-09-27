# Aqua Still Shop — instructions for coding agents

This repository's active application is the root Next.js application. The intended direction is a custom, modular e-commerce application using Next.js, TypeScript, Prisma and PostgreSQL. Medusa is not part of the intended runtime, and a visual Elementor-style page builder is not a project goal.

## Before making changes
1. Read `docs/PROJECT_CONTEXT.md` and the relevant documents in `docs/`.
2. Inspect the current implementation; documentation may lag behind code.
3. Check `git status` and preserve all existing user changes.
4. For non-trivial work, first provide a short plan naming files, data changes, risks and verification steps.
5. Work only on the requested scope. Do not perform broad refactors as incidental cleanup.

## Architecture boundaries
- Treat the root `package.json` and root application as the active app.
- Do not add Medusa, Medusa packages, a second package manager, or a second application architecture.
- Do not build a general-purpose drag-and-drop page builder. The preferred CMS direction is a small, schema-driven set of approved content blocks, only when explicitly requested.
- PostgreSQL accessed through Prisma is the intended source of truth for persisted commerce and CMS data. Do not silently introduce mock-data fallbacks into production paths.
- Keep business logic in the existing server-side service/action boundaries. Inspect current patterns before adding a new API or service.
- Never trust client-submitted prices, totals, stock, roles, or order status. Validate authoritative values on the server.
- Preserve the checkout option for in-store pickup; it is a required business behavior.

## Database and secrets
- Never run destructive database operations.
- Never edit an existing migration that may have been applied. Add a new migration for schema changes.
- Do not commit, print, or expose secrets from environment files. Update example environment files only.
- Do not change production configuration or deployment settings unless the task explicitly requires it.

## Implementation rules
- Reuse existing components, utilities, services and validation schemas where appropriate.
- Avoid duplicate implementations and unnecessary dependencies.
- Keep TypeScript types explicit; do not use `any` without a clear reason.
- Handle loading, empty and error states in user-facing screens.
- Make accessible controls and responsive layouts.
- Do not claim a feature works unless it has been verified.

## Verification
Run the checks supported by the root project, at minimum:
- `npm run lint`
- `npx tsc --noEmit` (if compatible with the current tsconfig)
- `npm run build`

Run relevant tests if present. If a command cannot be run because the environment or secrets are unavailable, state that clearly. Review `git diff` and report the exact files changed and checks performed.

## Completion report
Summarize behavior changed, files touched, migrations or environment changes, verification results, and any known limitations. Do not commit or merge unless asked.
