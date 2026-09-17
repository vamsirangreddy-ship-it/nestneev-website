#!/usr/bin/env node
/**
 * NestNeev static site generator.
 * Zero external dependencies — uses only Node core modules, so it runs
 * anywhere Node runs (including Netlify's build step) with no `npm install`.
 *
 * Reads content from /content, renders HTML with /scripts/templates.js,
 * and writes the finished site to /dist, which is what gets deployed.
 *
 * Run with: node scripts/build.js
 */
const fs = require("fs");
const path = require("path");
const T = require("./templates");

const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const PUBLIC = path.join(ROOT, "public");
const DIST = path.join(ROOT, "dist");

/* ---------------------------------------------------------------------- */
/* Content loading                                                        */
/* ---------------------------------------------------------------------- */
function loadJSONDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

const config = JSON.parse(fs.readFileSync(path.join(CONTENT, "config.json"), "utf8"));
const listings = loadJSONDir(path.join(CONTENT, "listings")).sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
const localities = loadJSONDir(path.join(CONTENT, "localities")).sort((a, b) => a.name.localeCompare(b.name));
const blogPosts = loadJSONDir(path.join(CONTENT, "blog")).sort((a, b) => new Date(b.date) - new Date(a.date));
const testimonials = JSON.parse(fs.readFileSync(path.join(CONTENT, "testimonials.json"), "utf8"));

const localityBySlug = Object.fromEntries(localities.map((l) => [l.slug, l]));

