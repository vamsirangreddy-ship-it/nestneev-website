const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/buy/", label: "Buy" },
  { href: "/rent/", label: "Rent" },
  { href: "/sell/", label: "Sell" },
  { href: "/localities/", label: "Localities" },
  { href: "/blog/", label: "Blog" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function waLink(config, presetMessage) {
  const msg = encodeURIComponent(presetMessage || `Hi NestNeev, I'd like more information.`);
  return `https://wa.me/${config.whatsappNumber}?text=${msg}`;
}

function telLink(config) {
  return `tel:${config.phoneDial}`;
}

function paragraphs(text) {
  return String(text || "")
    .split(/\n\n+/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("\n");
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function siteHeader(config, activePath) {
  const links = NAV_ITEMS.map(
    (item) =>
      `<a href="${item.href}" class="${activePath === item.href ? "is-active" : ""}">${item.label}</a>`
  ).join("\n");
  return `
  <header class="site-header">
    <div class="container nav">
      <a href="/" class="nav__logo"><img src="/images/logo.svg" alt="${escapeHtml(config.siteName)}" width="160" height="32"></a>
      <nav class="nav__links" aria-label="Primary">
        ${links}
      </nav>
      <div class="nav__cta">
        <a href="${telLink(config)}" class="btn btn--outline btn--sm">Call Us</a>
        <a href="${waLink(config)}" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm">WhatsApp</a>
      </div>
      <button class="nav__toggle" aria-label="Open menu" aria-expanded="false"><span></span></button>
    </div>
    <div class="mobile-menu">
      ${NAV_ITEMS.map((item) => `<a href="${item.href}">${item.label}</a>`).join("\n")}
      <a href="${telLink(config)}" class="btn btn--outline btn--block">Call ${escapeHtml(config.phoneDisplay)}</a>
      <a href="${waLink(config)}" target="_blank" rel="noopener" class="btn btn--whatsapp btn--block">Chat on WhatsApp</a>
    </div>
  </header>`;
}

function siteFooter(config) {
  const social = config.social || {};
  const socialLinks = [
    social.instagram ? `<a href="${social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">IG</a>` : "",
    social.facebook ? `<a href="${social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">FB</a>` : "",
    social.linkedin ? `<a href="${social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">IN</a>` : "",
    social.youtube ? `<a href="${social.youtube}" target="_blank" rel="noopener" aria-label="YouTube">YT</a>` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/images/logo-white.svg" alt="${escapeHtml(config.siteName)}" width="150" height="30">
          <p>${escapeHtml(config.description)}</p>
          <div class="footer-social">${socialLinks}</div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/buy/">Buy a Property</a></li>
            <li><a href="/rent/">Rent a Property</a></li>
            <li><a href="/sell/">Sell / Post Property</a></li>
            <li><a href="/localities/">Popular Localities</a></li>
            <li><a href="/blog/">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="/about/">About Us</a></li>
            <li><a href="/contact/">Contact Us</a></li>
            <li><a href="/privacy-policy/">Privacy Policy</a></li>
            <li><a href="/terms-and-conditions/">Terms &amp; Conditions</a></li>
            <li><a href="/rera-disclaimer/">RERA Disclaimer</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>${escapeHtml(config.address.line1)}, ${escapeHtml(config.address.line2)}</li>
            <li>${escapeHtml(config.city)}, ${escapeHtml(config.state)} ${escapeHtml(config.address.pincode)}</li>
            <li><a href="${telLink(config)}">${escapeHtml(config.phoneDisplay)}</a></li>
            <li><a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} ${escapeHtml(config.siteName)}. All rights reserved.</span>
        <span><a href="/privacy-policy/">Privacy</a> &middot; <a href="/terms-and-conditions/">Terms</a> &middot; <a href="/rera-disclaimer/">RERA Disclaimer</a></span>
      </div>
      <p class="rera-disclaimer">${escapeHtml(config.reraDisclaimerShort)}</p>
    </div>
  </footer>
  <a href="${waLink(config)}" target="_blank" rel="noopener" class="whatsapp-float" aria-label="Chat on WhatsApp">&#9743;</a>`;
}

function layout({ config, title, description, path, bodyClass, content, jsonLd, ogImage }) {
  const fullTitle = title ? `${title} | ${config.siteName}` : `${config.siteName} — ${config.tagline}`;
  const canonical = `${config.domain}${path}`;
  const desc = description || config.description;
  const image = ogImage || `${config.domain}/images/listings/exterior.svg`;
  const ld = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="/images/favicon.svg">
<link rel="stylesheet" href="/css/styles.css">
${ld}
</head>
<body class="${bodyClass || ""}">
${siteHeader(config, path)}
${content}
${siteFooter(config)}
<script src="/js/main.js" defer></script>
</body>
</html>`;
}

function propertyCard(listing, locality, config) {
  const img = (listing.images && listing.images[0] && listing.images[0].src) || "/images/listings/exterior.svg";
  const purposeBadge = listing.purpose === "buy" ? `<span class="badge badge--buy">For Sale</span>` : `<span class="badge badge--rent">For Rent</span>`;
  const areaUnit = listing.areaUnit === "sqyd" ? "sq. yd." : "sq. ft.";
  const bhkText = listing.bhk ? `${listing.bhk} BHK` : humanizePropertyType(listing.propertyType);
  const enquiryMsg = `Hi NestNeev, I'm interested in "${listing.title}" (${config.domain}/property/${listing.slug}/).`;
  return `
  <article class="property-card" data-locality="${listing.localitySlug}" data-type="${listing.propertyType}" data-bhk="${listing.bhk || ""}" data-price="${listing.price}" data-area="${listing.areaSqft}" data-possession="${listing.possessionStatus}" data-furnishing="${listing.furnishing}" data-posted="${listing.postedDate}">
    <a href="/property/${listing.slug}/" class="property-card__media">
      <img src="${img}" alt="${escapeHtml(listing.title)}" loading="lazy">
      <div class="property-card__badges">${purposeBadge}${listing.featured ? '<span class="badge badge--gold">Featured</span>' : ""}</div>
    </a>
    <div class="property-card__body">
      <div class="property-card__price">${escapeHtml(listing.priceLabel)}</div>
      <a href="/property/${listing.slug}/"><h3 class="property-card__title">${escapeHtml(listing.title)}</h3></a>
      <div class="property-card__locality">${escapeHtml(locality ? locality.name : listing.localitySlug)}, Gurugram</div>
      <div class="property-card__specs">
        <span>${bhkText}</span>
        <span>${listing.areaSqft} ${areaUnit}</span>
        <span>${humanizePossession(listing.possessionStatus)}</span>
      </div>
      <div class="property-card__actions">
        <a href="${telLink(config)}" class="btn btn--outline btn--sm">Call</a>
        <a href="${waLink(config, enquiryMsg)}" target="_blank" rel="noopener" class="btn btn--whatsapp btn--sm">WhatsApp</a>
      </div>
    </div>
  </article>`;
}

function humanizePropertyType(type) {
  return (
    {
      apartment: "Apartment",
      villa: "Villa",
      "independent-house": "Independent Floor",
      plot: "Plot",
      commercial: "Commercial",
    }[type] || type
  );
}

function humanizePossession(status) {
  return (
    {
      "ready-to-move": "Ready to Move",
      "under-construction": "Under Construction",
    }[status] || status
  );
}

function localityCard(locality) {
  return `
  <a href="/localities/${locality.slug}/" class="locality-card">
    <img src="${locality.image}" alt="${escapeHtml(locality.name)}" loading="lazy">
    <div class="locality-card__label">
      <strong>${escapeHtml(locality.name)}</strong>
      <span>${escapeHtml(locality.region)}</span>
    </div>
  </a>`;
}

function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${items
    .map((it, i) => (i < items.length - 1 ? `<a href="${it.href}">${escapeHtml(it.label)}</a> / ` : `<span>${escapeHtml(it.label)}</span>`))
    .join("")}</nav>`;
}

module.exports = {
  NAV_ITEMS,
  escapeHtml,
  waLink,
  telLink,
  paragraphs,
  formatDate,
  siteHeader,
  siteFooter,
  layout,
  propertyCard,
  humanizePropertyType,
  humanizePossession,
  localityCard,
  breadcrumbs,
};
