# AI development workflow

## One task, one branch, one outcome
Prefer a focused branch and pull request for each meaningful change. Do not combine architecture cleanup, admin features and checkout changes in one patch.

## Required loop
1. **Inspect:** read `AGENTS.md`, project context and relevant code. Search for existing behavior before adding anything.
2. **Baseline:** inspect git status, package scripts, current errors and relevant tests. Do not overwrite uncommitted work.
3. **Plan:** list files to change, expected behavior, data impact and risks. Stop if requirements or source of truth are unclear.
4. **Implement:** make the smallest coherent change. Avoid unrelated formatting and refactors.
5. **Verify:** run lint, typecheck, build and relevant tests where available. Do not hide failures.
6. **Review:** inspect the full diff for unintended files, secrets, generated artifacts, dependency churn and behavior changes.
7. **Report:** summarize what changed, what was tested, and what remains unverified.

## Database changes
- Review the Prisma schema and all relevant queries/actions before changing a model.
- Use a new migration; never rewrite an applied migration.
- Do not run migrations against production or any shared database without explicit approval.
- Do not infer production database state from local schema files.

## Admin and security
- Treat every admin server action and route as a security boundary.
- Verify authentication and authorization on the server, not only by hiding UI.
- Validate and normalize input on the server.
- Do not expose secrets or privileged data to client components.

## CMS
The preferred direction is structured content, not arbitrary HTML/JavaScript and not a universal page builder. Define and validate a versioned block schema, render only known block types, and preserve a safe fallback for unknown or malformed content. Keep editing controls separate from storefront rendering.

## Commerce
- Server-side product prices and stock are authoritative.
- Revalidate product existence, price and stock during checkout.
- Preserve transactional order creation and stock updates where currently implemented.
- Preserve in-store pickup behavior.
- Do not change order/payment/shipping semantics without an explicit requirement.

## Do not
- Reintroduce Medusa or create a second backend architecture.
- Add dependencies without explaining why existing tools are insufficient.
- replace real data with mock data to make a screen appear functional.
- Delete code, migrations, assets or configuration just because they appear unused; verify references first.
- Claim tests passed unless they were actually run.
