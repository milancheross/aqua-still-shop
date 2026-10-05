# Admin authentication setup

The admin area is protected by a signed, HTTP-only session cookie. There is no default administrator account and no password or session secret is stored in the repository.

## Required server environment variables

Configure these variables in the server environment (for local development, in an ignored .env file):

- ADMIN_EMAIL — the single administrator's login email.
- ADMIN_PASSWORD_HASH — bcrypt hash of the administrator password.
- ADMIN_SESSION_SECRET — a random secret with at least 32 characters, used to sign sessions.

Do not commit real values to Git or expose them in client-side variables (for example, do not prefix them with NEXT_PUBLIC_).

## Generate values locally

Generate a session secret with Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Generate a bcrypt password hash using the project's installed bcryptjs dependency. Run this locally and replace the placeholder with your chosen password:

```bash
node -e "require('bcryptjs').hash('REPLACE_WITH_YOUR_PASSWORD', 12).then(console.log)"
```

Avoid using a real password in a shared terminal, screenshot, chat, or committed script. If your shell saves command history, remove the command from history after generating the hash.

## Sign in

After setting all three variables and restarting the app, open /admin-login. Sign in with the configured email and original password. The session lasts 8 hours; signing out clears the session cookie.

The admin layout and admin server actions check the signed session on the server. Public storefront actions (such as cart and checkout) are not protected by admin authentication.

The login action allows five failed attempts per trusted client IP and per email address inside a 15-minute window. Counters are stored in Postgres (`rate_limit_events`) and mirrored in process memory when the database is unavailable. The client IP is taken from `x-real-ip` or the first address in `x-vercel-forwarded-for`, which the host sets. The raw `x-forwarded-for` header is ignored because a caller can spoof its first value.

## Deployment

Set the three variables in the hosting provider's server-side environment settings, then redeploy/restart the app. Use a different, randomly generated session secret for each environment. Do not use the development secret in production.

This implementation has not been runtime-tested in this repository environment. Before production use, verify successful and failed login, session expiry, logout, and rejection of unauthenticated calls to admin actions.
