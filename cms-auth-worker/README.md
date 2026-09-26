# NestNeev CMS auth worker

A small, separate Cloudflare Worker that lets the `/admin` content editor
log in with a plain **username + password** you choose — no GitHub account
needed for whoever is editing content. Behind the scenes it still commits
changes to GitHub, using one stored "bot" token, but the person logging in
never sees or needs that token.

## One-time setup

You only need to do this once. Every step below runs in your own terminal
(PowerShell), so no credentials ever pass through anyone else's hands.

### 1. Create a GitHub Personal Access Token (the "bot" token)

This is the token the worker uses internally to actually save content
changes to GitHub — it's separate from anyone's personal login.

1. Go to https://github.com/settings/tokens?type=beta ("Fine-grained
   tokens") or https://github.com/settings/tokens (classic tokens — the
   simpler option).
2. Click "Generate new token" → "Generate new token (classic)".
3. Name it something like `nestneev-cms-bot`.
4. Expiration: choose "No expiration" (or a long date — just remember to
   renew it before it expires, otherwise the CMS will stop being able to
   save).
5. Scopes: check **`repo`** (this gives it write access to your
   repositories — needed to save CMS edits as commits).
6. Click "Generate token" and **copy the token now** — GitHub only shows
   it once. It looks like `ghp_xxxxxxxxxxxxxxxxxxxx`.

### 2. Deploy this worker

From inside this `cms-auth-worker` folder:
```
npx wrangler deploy
```
This prints the worker's live URL, e.g.
`https://nestneev-cms-auth.<your-subdomain>.workers.dev`

### 3. Set the secrets

Each command below prompts you to type/paste the value — nothing is saved
anywhere except Cloudflare's encrypted secret store for this worker.

```
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
npx wrangler secret put GITHUB_BOT_TOKEN
```

- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — whatever you want the CMS login to
  be. This is what you (or the client) will type at `/login`.
- `SESSION_SECRET` — any long random string, used only to sign login
  sessions. You can generate one with `openssl rand -hex 32`, or just
  mash the keyboard for 40+ characters. It doesn't need to be memorable —
  paste it once and forget it.
- `GITHUB_BOT_TOKEN` — the token you copied in step 1.

### 4. Try it

Go to `https://nestneev.com/admin` and click the CMS's login button. It
will send you to this worker's `/login` page — sign in with the
`ADMIN_USERNAME` / `ADMIN_PASSWORD` you just set, and you'll land back in
the CMS, fully logged in.

## Changing the password later

Just re-run `npx wrangler secret put ADMIN_PASSWORD` (or `ADMIN_USERNAME`)
with the new value — takes effect immediately, no redeploy needed.

## Adding a second admin login

This worker supports exactly one username/password pair. If you need
separate logins for separate people later, that's a bigger change (a small
list of accounts instead of one) — ask for it if you get there.