/* ---------------------------------------------------------------------- */
/* File writer                                                             */
/* ---------------------------------------------------------------------- */
function writePage(urlPath, html) {
  const dir = urlPath.endsWith("/") ? path.join(DIST, urlPath) : path.join(DIST, urlPath, "..");
  const file = urlPath.endsWith("/") ? path.join(dir, "index.html") : path.join(DIST, urlPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/* ---------------------------------------------------------------------- */
/* Shared section builders                                                */
/* ---------------------------------------------------------------------- */
function localityOptions(selected) {
  return (
    `<option value="">Any Locality</option>` +
    localities.map((l) => `<option value="${l.slug}" ${selected === l.slug ? "selected" : ""}>${T.escapeHtml(l.name)}</option>`).join("")
  );
}

function typeOptions(selected) {
  const types = [
    ["apartment", "Apartment"],
    ["villa", "Villa"],
    ["independent-house", "Independent Floor / House"],
    ["plot", "Plot"],
    ["commercial", "Commercial"],
  ];
  return (
    `<option value="">Any Type</option>` +
    types.map(([v, l]) => `<option value="${v}" ${selected === v ? "selected" : ""}>${l}</option>`).join("")
  );
}

function bhkOptions(selected) {
  return (
    `<option value="">Any BHK</option>` +
    [1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${String(selected) === String(n) ? "selected" : ""}>${n} BHK${n === 5 ? "+" : ""}</option>`).join("")
  );
}

function possessionOptions(selected) {
  return (
    `<option value="">Any</option>` +
    [
      ["ready-to-move", "Ready to Move"],
      ["under-construction", "Under Construction"],
    ]
      .map(([v, l]) => `<option value="${v}" ${selected === v ? "selected" : ""}>${l}</option>`)
      .join("")
  );
}

function furnishingOptions(selected) {
  return (
    `<option value="">Any</option>` +
    [
      ["unfurnished", "Unfurnished"],
      ["semi-furnished", "Semi-Furnished"],
      ["fully-furnished", "Fully-Furnished"],
    ]
      .map(([v, l]) => `<option value="${v}" ${selected === v ? "selected" : ""}>${l}</option>`)
      .join("")
  );
}

function heroSearch() {
  return `
  <div class="search-widget" data-search-widget>
    <div class="search-tabs">
      <button type="button" class="search-tabs__tab is-active" data-tab="buy">Buy</button>
      <button type="button" class="search-tabs__tab" data-tab="sell">Sell</button>
      <button type="button" class="search-tabs__tab" data-tab="rent">Rent</button>
    </div>
    <form data-purpose="buy">
      <input type="hidden" name="purpose" value="buy">
      <div class="search-form">
        <div class="search-form__grid search-form__grid--5">
          <div class="search-form__field">
            <label for="s-locality">Locality</label>
            <select id="s-locality" name="locality">${localityOptions()}</select>
          </div>
          <div class="search-form__field">
            <label for="s-type">Property Type</label>
            <select id="s-type" name="type">${typeOptions()}</select>
          </div>
          <div class="search-form__field">
            <label for="s-bhk">BHK</label>
            <select id="s-bhk" name="bhk">${bhkOptions()}</select>
          </div>
          <div class="search-form__field">
            <label for="s-budget">Max Budget (&#8377;)</label>
            <input id="s-budget" type="number" name="maxPrice" placeholder="e.g. 5000000">
          </div>
          <div class="search-form__actions">
            <button type="submit" class="btn btn--primary btn--block">Search</button>
          </div>
        </div>
      </div>
    </form>
  </div>`;
}

function trustGrid() {
  const items = [
    { icon: "★", title: "Local Gurugram Expertise", body: "We work only in Gurugram, so we know every sector, society, and price trend inside out." },
    { icon: "✓", title: "Verified Listings", body: "Every listing is checked for accuracy before it goes live — no fake or stale properties." },
    { icon: "§", title: "RERA-Aware Process", body: "We flag RERA registration details on listings and guide you through Haryana RERA basics." },
    { icon: "⇄", title: "End-to-End Support", body: "From shortlisting to paperwork, we stay with you through the entire Buy, Sell, or Rent process." },
  ];
  return `<div class="trust-grid">${items
    .map(
      (it) => `<div class="trust-card"><div class="icon-circle">${it.icon}</div><h3>${it.title}</h3><p>${it.body}</p></div>`
    )
    .join("")}</div>`;
}

function statsStrip() {
  const s = config.stats;
  return `<div class="stats-strip">
    <div><strong>${T.escapeHtml(s.propertiesListed)}</strong><span>Properties Listed</span></div>
    <div><strong>${T.escapeHtml(s.happyClients)}</strong><span>Happy Clients</span></div>
    <div><strong>${T.escapeHtml(s.localitiesCovered)}</strong><span>Localities Covered</span></div>
    <div><strong>${T.escapeHtml(s.yearsInGurugram)}</strong><span>Years in Gurugram</span></div>
  </div>`;
}

function testimonialGrid() {
  return `<div class="testimonial-grid">${testimonials.items
    .map(
      (t) => `<div class="testimonial-card">
        <p class="testimonial-card__quote">&ldquo;${T.escapeHtml(t.quote)}&rdquo;</p>
        <div class="testimonial-card__person">
          <img src="/images/avatar-placeholder.svg" alt="">
          <div><strong>${T.escapeHtml(t.name)}</strong><span>${T.escapeHtml(t.detail)}</span></div>
        </div>
      </div>`
    )
    .join("")}</div>`;
}

function enquiryForm({ formName, hiddenFields = {}, submitLabel = "Send Enquiry", includeMessage = true }) {
  const hidden = Object.entries(hiddenFields)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${T.escapeHtml(v)}">`)
    .join("\n");
  return `
  <form class="enquiry-form" name="${formName}" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/thank-you/">
    <input type="hidden" name="form-name" value="${formName}">
    <p class="visually-hidden"><label>Don't fill this out: <input name="bot-field"></label></p>
    ${hidden}
    <div class="form-grid form-grid--2">
      <div class="form-field">
        <label for="${formName}-name">Full Name *</label>
        <input id="${formName}-name" type="text" name="name" required>
      </div>
      <div class="form-field">
        <label for="${formName}-phone">Phone Number *</label>
        <input id="${formName}-phone" type="tel" name="phone" required>
      </div>
    </div>
    <div class="form-field">
      <label for="${formName}-email">Email</label>
      <input id="${formName}-email" type="email" name="email">
    </div>
    ${
      includeMessage
        ? `<div class="form-field">
      <label for="${formName}-message">Message</label>
      <textarea id="${formName}-message" name="message" placeholder="Tell us what you're looking for..."></textarea>
    </div>`
        : ""
    }
    <button type="submit" class="btn btn--primary btn--block">${submitLabel}</button>
    <p class="form-note">By submitting, you agree to be contacted by NestNeev regarding this enquiry.</p>
  </form>`;
}

/* ---------------------------------------------------------------------- */
/* Homepage                                                                */
/* ---------------------------------------------------------------------- */
function buildHomepage() {
  const featured = listings.filter((l) => l.featured);
  const featuredLocalities = localities.filter((l) => l.featured);

  const content = `
  <section class="hero">
    <div class="container hero__inner">
      <span class="eyebrow">Gurugram, Haryana</span>
      <h1>Find your next home in Gurugram &mdash; Buy, Sell, or Rent with confidence.</h1>
      <p class="hero__lede">${T.escapeHtml(config.description)}</p>
      <div class="hero__stats">
        <div class="hero__stat"><strong>${T.escapeHtml(config.stats.propertiesListed)}</strong><span>Properties Listed</span></div>
        <div class="hero__stat"><strong>${T.escapeHtml(config.stats.happyClients)}</strong><span>Happy Clients</span></div>
        <div class="hero__stat"><strong>${T.escapeHtml(config.stats.localitiesCovered)}</strong><span>Localities Covered</span></div>
      </div>
      ${heroSearch()}
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section__header">
        <span class="eyebrow">Featured</span>
        <h2>Premium listings, handpicked for you</h2>
      </div>
      <div class="carousel" data-listing-grid>
        ${featured.map((l) => T.propertyCard(l, localityBySlug[l.localitySlug], config)).join("\n")}
      </div>
      <div class="text-center" style="margin-top:1.5rem;">
        <a href="/buy/" class="btn btn--outline">View All Properties</a>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <div class="section__header">
        <span class="eyebrow">Explore</span>
        <h2>Popular Gurugram localities</h2>
      </div>
      <div class="locality-scroller">
        ${featuredLocalities.map((l) => T.localityCard(l)).join("\n")}
      </div>
      <div class="text-center" style="margin-top:1.5rem;">
        <a href="/localities/" class="btn btn--outline">Browse All Localities</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section__header section__header--center">
        <span class="eyebrow">Why NestNeev</span>
        <h2>A team that actually knows Gurugram</h2>
      </div>
      ${trustGrid()}
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      ${statsStrip()}
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section__header section__header--center">
        <span class="eyebrow">Testimonials</span>
        <h2>What our clients say</h2>
      </div>
      ${testimonialGrid()}
    </div>
  </section>
  `;

  writePage("/", T.layout({ config, title: "", path: "/", content }));
}

/* ---------------------------------------------------------------------- */
/* Buy / Rent listing pages                                                */
/* ---------------------------------------------------------------------- */
function buildListingPage(purpose) {
  const isBuy = purpose === "buy";
  const pageTitle = isBuy ? "Properties for Sale in Gurugram" : "Properties for Rent in Gurugram";
  const items = listings.filter((l) => l.purpose === purpose);

  const content = `
  <section class="page-hero">
    <div class="container">
      <h1>${pageTitle}</h1>
      <p>${items.length} verified ${isBuy ? "properties for sale" : "rental properties"} across Gurugram, updated regularly.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="listing-layout">
        <aside class="filters" id="property-filters" data-filter-form-wrap>
          <h3>Filter Properties</h3>
          <form data-filter-form>
            <div class="filters__group">
              <label class="filters__label" for="f-locality">Locality</label>
              <select id="f-locality" name="locality">${localityOptions()}</select>
            </div>
            <div class="filters__group">
              <label class="filters__label" for="f-type">Property Type</label>
              <select id="f-type" name="type">${typeOptions()}</select>
            </div>
            <div class="filters__group">
              <label class="filters__label" for="f-bhk">BHK</label>
              <select id="f-bhk" name="bhk">${bhkOptions()}</select>
            </div>
            <div class="filters__group">
              <label class="filters__label">Price Range (&#8377;)</label>
              <div class="flex gap-sm">
                <input type="number" name="minPrice" placeholder="Min">
                <input type="number" name="maxPrice" placeholder="Max">
              </div>
            </div>
            <div class="filters__group">
              <label class="filters__label" for="f-possession">Possession</label>
              <select id="f-possession" name="possession">${possessionOptions()}</select>
            </div>
            <div class="filters__group">
              <label class="filters__label" for="f-furnishing">Furnishing</label>
              <select id="f-furnishing" name="furnishing">${furnishingOptions()}</select>
            </div>
            <button type="reset" class="btn btn--outline btn--block btn--sm">Clear Filters</button>
          </form>
        </aside>
        <div class="listing-results">
          <div class="listing-toolbar">
            <a href="#property-filters" class="filters-jump">Filters &#9881;</a>
            <span class="results-count" data-results-count>${items.length} properties found</span>
            <select data-sort aria-label="Sort by">
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-desc">Area: Largest First</option>
            </select>
          </div>
          <div class="property-grid" data-listing-grid>
            ${items.map((l) => T.propertyCard(l, localityBySlug[l.localitySlug], config)).join("\n")}
          </div>
          <div class="empty-state" data-empty-state style="display:none;">
            <h3>No properties match those filters</h3>
            <p>Try widening your price range or clearing a filter, or message us directly and we'll help you find something.</p>
            <a href="${T.waLink(config, `Hi NestNeev, I couldn't find a matching ${purpose === "buy" ? "property to buy" : "rental"} on the site — can you help me search?`)}" class="btn btn--whatsapp" target="_blank" rel="noopener">Ask on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  writePage(`/${purpose}/`, T.layout({ config, title: pageTitle, path: `/${purpose}/`, content }));
}

/* ---------------------------------------------------------------------- */
/* Property detail pages                                                   */
/* ---------------------------------------------------------------------- */
function buildPropertyPages() {
  listings.forEach((listing) => {
    const locality = localityBySlug[listing.localitySlug];
    const images = listing.images && listing.images.length ? listing.images.map((i) => i.src) : ["/images/listings/exterior.svg"];
    const areaUnit = listing.areaUnit === "sqyd" ? "sq. yd." : "sq. ft.";
    const purposeLabel = listing.purpose === "buy" ? "Buy" : "Rent";

    const specsRows = [
      ["Property Type", T.humanizePropertyType(listing.propertyType)],
      ["Bedrooms", listing.specs.bedrooms ?? "—"],
      ["Bathrooms", listing.specs.bathrooms ?? "—"],
      ["Balconies", listing.specs.balconies ?? "—"],
      ["Area", `${listing.areaSqft} ${areaUnit}`],
      ["Floor", listing.specs.floor ?? "—"],
      ["Facing", listing.specs.facing ?? "—"],
      ["Age of Property", listing.specs.age ?? "—"],
      ["Furnishing", listing.furnishing.replace(/-/g, " ")],
      ["Possession Status", T.humanizePossession(listing.possessionStatus)],
    ];

    const similar = listings
      .filter((l) => l.slug !== listing.slug && (l.localitySlug === listing.localitySlug || l.propertyType === listing.propertyType) && l.purpose === listing.purpose)
      .slice(0, 3);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: listing.title,
      description: listing.description,
      url: `${config.domain}/property/${listing.slug}/`,
      image: images.map((i) => `${config.domain}${i}`),
      datePosted: listing.postedDate,
      address: {
        "@type": "PostalAddress",
        addressLocality: locality ? locality.name : config.city,
        addressRegion: config.state,
        addressCountry: "IN",
      },
      floorSize: { "@type": "QuantitativeValue", value: listing.areaSqft, unitCode: listing.areaUnit === "sqyd" ? "YDQ" : "FTK" },
      numberOfRooms: listing.bhk || undefined,
      offers: {
        "@type": "Offer",
        price: listing.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    };

    const content = `
    <section class="section section--tight">
      <div class="container">
        ${T.breadcrumbs([
          { href: "/", label: "Home" },
          { href: `/${listing.purpose}/`, label: purposeLabel },
          { href: `/property/${listing.slug}/`, label: listing.title },
        ])}

        <div class="detail-header">
          <div>
            <h1>${T.escapeHtml(listing.title)}</h1>
            <p class="text-muted mb-0">${T.escapeHtml(locality ? locality.name : "")}, ${T.escapeHtml(config.city)}, ${T.escapeHtml(config.state)}</p>
          </div>
          <div class="detail-price">${T.escapeHtml(listing.priceLabel)}</div>
        </div>

        <div class="gallery">
          <div class="gallery__main" data-gallery-main><img src="${images[0]}" alt="${T.escapeHtml(listing.title)}"></div>
          <div class="gallery__thumbs">
            ${images.map((img, i) => `<img src="${img}" data-gallery-thumb class="${i === 0 ? "is-active" : ""}" alt="View ${i + 1}">`).join("")}
          </div>
        </div>

        <div class="detail-layout">
          <div>
            <h2>About this property</h2>
            ${T.paragraphs(listing.description)}

            <h2>Specifications</h2>
            <table class="specs-table">
              ${specsRows.map(([k, v]) => `<tr><td>${k}</td><td>${T.escapeHtml(v)}</td></tr>`).join("")}
            </table>

            <h2>Amenities</h2>
            <ul class="amenities-list">
              ${listing.amenities.map((a) => `<li>${T.escapeHtml(a)}</li>`).join("")}
            </ul>

            ${
              listing.floorPlanImage
                ? `<h2>Floor Plan</h2><img src="${listing.floorPlanImage}" alt="Floor plan for ${T.escapeHtml(listing.title)}" style="border-radius:12px;border:1px solid var(--color-border);">`
                : ""
            }

            <h2>Location</h2>
            <div class="map-embed">
              <iframe src="${config.googleMapsEmbedDefault}" loading="lazy" title="Map showing approximate location"></iframe>
            </div>

            <p class="rera-note">RERA Registration Number: <strong>${listing.reraNumber ? T.escapeHtml(listing.reraNumber) : "Not yet available for this listing"}</strong>. ${T.escapeHtml(config.reraDisclaimerShort)}</p>
          </div>

          <aside>
            <div class="sidebar-card">
              <div class="agent-line">
                <img src="/images/avatar-placeholder.svg" alt="">
                <div><strong>${T.escapeHtml(config.siteName)} Team</strong><br><span class="text-muted">Usually replies within a day</span></div>
              </div>
              <a href="${T.telLink(config)}" class="btn btn--dark btn--block">Call ${T.escapeHtml(config.phoneDisplay)}</a>
              <a href="${T.waLink(config, `Hi NestNeev, I'm interested in "${listing.title}" (${config.domain}/property/${listing.slug}/).`)}" target="_blank" rel="noopener" class="btn btn--whatsapp btn--block">Chat on WhatsApp</a>
              <hr style="border:none;border-top:1px solid var(--color-border);margin:1.25rem 0;">
              <h3>Enquire about this property</h3>
              ${enquiryForm({
                formName: "property-enquiry",
                hiddenFields: { property: listing.title, "property-url": `${config.domain}/property/${listing.slug}/` },
                submitLabel: "Send Enquiry",
              })}
              <div class="form-success">Thanks! Your enquiry has been sent — we'll be in touch shortly.</div>
            </div>
          </aside>
        </div>

        ${
          similar.length
            ? `<div class="section section--tight">
          <div class="section__header"><h2>Similar Properties</h2></div>
          <div class="property-grid">
            ${similar.map((l) => T.propertyCard(l, localityBySlug[l.localitySlug], config)).join("\n")}
          </div>
        </div>`
            : ""
        }
      </div>
    </section>`;

    writePage(`/property/${listing.slug}/`, T.layout({ config, title: listing.title, description: listing.description, path: `/property/${listing.slug}/`, content, jsonLd, ogImage: `${config.domain}${images[0]}` }));
  });
}

/* ---------------------------------------------------------------------- */
/* Sell / Post Property page                                               */
/* ---------------------------------------------------------------------- */
function buildSellPage() {
  const steps = [
    { title: "Tell us about your property", body: "Fill in the quick form below with your property and contact details." },
    { title: "We call you back", body: "Our team calls within one business day to understand pricing expectations and timelines." },
    { title: "We list & market it", body: "Once aligned, we create a listing with photos and specs and promote it to serious buyers/tenants." },
    { title: "You close the deal", body: "We coordinate site visits and paperwork support until the deal is closed." },
  ];

  const content = `
  <section class="page-hero">
    <div class="container">
      <h1>Sell or Rent Out Your Property</h1>
      <p>List your property with NestNeev and reach verified buyers and tenants across Gurugram.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section__header section__header--center">
        <span class="eyebrow">How it works</span>
        <h2>Selling with NestNeev is simple</h2>
      </div>
      <div class="steps">
        ${steps.map((s, i) => `<div class="step"><div class="step__num">${i + 1}</div><h3>${s.title}</h3><p>${s.body}</p></div>`).join("")}
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container" style="max-width:720px;">
      <div class="section__header section__header--center">
        <span class="eyebrow">Post Your Property</span>
        <h2>Tell us about your property</h2>
      </div>
      <form class="enquiry-form" name="sell-property" method="POST" data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data" action="/thank-you/">
        <input type="hidden" name="form-name" value="sell-property">
        <p class="visually-hidden"><label>Don't fill this out: <input name="bot-field"></label></p>
        <div class="form-grid form-grid--2">
          <div class="form-field">
            <label for="sp-name">Full Name *</label>
            <input id="sp-name" type="text" name="name" required>
          </div>
          <div class="form-field">
            <label for="sp-phone">Phone Number *</label>
            <input id="sp-phone" type="tel" name="phone" required>
          </div>
        </div>
        <div class="form-grid form-grid--2">
          <div class="form-field">
            <label for="sp-purpose">I want to *</label>
            <select id="sp-purpose" name="listingPurpose" required>
              <option value="sell">Sell</option>
              <option value="rent-out">Rent Out</option>
            </select>
          </div>
          <div class="form-field">
            <label for="sp-type">Property Type *</label>
            <select id="sp-type" name="propertyType" required>${typeOptions()}</select>
          </div>
        </div>
        <div class="form-grid form-grid--2">
          <div class="form-field">
            <label for="sp-locality">Locality *</label>
            <select id="sp-locality" name="locality" required>${localityOptions()}</select>
          </div>
          <div class="form-field">
            <label for="sp-price">Expected Price / Rent (&#8377;) *</label>
            <input id="sp-price" type="number" name="expectedPrice" required>
          </div>
        </div>
        <div class="form-field">
          <label for="sp-description">Property Description</label>
          <textarea id="sp-description" name="description" placeholder="BHK, area, floor, age, any details that would help us list it well"></textarea>
        </div>
        <div class="form-field">
          <label for="sp-photos">Upload Photos</label>
          <input id="sp-photos" type="file" name="photos" accept="image/*" multiple>
        </div>
        <button type="submit" class="btn btn--primary btn--block">Submit Property Details</button>
        <p class="form-note">Our team typically calls back within one business day.</p>
      </form>
      <div class="form-success">Thanks! We've received your property details and will call you back shortly.</div>
    </div>
  </section>`;

  writePage("/sell/", T.layout({ config, title: "Sell or Rent Out Your Property", path: "/sell/", content }));
}

/* ---------------------------------------------------------------------- */
/* Localities                                                              */
/* ---------------------------------------------------------------------- */
function buildLocalitiesIndex() {
  const content = `
  <section class="page-hero">
    <div class="container">
      <h1>Popular Gurugram Localities</h1>
      <p>Explore properties by locality across Gurugram — from DLF Phases to Dwarka Expressway.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="locality-grid">
        ${localities.map((l) => T.localityCard(l)).join("\n")}
      </div>
    </div>
  </section>`;
  writePage("/localities/", T.layout({ config, title: "Popular Localities in Gurugram", path: "/localities/", content }));
}

function buildLocalityPages() {
  localities.forEach((locality) => {
    const items = listings.filter((l) => l.localitySlug === locality.slug);
    const content = `
    <section class="page-hero">
      <div class="container">
        ${T.breadcrumbs([
          { href: "/", label: "Home" },
          { href: "/localities/", label: "Localities" },
          { href: `/localities/${locality.slug}/`, label: locality.name },
        ])}
        <h1>Properties in ${T.escapeHtml(locality.name)}, Gurugram</h1>
        <p>${T.escapeHtml(locality.shortDescription)}</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="prose">
          ${T.paragraphs(locality.longDescription)}
        </div>
        <div class="section__header" style="margin-top:2rem;">
          <h2>${items.length} propert${items.length === 1 ? "y" : "ies"} in ${T.escapeHtml(locality.name)}</h2>
        </div>
        ${
          items.length
            ? `<div class="property-grid">${items.map((l) => T.propertyCard(l, locality, config)).join("\n")}</div>`
            : `<div class="empty-state"><h3>No live listings here right now</h3><p>New properties are added regularly — message us and we'll notify you.</p><a href="${T.waLink(
                config,
                `Hi NestNeev, please notify me about new listings in ${locality.name}.`
              )}" class="btn btn--whatsapp" target="_blank" rel="noopener">Notify Me on WhatsApp</a></div>`
        }
      </div>
    </section>`;
    writePage(`/localities/${locality.slug}/`, T.layout({ config, title: `Properties in ${locality.name}, Gurugram`, description: locality.shortDescription, path: `/localities/${locality.slug}/`, content }));
  });
}

/* ---------------------------------------------------------------------- */
/* Blog                                                                     */
/* ---------------------------------------------------------------------- */
function buildBlogIndex() {
  const content = `
  <section class="page-hero">
    <div class="container">
      <h1>NestNeev Blog</h1>
      <p>Guides and updates on buying, selling, and renting property in Gurugram.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="blog-grid">
        ${blogPosts
          .map(
            (p) => `<a href="/blog/${p.slug}/" class="blog-card">
          <img src="${p.coverImage}" alt="${T.escapeHtml(p.title)}" loading="lazy">
          <div class="blog-card__body">
            <div class="blog-card__date">${T.formatDate(p.date)}</div>
            <h3>${T.escapeHtml(p.title)}</h3>
            <p>${T.escapeHtml(p.excerpt)}</p>
          </div>
        </a>`
          )
          .join("\n")}
      </div>
    </div>
  </section>`;
  writePage("/blog/", T.layout({ config, title: "Blog", path: "/blog/", content }));
}

function buildBlogPosts() {
  blogPosts.forEach((post) => {
    const content = `
    <section class="section section--tight">
      <div class="container">
        ${T.breadcrumbs([
          { href: "/", label: "Home" },
          { href: "/blog/", label: "Blog" },
          { href: `/blog/${post.slug}/`, label: post.title },
        ])}
        <img src="${post.coverImage}" alt="${T.escapeHtml(post.title)}" style="border-radius:12px;max-height:340px;width:100%;object-fit:cover;margin-bottom:1.5rem;">
        <div class="blog-card__date">${T.formatDate(post.date)}</div>
        <h1>${T.escapeHtml(post.title)}</h1>
        <div class="blog-post__body">
          ${T.paragraphs(post.body)}
        </div>
      </div>
    </section>`;
    writePage(`/blog/${post.slug}/`, T.layout({ config, title: post.title, description: post.excerpt, path: `/blog/${post.slug}/`, content }));
  });
}

/* ---------------------------------------------------------------------- */
/* Supporting static pages                                                 */
/* ---------------------------------------------------------------------- */
function buildAbout() {
  const content = `
  <section class="page-hero"><div class="container"><h1>About NestNeev</h1><p>Gurugram real estate, made simple.</p></div></section>
  <section class="section">
    <div class="container prose">
      <p>NestNeev is a Gurugram-focused real estate platform helping families and professionals Buy, Sell, and Rent residential and commercial properties across the city — from the established DLF Phases and Golf Course Road to the fast-growing Dwarka Expressway corridor.</p>
      <h2>Our Mission</h2>
      <p>We believe finding a home shouldn't mean sifting through stale listings or unverified brokers. NestNeev focuses on accurate, up-to-date listings and straightforward support, from your first search to closing the deal.</p>
      <h2>Why NestNeev</h2>
      ${trustGrid()}
      <h2>Get in touch</h2>
      <p>Have a question or want to talk to our team directly? Visit our <a href="/contact/">Contact page</a> or reach out on WhatsApp.</p>
      <a href="${T.waLink(config)}" target="_blank" rel="noopener" class="btn btn--whatsapp">Chat on WhatsApp</a>
    </div>
  </section>`;
  writePage("/about/", T.layout({ config, title: "About Us", path: "/about/", content }));
}

function buildContact() {
  const content = `
  <section class="page-hero"><div class="container"><h1>Contact Us</h1><p>We usually respond within one business day.</p></div></section>
  <section class="section">
    <div class="container detail-layout">
      <div>
        <h2>Get in touch</h2>
        <p>Whether you're looking to Buy, Sell, or Rent in Gurugram, drop us a message and our team will get back to you.</p>
        <ul class="amenities-list" style="grid-template-columns:1fr;">
          <li>${T.escapeHtml(config.address.line1)}, ${T.escapeHtml(config.address.line2)}, ${T.escapeHtml(config.city)}, ${T.escapeHtml(config.state)} ${T.escapeHtml(config.address.pincode)}</li>
          <li><a href="${T.telLink(config)}">${T.escapeHtml(config.phoneDisplay)}</a></li>
          <li><a href="mailto:${T.escapeHtml(config.email)}">${T.escapeHtml(config.email)}</a></li>
        </ul>
        <div class="map-embed" style="margin-top:1.5rem;">
          <iframe src="${config.googleMapsEmbedDefault}" loading="lazy" title="Map"></iframe>
        </div>
      </div>
      <aside class="sidebar-card">
        <h3>Send us a message</h3>
        ${enquiryForm({ formName: "general-enquiry", submitLabel: "Send Message" })}
        <div class="form-success">Thanks for reaching out — we'll be in touch shortly.</div>
      </aside>
    </div>
  </section>`;
  writePage("/contact/", T.layout({ config, title: "Contact Us", path: "/contact/", content }));
}

function buildLegalPage(slug, title, bodyHtml) {
  const content = `
  <section class="page-hero"><div class="container"><h1>${title}</h1></div></section>
  <section class="section"><div class="container prose">${bodyHtml}</div></section>`;
  writePage(`/${slug}/`, T.layout({ config, title, path: `/${slug}/`, content }));
}

function buildLegalPages() {
  buildLegalPage(
    "privacy-policy",
    "Privacy Policy",
    `<p><em>Last updated: ${T.formatDate(new Date().toISOString())}. This is a starter template — please have it reviewed by a legal professional before publishing.</em></p>
    <h2>Information We Collect</h2>
    <p>When you use ${T.escapeHtml(config.siteName)}, we may collect information you provide directly, such as your name, phone number, and email address when you submit an enquiry, contact form, or property listing.</p>
    <h2>How We Use Your Information</h2>
    <p>We use the information you provide to respond to enquiries, share relevant property listings, and improve our services. We do not sell your personal information to third parties.</p>
    <h2>Data Sharing</h2>
    <p>We may share your information with our internal team members handling your enquiry. We do not share your information with unrelated third parties without your consent, except where required by law.</p>
    <h2>Cookies</h2>
    <p>Our website may use basic cookies or analytics tools to understand site usage and improve user experience.</p>
    <h2>Contact Us</h2>
    <p>For questions about this policy, contact us at <a href="mailto:${T.escapeHtml(config.email)}">${T.escapeHtml(config.email)}</a>.</p>`
  );

  buildLegalPage(
    "terms-and-conditions",
    "Terms &amp; Conditions",
    `<p><em>Last updated: ${T.formatDate(new Date().toISOString())}. This is a starter template — please have it reviewed by a legal professional before publishing.</em></p>
    <h2>Use of This Website</h2>
    <p>This website is provided by ${T.escapeHtml(config.siteName)} for informational purposes to help users explore properties available to Buy, Sell, or Rent in Gurugram, Haryana.</p>
    <h2>Listing Accuracy</h2>
    <p>While we make efforts to keep listings accurate and up to date, property availability, pricing, and specifications are subject to change and should be independently verified before making any decisions.</p>
    <h2>No Binding Offer</h2>
    <p>Nothing on this website constitutes a legal offer or contract. All transactions are subject to separate written agreements between the buyer/tenant, seller/landlord, and any applicable legal or regulatory requirements, including Haryana RERA where applicable.</p>
    <h2>Limitation of Liability</h2>
    <p>${T.escapeHtml(config.siteName)} is not liable for any loss or damage arising from reliance on information published on this website.</p>
    <h2>Governing Law</h2>
    <p>These terms are governed by the laws of India, with courts in Gurugram, Haryana having jurisdiction.</p>`
  );

  buildLegalPage(
    "rera-disclaimer",
    "RERA Disclaimer",
    `<p><em>This is a starter template — please have the wording reviewed against current Haryana RERA (HRERA) requirements before publishing.</em></p>
    <p>${T.escapeHtml(config.reraDisclaimerShort)}</p>
    <h2>About Haryana RERA</h2>
    <p>The Haryana Real Estate Regulatory Authority (HRERA) regulates real estate projects and agents in the state under the Real Estate (Regulation and Development) Act, 2016. Projects above the notified threshold are required to be registered with HRERA before being marketed or sold.</p>
    <h2>Verifying RERA Numbers</h2>
    <p>Where available, we display the RERA registration number for a project on its listing page. We encourage buyers to independently verify registration details on the official HRERA website before making any commitments.</p>
    <h2>No Registration Available</h2>
    <p>For resale properties, rentals, plots, or listings where a project-level RERA number does not apply or is not yet available, this will be noted on the listing page.</p>`
  );
}

function build404() {
  const content = `
  <section class="section" style="padding:5rem 0;text-align:center;">
    <div class="container">
      <h1>Page not found</h1>
      <p>The page you're looking for may have moved or no longer exists.</p>
      <a href="/" class="btn btn--primary">Back to Home</a>
    </div>
  </section>`;
  fs.writeFileSync(path.join(DIST, "404.html"), T.layout({ config, title: "Page Not Found", path: "/404.html", content }));
}

function buildThankYou() {
  const content = `
  <section class="section" style="padding:5rem 0;text-align:center;">
    <div class="container">
      <h1>Thank you!</h1>
      <p>Your message has been received. Our team will get back to you shortly.</p>
      <a href="/" class="btn btn--primary">Back to Home</a>
    </div>
  </section>`;
  writePage("/thank-you/", T.layout({ config, title: "Thank You", path: "/thank-you/", content }));
}

/* ---------------------------------------------------------------------- */
/* SEO: sitemap + robots                                                   */
/* ---------------------------------------------------------------------- */
function buildSEOFiles() {
  const staticPaths = ["/", "/buy/", "/rent/", "/sell/", "/localities/", "/blog/", "/about/", "/contact/", "/privacy-policy/", "/terms-and-conditions/", "/rera-disclaimer/"];
  const dynamicPaths = [
    ...listings.map((l) => `/property/${l.slug}/`),
    ...localities.map((l) => `/localities/${l.slug}/`),
    ...blogPosts.map((p) => `/blog/${p.slug}/`),
  ];
  const all = [...staticPaths, ...dynamicPaths];
  const urlset = all
    .map((p) => `  <url><loc>${config.domain}${p}</loc></url>`)
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${config.domain}/sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST, "robots.txt"), robots);
}

/* ---------------------------------------------------------------------- */
/* Run                                                                      */
/* ---------------------------------------------------------------------- */
function build() {
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  copyDir(path.join(PUBLIC, "css"), path.join(DIST, "css"));
  copyDir(path.join(PUBLIC, "js"), path.join(DIST, "js"));
  copyDir(path.join(PUBLIC, "images"), path.join(DIST, "images"));
  if (fs.existsSync(path.join(ROOT, "admin"))) copyDir(path.join(ROOT, "admin"), path.join(DIST, "admin"));

  buildHomepage();
  buildListingPage("buy");
  buildListingPage("rent");
  buildPropertyPages();
  buildSellPage();
  buildLocalitiesIndex();
  buildLocalityPages();
  buildBlogIndex();
  buildBlogPosts();
  buildAbout();
  buildContact();
  buildLegalPages();
  buildThankYou();
  build404();
  buildSEOFiles();

  const pageCount =
    2 /* home not counted twice */ +
    2 /* buy/rent */ +
    listings.length +
    1 /* sell */ +
    1 /* localities index */ +
    localities.length +
    1 /* blog index */ +
    blogPosts.length +
    2 /* about/contact */ +
    3 /* legal */ +
    1 /* thank you */;

  console.log(`Build complete: generated ${pageCount} pages into /dist`);
}

build();
