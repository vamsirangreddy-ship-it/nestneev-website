# NestNeev CMS auth worker

A small, separate Cloudflare Worker whose only job is to let the `/admin`
content editor log in with GitHub, now that the site is no longer hosted
on Netlify (Decap CMS's old "Git Gateway" backend only works on Netlify).

## One-time setup

1. **Create a GitHub OAuth App** at https://github.com/settings/developers
   → "New OAuth App":
   - Application name: `NestNeev CMS`
   - Homepage URL: `https://nestneev.com`
   - Authorization callback URL: `https://nestneev-cms-auth.<your-subdomain>.workers.dev/callback`
     (you'll get the exact `*.workers.dev` URL after step 2's first deploy —
     come back and fill in the real callback URL, then save)
   - Click "Register application", then "Generate a new client secret"
   - Keep this tab open, you'll need the Client ID and the secret next

2. **Deploy this worker** (from inside this `cms-auth-worker` folder):
   ```
   npx wrangler deploy
   ```
   This prints the worker's live URL, e.g.
   `https://nestneev-cms-auth.<your-subdomain>.workers.dev`

3. **Set the two secrets** (run these yourself — each one prompts for the
   value in your own terminal, so it's never typed anywhere else):
   ```
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```

4. Go back to the GitHub OAuth App and make sure the Authorization
   callback URL exactly matches `<worker-url>/callback`.

5. In `admin/config.yml` (one level up), set `backend.base_url` to the
   worker's URL from step 2. This has already been wired up — just
   double check it matches after your first deploy.

That's it — `/admin` will now show a "Login with GitHub" button instead of
the old Netlify Identity login.
