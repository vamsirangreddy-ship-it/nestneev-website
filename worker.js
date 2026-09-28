// NestNeev site worker — serves the static site and handles the two
// enquiry forms (general contact + "sell your property"), which used to
// rely on Netlify Forms. Netlify Forms doesn't exist on Cloudflare, so
// this replaces it: form submissions are emailed via Resend
// (https://resend.com) instead of silently going nowhere.
//
// Everything else (every GET request, every other path) is passed
// straight through to the static assets in dist/, unchanged.
//
// One-time setup, in your own terminal, from this folder (the repo
// root — NOT cms-auth-worker/):
//   1. Sign up for a free Resend account at https://resend.com and
//      create an API key (Resend's dashboard: API Keys -> Create).
//   2. npx wrangler secret put RESEND_API_KEY
//      (paste the key at the prompt, never in chat)
//   3. node scripts/build.js        (rebuild dist/ with the new form action)
//   4. npx wrangler deploy          (deploys this worker + the rebuilt site)
//
// Submissions are emailed to CONTACT_TO_EMAIL (set in wrangler.toml —
// no secret needed, it's not sensitive). Emails are sent from Resend's
// shared onboarding@resend.dev address, which works immediately with no
// domain setup; you can switch to a nestneev.com address later by
// verifying the domain in Resend and changing FROM_ADDRESS below.

const FROM_ADDRESS = "NestNeev Website <onboarding@resend.dev>";
const MAX_ATTACHMENT_BYTES = 30 * 1024 * 1024; // stay well under Resend's ~40MB request limit

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/enquiry" && request.method === "POST") {
      return handleEnquiry(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleEnquiry(request, env) {
  let form;
  try {
    form = await request.formData();
  } catch (e) {
    return new Response("Could not read form submission.", { status: 400 });
  }

  // Honeypot: real visitors never fill this field in (it's visually
  // hidden). A bot that fills every field will trip it.
  if ((form.get("bot-field") || "").toString().trim() !== "") {
    return Response.redirect(`${new URL(request.url).origin}/thank-you/`, 303);
  }

  const formName = (form.get("form-name") || "enquiry").toString();
  const name = (form.get("name") || "").toString().trim();
  const phone = (form.get("phone") || "").toString().trim();

  if (!name || !phone) {
    return new Response("Name and phone number are required.", { status: 400 });
  }

  const { subject, lines } = describeSubmission(formName, form);

  const attachments = [];
  if (formName === "sell-property") {
    let totalBytes = 0;
    for (const file of form.getAll("photos")) {
      if (!(file instanceof File) || file.size === 0) continue;
      if (totalBytes + file.size > MAX_ATTACHMENT_BYTES) {
        lines.push(
          `(One or more photos were too large to attach — ask ${name} to email them directly if needed.)`
        );
        break;
      }
      totalBytes += file.size;
      const buf = await file.arrayBuffer();
      attachments.push({
        filename: file.name || "photo.jpg",
        content: arrayBufferToBase64(buf),
      });
    }
  }

  const text = lines.join("\n");
  const html = `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap;">${escapeHtml(
    text
  )}</pre>`;

  let sent = false;
  if (env.RESEND_API_KEY) {
    sent = await sendViaResend(env, { subject, text, html, attachments });
  }

  const origin = new URL(request.url).origin;
  if (sent) {
    return Response.redirect(`${origin}/thank-you/`, 303);
  }

  // Don't show a fake "thank you" if the email genuinely failed to
  // send — that would hide the problem instead of fixing it. Tell the
  // visitor to reach out directly instead of losing their enquiry
  // silently.
  return new Response(failurePage(env), {
    status: 502,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function describeSubmission(formName, form) {
  const get = (k) => (form.get(k) || "").toString().trim();

  if (formName === "sell-property") {
    return {
      subject: `New property to list: ${get("name")} (${get("listingPurpose") || "sell"})`,
      lines: [
        "New \"sell your property\" submission from nestneev.com",
        "",
        `Name: ${get("name")}`,
        `Phone: ${get("phone")}`,
        `Wants to: ${get("listingPurpose")}`,
        `Property type: ${get("propertyType")}`,
        `Locality: ${get("locality")}`,
        `Expected price/rent: ${get("expectedPrice")}`,
        `Description: ${get("description") || "(none provided)"}`,
      ],
    };
  }

  return {
    subject: `New enquiry from ${get("name")} — nestneev.com`,
    lines: [
      "New enquiry from nestneev.com",
      "",
      `Name: ${get("name")}`,
      `Phone: ${get("phone")}`,
      `Email: ${get("email") || "(none provided)"}`,
      `Message: ${get("message") || "(none provided)"}`,
    ],
  };
}

async function sendViaResend(env, { subject, text, html, attachments }) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [env.CONTACT_TO_EMAIL || "hello@nestneev.com"],
        subject,
        text,
        html,
        attachments: attachments.length ? attachments : undefined,
      }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

function arrayBufferToBase64(buf) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function failurePage(env) {
  const phone = env.CONTACT_PHONE_DISPLAY || "our team";
  return `<!doctype html><html><head><meta charset="utf-8"><title>Something went wrong</title></head>
<body style="font-family:system-ui,sans-serif;max-width:520px;margin:4rem auto;text-align:center;">
<h1>Sorry, something went wrong</h1>
<p>We couldn't send your message just now. Please call or WhatsApp ${phone} directly, or try again in a moment.</p>
<p><a href="/contact/">Back to Contact page</a></p>
</body></html>`;
}
