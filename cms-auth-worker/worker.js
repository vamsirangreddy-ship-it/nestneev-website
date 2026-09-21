// Minimal GitHub OAuth provider for Decap CMS, deployed as its own
// Cloudflare Worker. This replaces Netlify Identity + Git Gateway, which
// only works when the site itself is hosted on Netlify.
//
// Deploy (from inside this folder): npx wrangler deploy
// Secrets (run these yourself, in your own terminal, so the values never
// pass through anyone else's hands):
//   npx wrangler secret put GITHUB_CLIENT_ID
//   npx wrangler secret put GITHUB_CLIENT_SECRET
//
// Those two values come from a GitHub OAuth App you create at
// https://github.com/settings/developers  ("New OAuth App"):
//   Homepage URL:              https://nestneev.com
//   Authorization callback URL: https://<this-worker's-url>/callback
//
// Then point admin/config.yml's backend.base_url at this worker's URL.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") return handleAuth(url, env);
    if (url.pathname === "/callback") return handleCallback(request, url, env);

    return new Response("NestNeev CMS auth worker is running.", { status: 200 });
  },
};

function randomState() {
  return crypto.randomUUID();
}

async function handleAuth(url, env) {
  const state = randomState();
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
  authorizeUrl.searchParams.set("scope", "repo,user");
  authorizeUrl.searchParams.set("state", state);

  const headers = new Headers({ Location: authorizeUrl.toString() });
  headers.append(
    "Set-Cookie",
    `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  return new Response(null, { status: 302, headers });
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

async function handleCallback(request, url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = getCookie(request, "oauth_state");

  if (!code || !state || state !== cookieState) {
    return new Response("Invalid or expired OAuth state. Please try logging in again.", {
      status: 400,
    });
  }

  const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });
  const tokenData = await tokenResp.json();

  if (tokenData.error || !tokenData.access_token) {
    return new Response(`GitHub OAuth error: ${tokenData.error_description || tokenData.error || "unknown error"}`, {
      status: 400,
    });
  }

  const payload = JSON.stringify({ token: tokenData.access_token, provider: "github" }).replace(
    /'/g,
    "\\'"
  );

  // Standard Decap/Netlify CMS popup handshake: the popup waits for the
  // opener's ack message, then posts the token back to it.
  const html = `<!doctype html>
<html>
<body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:${payload}',
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
Login successful, you can close this window.
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Set-Cookie": "oauth_state=; Path=/; Max-Age=0",
    },
  });
}
