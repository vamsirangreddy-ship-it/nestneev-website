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
// verifying the domain in Resend and setting CONTACT_FROM_EMAIL in
// wrangler.toml (e.g. "NestNeev <hello@nestneev.com>"). NOTE: until a
// domain is verified, Resend only delivers to the email address the
// Resend account was created with, so CONTACT_TO_EMAIL must match it.
// If email fails for any reason the visitor is offered a pre-filled
// WhatsApp message instead, and the reason is logged (Workers -> Logs).

const DEFAULT_FROM = "NestNeev Website <onboarding@resend.dev>"; // override with CONTACT_FROM_EMAIL once a domain is verified in Resend
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

  let result = { ok: false, reason: "RESEND_API_KEY is not set" };
  if (env.RESEND_API_KEY) {
    result = await sendViaResend(env, {
      subject,
      text,
      html,
      attachments,
      replyTo: (form.get("email") || "").toString().trim(),
    });
  }

  const origin = new URL(request.url).origin;
  if (result.ok) {
    return Response.redirect(`${origin}/thank-you/`, 303);
  }

  // Email could not be sent. Never show a fake "thank you", and never just
  // lose the lead: log the reason (visible in Cloudflare -> Workers -> Logs)
  // and hand the visitor a one-tap WhatsApp message with everything they typed.
  console.error("Enquiry email failed:", result.reason);
  return new Response(fallbackPage(env, text), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Enquiry-Email": "failed",
      "Cache-Control": "no-store",
    },
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

async function sendViaResend(env, { subject, text, html, attachments, replyTo }) {
  try {
    const payload = {
      from: env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
      to: [env.CONTACT_TO_EMAIL || "hello@nestneev.com"],
      subject,
      text,
      html,
    };
    if (attachments.length) payload.attachments = attachments;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) payload.reply_to = replyTo;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true };
    const body = (await res.text()).slice(0, 500);
    return { ok: false, reason: `Resend HTTP ${res.status}: ${body}` };
  } catch (e) {
    return { ok: false, reason: `Resend request failed: ${e && e.message ? e.message : e}` };
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

function fallbackPage(env, enquiryText) {
  const phone = escapeHtml(env.CONTACT_PHONE_DISPLAY || "");
  const wa = (env.CONTACT_WHATSAPP || "").replace(/\D/g, "");
  const message = `Hi NestNeev, I just tried to send an enquiry from your website:\n\n${enquiryText}`.slice(0, 1500);
  const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(message)}` : "";
  const tel = (env.CONTACT_PHONE_DISPLAY || "").replace(/[^\d+]/g, "");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>One more step - NestNeev</title></head>
<body style="font-family:system-ui,sans-serif;max-width:520px;margin:3rem auto;padding:0 1rem;text-align:center;line-height:1.5;">
<h1>One more step</h1>
<p>We couldn't deliver your enquiry by email just now. Please tap below to send the same details to us on WhatsApp &mdash; it's already filled in for you.</p>
${waHref ? `<p><a href="${waHref}" style="display:inline-block;background:#25D366;color:#fff;padding:.9rem 1.4rem;border-radius:8px;text-decoration:none;font-weight:700;">Send on WhatsApp</a></p>` : ""}
${tel ? `<p>Or call us: <a href="tel:${tel}">${phone}</a></p>` : ""}
<p><a href="/contact/">Back to Contact page</a></p>
</body></html>`;
}
