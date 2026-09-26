// NestNeev CMS auth worker — username/password gated admin login.
//
// The admin (/admin) no longer needs a GitHub account to log in. Instead:
//   1. You set a username + password of your choosing as Worker secrets.
//   2. Whoever knows those credentials can log into the CMS at /login.
//   3. Behind the scenes, this worker hands Decap CMS a stored GitHub
//      Personal Access Token (from a "bot" GitHub account with write
//      access to the repo) so the actual content commits still go to
//      GitHub — the person logging in never sees or needs that token.
//
// Deploy (from inside this folder): npx wrangler deploy
//
// Secrets to set yourself, in your own terminal (values never pass
// through anyone else's hands):
//   npx wrangler secret put ADMIN_USERNAME
//   npx wrangler secret put ADMIN_PASSWORD
//   npx wrangler secret put SESSION_SECRET       (any long random string —
//                                                  e.g. generate one with:
//                                                  openssl rand -hex 32)
//   npx wrangler secret put GITHUB_BOT_TOKEN     (a GitHub Personal Access
//                                                  Token — see README.md
//                                                  for exactly how to make
//                                                  one)
//
// admin/config.yml already points backend.base_url at this worker's URL —
// nothing to change there.

const SESSION_COOKIE = "nestneev_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/login" && request.method === "GET") {
      return loginPage();
    }
    if (url.pathname === "/login" && request.method === "POST") {
      return handleLogin(request, env);
    }
    if (url.pathname === "/logout") {
      return handleLogout();
    }
    if (url.pathname === "/auth") {
      return handleAuth(request, url, env);
    }

    return new Response("NestNeev CMS auth worker is running.", { status: 200 });
  },
};

// ---------------------------------------------------------------------
// crypto / session helpers
// ---------------------------------------------------------------------

async function hmacSign(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bufferToHex(sig);
}

function bufferToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Constant-time string comparison, so login attempts can't be sped up by
// timing how quickly a mismatch is detected.
function timingSafeEqual(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) {
    // Still do a comparison of equal-ish length so failure timing doesn't
    // leak the correct length either.
    b = a;
  }
  let result = a.length === b.length ? 0 : 1;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function makeSessionCookieValue(env) {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const sig = await hmacSign(payload, env.SESSION_SECRET);
  return `${payload}.${sig}`;
}

async function isSessionValid(request, env) {
  const cookie = getCookie(request, SESSION_COOKIE);
  if (!cookie) return false;

  const dot = cookie.indexOf(".");
  if (dot === -1) return false;
  const payload = cookie.slice(0, dot);
  const sig = cookie.slice(dot + 1);

  const expected = await hmacSign(payload, env.SESSION_SECRET);
  if (!timingSafeEqual(sig, expected)) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  return true;
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// ---------------------------------------------------------------------
// routes
// ---------------------------------------------------------------------

function loginPage(error) {
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NestNeev Admin Login</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6;
         display: flex; align-items: center; justify-content: center;
         min-height: 100vh; margin: 0; }
  form { background: #fff; padding: 2rem 2.5rem; border-radius: 10px;
         box-shadow: 0 2px 12px rgba(0,0,0,0.08); width: 280px; }
  h1 { font-size: 1.15rem; margin: 0 0 1.2rem; color: #111827; }
  label { display: block; font-size: 0.85rem; color: #374151; margin: 0.8rem 0 0.3rem; }
  input { width: 100%; padding: 0.55rem 0.6rem; border: 1px solid #d1d5db;
          border-radius: 6px; font-size: 0.95rem; box-sizing: border-box; }
  button { margin-top: 1.4rem; width: 100%; padding: 0.6rem; border: none;
           border-radius: 6px; background: #111827; color: #fff; font-size: 0.95rem;
           cursor: pointer; }
  button:hover { background: #1f2937; }
  .error { color: #dc2626; font-size: 0.85rem; margin-top: 0.9rem; text-align: center; }
</style>
</head>
<body>
<form method="POST" action="/login">
  <h1>NestNeev Admin Login</h1>
  <label for="u">Username</label>
  <input id="u" name="username" autocomplete="username" required autofocus>
  <label for="p">Password</label>
  <input id="p" name="password" type="password" autocomplete="current-password" required>
  <button type="submit">Log in</button>
  ${error ? `<div class="error">${error}</div>` : ""}
</form>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function handleLogin(request, env) {
  let username = "";
  let password = "";
  try {
    const form = await request.formData();
    username = (form.get("username") || "").toString();
    password = (form.get("password") || "").toString();
  } catch (e) {
    return loginPage("Something went wrong reading the form. Try again.");
  }

  const validUser = timingSafeEqual(username, env.ADMIN_USERNAME || "");
  const validPass = timingSafeEqual(password, env.ADMIN_PASSWORD || "");

  if (!validUser || !validPass) {
    return loginPage("Incorrect username or password.");
  }

  const cookieValue = await makeSessionCookieValue(env);
  const headers = new Headers({ Location: "/auth" });
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${
      SESSION_TTL_MS / 1000
    }`
  );
  return new Response(null, { status: 302, headers });
}

function handleLogout() {
  const headers = new Headers({ Location: "/login" });
  headers.append("Set-Cookie", `${SESSION_COOKIE}=; Path=/; Max-Age=0`);
  return new Response(null, { status: 302, headers });
}

// This is the URL Decap CMS opens in a popup window when someone clicks
// the CMS's login button. Historically it kicked off real GitHub OAuth;
// now it just checks our own session cookie.
async function handleAuth(request, url, env) {
  const valid = await isSessionValid(request, env);
  if (!valid) {
    return Response.redirect(`${url.origin}/login`, 302);
  }

  if (!env.GITHUB_BOT_TOKEN) {
    return new Response(
      "Login succeeded, but GITHUB_BOT_TOKEN is not set on this worker yet. " +
        "Run: npx wrangler secret put GITHUB_BOT_TOKEN",
      { status: 500 }
    );
  }

  // Logged in — hand Decap CMS the stored GitHub token via the same
  // popup postMessage handshake it expects from a real OAuth flow.
  const payload = JSON.stringify({ token: env.GITHUB_BOT_TOKEN, provider: "github" }).replace(
    /'/g,
    "\\'"
  );

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

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
