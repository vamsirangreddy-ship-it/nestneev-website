# NestNeev — Gurugram Real Estate Website

A complete, ready-to-deploy website for NestNeev: Buy / Sell / Rent property listings
for Gurugram, Haryana. No paid software required to run or maintain it.

## What's in here

- A full static website (Home, Buy, Rent, Property detail pages, Sell/Post Property,
  Locality pages, Blog, About, Contact, Privacy Policy, Terms & Conditions, RERA
  Disclaimer) — mobile-first, fast-loading, SEO-ready (meta tags, sitemap.xml,
  robots.txt, schema.org markup on every listing).
- `/admin` — a no-code content editor (see "Adding & editing listings" below) where
  you can add, edit, or remove property listings, localities, blog posts, and
  testimonials, and update your phone/WhatsApp number, email, address, and social
  links — all without touching any code.
- `/content` — the actual data (one file per listing/locality/blog post). This is
  what the `/admin` editor reads and writes.
- `/scripts/build.js` — a small script (no external packages required) that turns
  `/content` into the finished website in `/dist`.
- `/public` — images, CSS, and JavaScript.

**10 sample listings, 16 locality pages, and 3 blog posts are already loaded** so the
site is fully functional out of the box. Replace them with your real listings
whenever you're ready.

## Before you go live — placeholders to replace

I filled in reasonable placeholders wherever I didn't have your real details yet.
Update these in `/admin` → **Site Settings** (or by editing `content/config.json`)
before launch:

- **Phone number** (`phoneDisplay`, `phoneDial`) — currently `+91 98XXX XXXXX`
- **WhatsApp number** (`whatsappNumber`) — currently `9198XXXXXXXX`
- **Email address** — currently `hello@nestneev.com`
- **Office address** — currently marked `PLACEHOLDER`
- **Social media links** — Instagram/Facebook/LinkedIn are placeholder URLs
- **Haryana RERA registration number** — currently `PLACEHOLDER-HRERA-GGM-XXXX-XXXX`
  in the footer disclaimer, and per-listing where applicable
- **Homepage stats** (properties listed / happy clients / etc.) — currently
  round placeholder numbers; swap in your real figures
- **Testimonials** — currently sample placeholder text ("[Sample placeholder —
  replace with a real client quote...]"). **Please don't publish these as-is** —
  replace each one with a real client review before launch
- **Legal pages** (Privacy Policy, Terms & Conditions, RERA Disclaimer) — solid
  starter templates, but have them reviewed by a lawyer familiar with Haryana RERA
  before publishing, especially the RERA Disclaimer page

## Adding, editing, or removing a listing (no code)

Once the site is deployed (see below), go to `yourdomain.com/admin`. You'll see:

1. **Property Listings** — click "New Property Listings", fill in the form (title,
   price, locality, BHK, amenities, upload photos, etc.), and click **Publish**.
   To edit or remove one, open it from the list, make changes (or click Delete),
   and Publish.
2. **Localities** — add a new Gurugram sector/area the same way; it automatically
   gets its own page at `/localities/<name>/`.
3. **Blog Posts** — add articles the same way.
4. **Testimonials** — replace the sample quotes with real client reviews.
5. **Site Settings** — update your phone, WhatsApp, email, address, social links,
   and RERA disclaimer text — these apply site-wide instantly.

Every change you publish automatically rebuilds and redeploys the live site within
a minute or two — nothing else to do.

## Running / rebuilding locally (optional, for the technically curious)

```bash
node scripts/build.js
```

This regenerates `/dist` — the finished, deployable site — from whatever is in
`/content`. No `npm install` needed; it only uses Node's built-in modules.

## Deployment (what I recommend, and why)

**Netlify**, free tier:
- Connects directly to a GitHub repo and rebuilds automatically on every change
  (including changes made through `/admin`)
- Free SSL/HTTPS, custom domain support, and free-tier form handling (your
  enquiry/contact/sell forms email you automatically — no extra service needed)
- No credit card required to start

I haven't created any accounts on your behalf — GitHub, Netlify, and the domain
connection all need your login. When you're ready, I can walk you through each
step (creating the GitHub repo, connecting Netlify, enabling the `/admin` login,
and pointing nestneev.com at it via GoDaddy DNS) interactively. High level, it's:

1. Push this project to a new GitHub repository (I can guide you, or do it directly
   if you'd like to connect GitHub here).
2. Create a free Netlify account and "Import from Git" → select the repo. Netlify
   auto-detects the build command and publish folder from `netlify.toml`.
3. In Netlify: Site settings → Identity → enable it, then Identity → Services →
   enable **Git Gateway**. This is what lets `/admin` log you in without a
   separate account system.
4. In Netlify: Domain settings → add `nestneev.com` → Netlify gives you the DNS
   records to add. In GoDaddy: DNS settings for nestneev.com → add those records
   (typically an A record for the root domain and a CNAME for `www`). SSL
   certificates are issued automatically once DNS points to Netlify — usually
   within a few minutes to an hour.

I'll confirm each of these with you before touching anything live, per your
original instructions.

## Project structure

```
content/          → all editable data (listings, localities, blog, config, testimonials)
scripts/          → build.js (site generator) + templates.js (HTML templates)
public/           → css, js, images (static assets)
admin/            → the no-code CMS (Decap CMS) config
dist/             → the generated, deployable website (built by scripts/build.js)
netlify.toml      → tells Netlify how to build and deploy this project
```
