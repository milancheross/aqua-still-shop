# Aqua Still Shop — project context

Last reviewed: 2026-09-27  
Repository: `milancheross/aqua-still-shop`  
Default branch at review: `main`

## Product direction
Aqua Still Zlatibor is an e-commerce shop for water, plumbing, heating and related equipment. The application should remain understandable and maintainable by a small team using AI coding assistants.

Agreed direction:
- No Medusa runtime.
- No attempt to reproduce Elementor.
- Prefer a focused admin/CMS with structured forms and a limited set of predefined content blocks.
- Keep the storefront and admin in the same root Next.js application unless a documented technical need justifies otherwise.
- Preserve in-store pickup at checkout, with pickup available the following day as previously specified.

## Observed root stack
The root `package.json` declares:
- Next.js 16.3.6
- React / React DOM 19.2.8
- TypeScript (declared as ^5)
- Tailwind CSS 4
- Prisma / @prisma/client 6

Root scripts currently include `dev`, `build`, `start`, `lint` and `db:seed`. The root package does not declare a packageManager field in the reviewed version.

## Observed data model
`prisma/schema.prisma` uses PostgreSQL and includes:
- Catalog: Category, Subcategory, Brand, Product
- Commerce: Cart, CartItem, Order, OrderItem, DiscountCode
- Accounts: User, Account, Session, VerificationToken
- CMS/media: Page, MediaAsset

Product has SKU, slug, brand/category references, prices, VAT rate, stock fields, descriptions, images and attributes. Page stores structured content in `contentJson`; MediaAsset stores metadata and a URL.

This describes the schema, not proof that all corresponding database tables exist in the deployed database. Verify migrations and the actual environment before changing data.

## Repository ambiguity requiring cleanup
The repository also contains a `backend/` directory with a separate Medusa DTC starter/monorepo, including its own package manifest, lockfile, agent instructions and Medusa application. This conflicts with the agreed root-app direction and can mislead coding agents.

Do not delete it blindly in an unrelated feature task. Before removal, inspect the complete tracked tree, references in CI/deployment/scripts/docs, and whether any data or configuration is still needed. Remove it in a dedicated, reviewable change after confirming it is unused. The current branch is intended for that cleanup and handoff preparation.

## Important caveats
- Existing audit documents describe earlier states and contain claims that may no longer be current. Treat code and current runtime checks as authoritative.
- A schema model does not prove that a migration was applied.
- A page model does not prove that a working CMS editor exists.
- A route or dashboard shell does not prove that admin authentication/authorization is correctly enforced.
- Mock data may exist for development. Trace each production data path before changing fallback behavior.
- Do not assume that build success alone verifies checkout, stock decrement, admin security, uploads or order processing.

## Preferred implementation sequence
1. Establish a single authoritative application and remove stale architecture instructions.
2. Verify database migrations, authentication and authorization boundaries.
3. Complete essential catalog/admin CRUD and media management.
4. Implement simple structured page editing only after the data/rendering contract is defined.
5. Add tests and CI checks around critical commerce behavior.
