// Batch 2: adds 10 sample listings, 7 locality pages, 3 blog posts, and
// generates a distinct illustrated image set per listing (no external
// network/photo dependency). Also refreshes images for the original 10
// listings so the whole grid looks varied, not just the new ones.
// Run with: node scripts/generate-batch-2.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const listingsDir = path.join(root, "content", "listings");
const localitiesDir = path.join(root, "content", "localities");
const blogDir = path.join(root, "content", "blog");
const imagesRoot = path.join(root, "public", "images", "listings");
const cssPath = path.join(root, "public", "css", "styles.css");

fs.mkdirSync(listingsDir, { recursive: true });
fs.mkdirSync(localitiesDir, { recursive: true });
fs.mkdirSync(blogDir, { recursive: true });
fs.mkdirSync(imagesRoot, { recursive: true });

/* ============================================================
   Image generation (flat-illustration SVGs, varied per listing)
   ============================================================ */
const palettes = [
  { bg: "#EFE7D8", bg2: "#E3D6B8", ink: "#0B2545", accent: "#C9A24B" },
  { bg: "#E3E9E6", bg2: "#CFDBD5", ink: "#0B2545", accent: "#2F7D4F" },
  { bg: "#E7E2EE", bg2: "#D6CCE6", ink: "#0B2545", accent: "#6D5A97" },
  { bg: "#EAD9D3", bg2: "#DEC0B4", ink: "#0B2545", accent: "#B85C38" },
  { bg: "#D9E4EA", bg2: "#BFD4E0", ink: "#0B2545", accent: "#1E6091" },
  { bg: "#F0E6D2", bg2: "#E6D3A8", ink: "#0B2545", accent: "#C9A24B" },
  { bg: "#DCE3D0", bg2: "#C4D1AE", ink: "#0B2545", accent: "#5A7D3A" },
  { bg: "#E6DDE9", bg2: "#D3C3DA", ink: "#0B2545", accent: "#7A5C8E" },
];

function shell(inner, p, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg}"/>
      <stop offset="1" stop-color="${p.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  ${inner}
  <text x="40" y="560" font-family="'Poppins','Segoe UI',Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="1" fill="${p.ink}" opacity="0.55">NESTNEEV &#8226; ${label}</text>
</svg>`;
}

function exteriorScene(p) {
  return `<g opacity="0.9">
    <rect x="120" y="230" width="560" height="230" rx="6" fill="${p.ink}" opacity="0.08"/>
    <rect x="150" y="180" width="180" height="280" fill="${p.ink}" opacity="0.85"/>
    <rect x="345" y="140" width="200" height="320" fill="${p.ink}"/>
    <rect x="560" y="200" width="150" height="260" fill="${p.ink}" opacity="0.85"/>
    ${[0,1,2,3,4].map(r => [0,1,2].map(c => `<rect x="${370+c*55}" y="${170+r*35}" width="34" height="22" fill="${p.accent}" opacity="0.85"/>`).join("")).join("")}
    <rect x="420" y="380" width="60" height="80" fill="${p.bg}"/>
    <circle cx="700" cy="120" r="46" fill="${p.accent}" opacity="0.35"/>
  </g>`;
}
function livingRoomScene(p) {
  return `<g>
    <rect x="0" y="380" width="800" height="220" fill="${p.ink}" opacity="0.06"/>
    <rect x="90" y="300" width="300" height="110" rx="18" fill="${p.ink}" opacity="0.85"/>
    <rect x="90" y="300" width="300" height="30" rx="14" fill="${p.accent}" opacity="0.7"/>
    <rect x="430" y="330" width="120" height="80" rx="14" fill="${p.ink}" opacity="0.6"/>
    <rect x="580" y="260" width="150" height="150" rx="8" fill="${p.ink}" opacity="0.15"/>
    <rect x="600" y="280" width="110" height="70" fill="${p.accent}" opacity="0.5"/>
    <circle cx="180" cy="230" r="40" fill="${p.accent}" opacity="0.3"/>
  </g>`;
}
function bedroomScene(p) {
  return `<g>
    <rect x="0" y="420" width="800" height="180" fill="${p.ink}" opacity="0.06"/>
    <rect x="150" y="330" width="380" height="110" rx="10" fill="${p.ink}" opacity="0.85"/>
    <rect x="150" y="300" width="380" height="45" rx="14" fill="${p.accent}" opacity="0.7"/>
    <rect x="120" y="300" width="50" height="120" rx="8" fill="${p.ink}" opacity="0.55"/>
    <rect x="530" y="300" width="50" height="120" rx="8" fill="${p.ink}" opacity="0.55"/>
    <rect x="600" y="230" width="140" height="180" rx="6" fill="${p.ink}" opacity="0.15"/>
  </g>`;
}
function kitchenScene(p) {
  return `<g>
    <rect x="80" y="360" width="640" height="140" fill="${p.ink}" opacity="0.85"/>
    <rect x="80" y="330" width="640" height="30" fill="${p.accent}" opacity="0.6"/>
    ${[0,1,2,3,4,5].map(i => `<rect x="${100+i*105}" y="230" width="80" height="90" rx="4" fill="${p.ink}" opacity="0.25"/>`).join("")}
    <circle cx="620" cy="410" r="22" fill="${p.bg}"/>
    <circle cx="680" cy="410" r="22" fill="${p.bg}"/>
  </g>`;
}
function balconyScene(p) {
  return `<g>
    <rect x="0" y="60" width="800" height="300" fill="${p.ink}" opacity="0.06"/>
    ${[0,1,2,3,4,5,6].map(i => `<rect x="${60+i*100}" y="90" width="60" height="${120+((i*47)%90)}" fill="${p.ink}" opacity="0.18"/>`).join("")}
    <rect x="0" y="420" width="800" height="180" fill="${p.bg2}"/>
    ${[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => `<rect x="${40+i*48}" y="420" width="8" height="120" fill="${p.ink}" opacity="0.4"/>`).join("")}
    <rect x="0" y="415" width="800" height="10" fill="${p.ink}" opacity="0.5"/>
  </g>`;
}
function bathroomScene(p) {
  return `<g>
    <rect x="0" y="440" width="800" height="160" fill="${p.ink}" opacity="0.06"/>
    <rect x="120" y="360" width="220" height="90" rx="30" fill="${p.ink}" opacity="0.5"/>
    <rect x="420" y="330" width="130" height="120" rx="10" fill="${p.ink}" opacity="0.8"/>
    <rect x="440" y="260" width="90" height="70" rx="8" fill="${p.ink}" opacity="0.2"/>
    <circle cx="620" cy="380" r="60" fill="${p.accent}" opacity="0.25"/>
  </g>`;
}
function plotScene(p) {
  return `<g>
    <rect x="60" y="120" width="680" height="380" fill="none" stroke="${p.ink}" stroke-width="4" opacity="0.8" stroke-dasharray="14 10"/>
    ${[1,2,3].map(i => `<line x1="${60+i*170}" y1="120" x2="${60+i*170}" y2="500" stroke="${p.ink}" stroke-width="2" opacity="0.25"/>`).join("")}
    ${[1,2].map(i => `<line x1="60" y1="${120+i*126}" x2="740" y2="${120+i*126}" stroke="${p.ink}" stroke-width="2" opacity="0.25"/>`).join("")}
    <circle cx="400" cy="310" r="70" fill="${p.accent}" opacity="0.3"/>
    <path d="M400 260 L440 310 L420 310 L420 360 L380 360 L380 310 L360 310 Z" fill="${p.ink}" opacity="0.6"/>
  </g>`;
}
function officeScene(p) {
  return `<g>
    <rect x="100" y="150" width="600" height="300" rx="8" fill="${p.ink}" opacity="0.08"/>
    <rect x="140" y="330" width="220" height="90" rx="6" fill="${p.ink}" opacity="0.8"/>
    <rect x="420" y="200" width="240" height="220" fill="${p.ink}" opacity="0.15"/>
    ${[0,1,2].map(r => [0,1,2].map(c => `<rect x="${440+c*80}" y="${220+r*65}" width="60" height="45" fill="${p.accent}" opacity="0.6"/>`).join("")).join("")}
  </g>`;
}
function shopScene(p) {
  return `<g>
    <rect x="90" y="220" width="620" height="260" fill="${p.ink}" opacity="0.85"/>
    <rect x="90" y="220" width="620" height="60" fill="${p.accent}"/>
    ${[0,1,2,3].map(i => `<rect x="${130+i*140}" y="310" width="110" height="150" fill="${p.bg}" opacity="0.9"/>`).join("")}
    <rect x="0" y="190" width="800" height="20" fill="${p.ink}" opacity="0.4"/>
  </g>`;
}

const scenes = {
  exterior: { fn: exteriorScene, label: "Exterior View" },
  "living-room": { fn: livingRoomScene, label: "Living Room" },
  bedroom: { fn: bedroomScene, label: "Bedroom" },
  kitchen: { fn: kitchenScene, label: "Kitchen" },
  "balcony-view": { fn: balconyScene, label: "Balcony View" },
  bathroom: { fn: bathroomScene, label: "Bathroom" },
  plot: { fn: plotScene, label: "Plot Layout" },
  office: { fn: officeScene, label: "Office Interior" },
  shop: { fn: shopScene, label: "Shop Frontage" },
};

function scenesForType(propertyType) {
  if (propertyType === "plot") return ["plot", "plot"];
  if (propertyType === "commercial") return ["exterior", "office", "office"];
  return ["exterior", "living-room", "bedroom", "kitchen", "balcony-view"];
}

let paletteIdx = 0;
function generateImagesFor(slug, propertyType, sceneOverride) {
  const p = palettes[paletteIdx % palettes.length];
  paletteIdx++;
  const keys = sceneOverride || scenesForType(propertyType);
  const dir = path.join(imagesRoot, slug);
  fs.mkdirSync(dir, { recursive: true });
  const images = keys.map((key, i) => {
    const scene = scenes[key];
    fs.writeFileSync(path.join(dir, `${i + 1}.svg`), shell(scene.fn(p), p, scene.label));
    return { src: `/images/listings/${slug}/${i + 1}.svg` };
  });
  return images;
}

/* ============================================================
   Refresh images for the original 10 listings (visual variety)
   ============================================================ */
const existingFiles = fs.readdirSync(listingsDir).filter(f => f.endsWith(".json"));
for (const file of existingFiles) {
  const p = path.join(listingsDir, file);
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  data.images = generateImagesFor(data.slug, data.propertyType);
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

/* ============================================================
   New localities
   ============================================================ */
const newLocalities = [
  {
    slug: "sector-56",
    name: "Sector 56",
    region: "Central Gurugram",
    featured: false,
    shortDescription: "Established residential sector off Golf Course Road with easy access to Rapid Metro stations.",
    longDescription: "Sector 56 is a well-settled residential pocket just off Golf Course Road, popular for its mix of mid-rise group housing societies and proximity to the Sector 53-54 and Sector 55-56 Rapid Metro stations. It offers a good balance of connectivity to Cyber City and DLF's business districts along with quieter, tree-lined internal roads.",
  },
  {
    slug: "sector-67",
    name: "Sector 67",
    region: "South Gurugram",
    featured: false,
    shortDescription: "Fast-developing high-rise cluster along Golf Course Extension Road.",
    longDescription: "Sector 67 sits along the Golf Course Extension Road corridor and has seen rapid development of high-rise residential towers over the last decade. It's within easy reach of Sohna Road and South City, with a growing base of retail and dining options opening up around the newer societies.",
  },
  {
    slug: "south-city-1",
    name: "South City 1",
    region: "South Gurugram",
    featured: true,
    shortDescription: "One of Gurugram's older, well-established colonies with mature greenery and independent floors.",
    longDescription: "South City 1 is among Gurugram's earliest planned residential colonies, known for its wide roads, mature trees, and a mix of independent floors and low-rise apartment blocks. It's close to Huda City Centre metro station and Sohna Road's retail belt, making it a popular choice for families who prefer an established neighbourhood over newer high-rise clusters.",
  },
  {
    slug: "palam-vihar",
    name: "Palam Vihar",
    region: "West Gurugram",
    featured: false,
    shortDescription: "Long-established, leafy residential colony near NH-48 with a strong social infrastructure.",
    longDescription: "Palam Vihar is a well-established residential colony on the western side of Gurugram, close to NH-48 and Dwarka. Known for its established schools, parks, and a settled community, it remains a popular choice for families looking for independent floors and houses away from the high-rise clusters of New Gurugram.",
  },
  {
    slug: "new-gurugram-sector-108",
    name: "Sector 108",
    region: "New Gurugram",
    featured: false,
    shortDescription: "Rapidly developing residential corridor along Dwarka Expressway.",
    longDescription: "Sector 108 is part of the New Gurugram belt developing along the Dwarka Expressway, with a wave of new high-rise residential projects launched over the past few years. It offers relatively larger, newer-format apartments at prices below the older parts of the city, with improving road and metro connectivity as the expressway nears full completion.",
  },
  {
    slug: "sector-95",
    name: "Sector 95",
    region: "New Gurugram",
    featured: false,
    shortDescription: "Plotted-development pocket in New Gurugram along the Dwarka Expressway belt.",
    longDescription: "Sector 95 is part of the licensed plotted-colony developments in the New Gurugram / Dwarka Expressway belt, popular with buyers who want to build a custom independent house rather than buy into a group housing project. Infrastructure here is still maturing alongside the broader Dwarka Expressway corridor.",
  },
  {
    slug: "udyog-vihar",
    name: "Udyog Vihar",
    region: "Central Gurugram",
    featured: false,
    shortDescription: "Gurugram's established commercial and office hub, spread across multiple phases.",
    longDescription: "Udyog Vihar is one of Gurugram's oldest and most established commercial districts, spread across several numbered phases along NH-48. Originally an industrial area, it now houses a large concentration of corporate offices, back-offices, and light-industrial units, with good connectivity to both Delhi and the rest of Gurugram.",
  },
];

for (const loc of newLocalities) {
  const file = path.join(localitiesDir, `${loc.slug}.json`);
  if (fs.existsSync(file)) continue;
  const images = generateImagesFor(`locality-${loc.slug}`, "apartment", ["exterior"]);
  loc.image = images[0].src;
  fs.writeFileSync(file, JSON.stringify(loc, null, 2) + "\n");
}

/* ============================================================
   New listings
   ============================================================ */
const newListings = [
  {
    slug: "2bhk-apartment-sector-56-rent",
    title: "2 BHK Apartment for Rent in Sector 56",
    purpose: "rent", propertyType: "apartment", bhk: 2,
    price: 32000, priceLabel: "₹32,000/month", rentPeriod: "month",
    areaSqft: 1150, areaUnit: "sqft", localitySlug: "sector-56",
    possessionStatus: "ready-to-move", furnishing: "semi-furnished", featured: true,
    reraNumber: "",
    description: "Bright 2 BHK apartment in a well-maintained society in Sector 56, a short drive from Golf Course Road and close to the Sector 55-56 Rapid Metro station.",
    amenities: ["Lift", "24x7 Security", "Power Backup", "Covered Parking", "Park Facing"],
    floorPlanImage: "", postedDate: "2026-09-08",
    specs: { bedrooms: 2, bathrooms: 2, balconies: 2, floor: "6 of 14", facing: "North-East", age: "4 years" },
  },
  {
    slug: "3bhk-apartment-sector-67-sale",
    title: "3 BHK Apartment for Sale in Sector 67",
    purpose: "buy", propertyType: "apartment", bhk: 3,
    price: 16500000, priceLabel: "₹1.65 Cr", rentPeriod: null,
    areaSqft: 1850, areaUnit: "sqft", localitySlug: "sector-67",
    possessionStatus: "ready-to-move", furnishing: "unfurnished", featured: true,
    reraNumber: "PLACEHOLDER-HRERA-GGM-0000",
    description: "Spacious 3 BHK in a high-rise tower along the Golf Course Extension Road corridor in Sector 67, with clubhouse access and landscaped podium gardens.",
    amenities: ["Clubhouse", "Swimming Pool", "Gymnasium", "Lift", "24x7 Security", "Power Backup"],
    floorPlanImage: "", postedDate: "2026-09-05",
    specs: { bedrooms: 3, bathrooms: 3, balconies: 2, floor: "11 of 22", facing: "East", age: "2 years" },
  },
  {
    slug: "3bhk-independent-floor-south-city-1",
    title: "3 BHK Independent Floor in South City 1",
    purpose: "buy", propertyType: "independent-house", bhk: 3,
    price: 13500000, priceLabel: "₹1.35 Cr", rentPeriod: null,
    areaSqft: 1800, areaUnit: "sqft", localitySlug: "south-city-1",
    possessionStatus: "ready-to-move", furnishing: "semi-furnished", featured: false,
    reraNumber: "",
    description: "Second-floor independent unit with private terrace in South City 1's established, leafy layout, close to Huda City Centre metro and Sohna Road.",
    amenities: ["Private Terrace", "Covered Parking", "Power Backup", "Wide Street"],
    floorPlanImage: "", postedDate: "2026-08-29",
    specs: { bedrooms: 3, bathrooms: 2, balconies: 1, floor: "2 of 3", facing: "South", age: "8 years" },
  },
  {
    slug: "2bhk-apartment-palam-vihar-rent",
    title: "2 BHK Apartment for Rent in Palam Vihar",
    purpose: "rent", propertyType: "apartment", bhk: 2,
    price: 28000, priceLabel: "₹28,000/month", rentPeriod: "month",
    areaSqft: 1050, areaUnit: "sqft", localitySlug: "palam-vihar",
    possessionStatus: "ready-to-move", furnishing: "unfurnished", featured: false,
    reraNumber: "",
    description: "Well-ventilated 2 BHK in a low-rise block in Palam Vihar's established residential layout, close to reputed schools and neighbourhood markets.",
    amenities: ["Covered Parking", "Power Backup", "Near Schools", "Park Facing"],
    floorPlanImage: "", postedDate: "2026-09-01",
    specs: { bedrooms: 2, bathrooms: 2, balconies: 1, floor: "1 of 4", facing: "West", age: "10 years" },
  },
  {
    slug: "4bhk-villa-sector-57-premium",
    title: "4 BHK Villa in Sector 57",
    purpose: "buy", propertyType: "villa", bhk: 4,
    price: 42000000, priceLabel: "₹4.2 Cr", rentPeriod: null,
    areaSqft: 3800, areaUnit: "sqft", localitySlug: "sector-57",
    possessionStatus: "ready-to-move", furnishing: "unfurnished", featured: true,
    reraNumber: "PLACEHOLDER-HRERA-GGM-0000",
    description: "Corner-plot villa in a gated low-density villa community in Sector 57, with a private garden, servant quarters, and four-car covered parking.",
    amenities: ["Private Garden", "Servant Quarters", "4-Car Parking", "Gated Community", "Power Backup"],
    floorPlanImage: "", postedDate: "2026-09-03",
    specs: { bedrooms: 4, bathrooms: 5, balconies: 3, floor: "Ground + 1", facing: "North", age: "3 years" },
  },
  {
    slug: "1bhk-apartment-sector-70a-rent",
    title: "1 BHK Apartment for Rent in Sector 70A",
    purpose: "rent", propertyType: "apartment", bhk: 1,
    price: 16500, priceLabel: "₹16,500/month", rentPeriod: "month",
    areaSqft: 620, areaUnit: "sqft", localitySlug: "sector-70a",
    possessionStatus: "ready-to-move", furnishing: "fully-furnished", featured: false,
    reraNumber: "",
    description: "Fully furnished compact 1 BHK in a mid-rise society in Sector 70A, close to Sohna Road, ready to move in with modular kitchen and wardrobes.",
    amenities: ["Fully Furnished", "Lift", "24x7 Security", "Modular Kitchen"],
    floorPlanImage: "", postedDate: "2026-09-11",
    specs: { bedrooms: 1, bathrooms: 1, balconies: 1, floor: "4 of 12", facing: "South-East", age: "2 years" },
  },
  {
    slug: "3bhk-apartment-new-gurugram-sector-108",
    title: "3 BHK Apartment for Sale in Sector 108 (New Gurugram)",
    purpose: "buy", propertyType: "apartment", bhk: 3,
    price: 9500000, priceLabel: "₹95 Lakh", rentPeriod: null,
    areaSqft: 1650, areaUnit: "sqft", localitySlug: "new-gurugram-sector-108",
    possessionStatus: "under-construction", furnishing: "unfurnished", featured: true,
    reraNumber: "PLACEHOLDER-HRERA-GGM-0000",
    description: "Under-construction 3 BHK in a new launch along the Dwarka Expressway corridor in Sector 108, offering larger layouts at a relatively accessible price point.",
    amenities: ["Clubhouse (Planned)", "Landscaped Podium", "Reserved Parking", "Construction-Linked Payment Plan"],
    floorPlanImage: "", postedDate: "2026-08-22",
    specs: { bedrooms: 3, bathrooms: 3, balconies: 2, floor: "14 of 28", facing: "West", age: "Under construction" },
  },
  {
    slug: "residential-plot-sector-95",
    title: "Residential Plot in Sector 95",
    purpose: "buy", propertyType: "plot", bhk: null,
    price: 11000000, priceLabel: "₹1.1 Cr", rentPeriod: null,
    areaSqft: 200, areaUnit: "sqyd", localitySlug: "sector-95",
    possessionStatus: "ready-to-move", furnishing: "unfurnished", featured: false,
    reraNumber: "PLACEHOLDER-HRERA-GGM-0000",
    description: "Clear-title 200 sq. yd. plot in a licensed plotted colony in Sector 95, New Gurugram — suited for buyers looking to build an independent house.",
    amenities: ["Wide Approach Road", "Gated Colony", "Clear Title"],
    floorPlanImage: "", postedDate: "2026-08-18",
    specs: { bedrooms: null, bathrooms: null, balconies: null, floor: null, facing: "North-East", age: null },
  },
  {
    slug: "commercial-office-udyog-vihar",
    title: "Office Space for Rent in Udyog Vihar",
    purpose: "rent", propertyType: "commercial", bhk: null,
    price: 150000, priceLabel: "₹1,50,000/month", rentPeriod: "month",
    areaSqft: 3000, areaUnit: "sqft", localitySlug: "udyog-vihar",
    possessionStatus: "ready-to-move", furnishing: "semi-furnished", featured: false,
    reraNumber: "",
    description: "Fitted office floor in a commercial building in Udyog Vihar Phase 3, suitable for a mid-sized team, with dedicated cabins and an open workstation area already built out.",
    amenities: ["Central AC", "24x7 Security", "Power Backup", "Reserved Parking", "Cafeteria in Building"],
    floorPlanImage: "", postedDate: "2026-09-06",
    specs: { bedrooms: null, bathrooms: 3, balconies: 0, floor: "3 of 6", facing: "North", age: "6 years" },
  },
  {
    slug: "2bhk-apartment-sector-82-rent",
    title: "2 BHK Apartment for Rent in Sector 82",
    purpose: "rent", propertyType: "apartment", bhk: 2,
    price: 24000, priceLabel: "₹24,000/month", rentPeriod: "month",
    areaSqft: 1100, areaUnit: "sqft", localitySlug: "sector-82",
    possessionStatus: "ready-to-move", furnishing: "semi-furnished", featured: false,
    reraNumber: "",
    description: "Semi-furnished 2 BHK in a gated society in Sector 82, New Gurugram, with a children's play area and landscaped common areas.",
    amenities: ["Lift", "24x7 Security", "Children's Play Area", "Covered Parking"],
    floorPlanImage: "", postedDate: "2026-09-13",
    specs: { bedrooms: 2, bathrooms: 2, balconies: 1, floor: "7 of 15", facing: "East", age: "3 years" },
  },
];

for (const listing of newListings) {
  listing.images = generateImagesFor(listing.slug, listing.propertyType);
  const file = path.join(listingsDir, `${listing.slug}.json`);
  fs.writeFileSync(file, JSON.stringify(listing, null, 2) + "\n");
}

/* ============================================================
   New blog posts
   ============================================================ */
const newBlogImages = generateImagesFor("blog-localities-by-budget", "apartment", ["exterior"]);
const newBlogImages2 = generateImagesFor("blog-home-loan-basics", "apartment", ["living-room"]);
const newBlogImages3 = generateImagesFor("blog-verify-resale-property", "apartment", ["balcony-view"]);

const newBlogPosts = [
  {
    slug: "top-localities-in-gurugram-by-budget",
    title: "Top Localities in Gurugram, Sorted by Budget",
    date: "2026-09-14",
    excerpt: "A quick locality shortlist for different budget bands, from established colonies to fast-developing New Gurugram sectors.",
    coverImage: newBlogImages[0].src,
    body: "Gurugram's real estate market spans a huge range, from decades-old established colonies to brand-new high-rises still under construction — and the right locality for you depends a lot on budget.\n\nAt the higher end, Golf Course Road and DLF Phase 1 through 5 remain the city's most premium addresses, with mature infrastructure, established societies, and easy access to Cyber City. Golf Course Extension Road and Sushant Lok offer a step down in price while still staying close to the core business districts.\n\nFor mid-range budgets, sectors like 49, 56, 57, and 67, along with South City 1, offer a good mix of ready-to-move apartments and independent floors, usually with better price-per-square-foot than the DLF belt.\n\nIf you're working with a tighter budget or want a larger floor plate for the money, New Gurugram — sectors along the Dwarka Expressway such as 82, 95, and 108 — is where most of the newer, larger-format launches are happening, though you should factor in that some infrastructure there is still catching up with the pace of construction.",
  },
  {
    slug: "home-loan-basics-for-first-time-buyers",
    title: "Home Loan Basics for First-Time Buyers in Gurugram",
    date: "2026-09-15",
    excerpt: "A plain-language walkthrough of how home loans work in India, so you know what to expect before you apply.",
    coverImage: newBlogImages2[0].src,
    body: "Most first-time buyers in Gurugram finance their purchase with a home loan, and it helps to understand the basics before you start shortlisting properties.\n\nBanks and housing finance companies typically lend up to 75-90% of the property's value, depending on the loan amount, meaning you'll need to arrange the remaining 10-25% as a down payment from your own savings. Your eligible loan amount depends on your income, existing obligations (EMIs, credit card dues), and the lender's own debt-to-income norms — it's worth getting a rough eligibility check from two or three lenders before you finalise a budget.\n\nInterest rates can be fixed or floating, with most home loans in India currently offered on a floating rate linked to an external benchmark like the repo rate. A floating rate means your EMI or tenure can change when the benchmark moves, so ask your lender to walk you through how a rate change would actually affect your repayment.\n\nBefore disbursement, the lender will do its own technical and legal verification of the property, including checking RERA registration for under-construction projects. This is a useful independent check in addition to your own due diligence, not a replacement for it.\n\nFinally, factor in the one-time costs beyond the loan itself: stamp duty and registration charges, processing fees, and if applicable, GST on under-construction property — these can add up to a meaningful percentage on top of the property price.",
  },
  {
    slug: "how-to-verify-a-resale-property-before-you-buy",
    title: "How to Verify a Resale Property Before You Buy",
    date: "2026-09-16",
    excerpt: "A due-diligence checklist for resale flats and independent floors in Gurugram, beyond just liking the photos.",
    coverImage: newBlogImages3[0].src,
    body: "Resale properties don't come with the same fresh paperwork as a new launch, so a bit of extra diligence goes a long way before you commit.\n\nStart with the title chain: ask the seller for the original allotment letter or sale deed, and every sale deed in between if the property has changed hands more than once. A property lawyer can run an encumbrance check to confirm there's no pending loan, litigation, or lien against the unit.\n\nConfirm outstanding dues directly with the resident welfare association or builder — maintenance charges, any special assessments, and electricity/water bills should be cleared or accounted for in the final settlement. Ask for the latest maintenance receipt and a no-dues certificate where the society provides one.\n\nFor apartments, check whether any structural changes were made without society approval, and whether the unit's actual carpet area matches what's mentioned in the original sale deed. For independent floors, verify that construction was done as per the sanctioned building plan, since unauthorised additions can complicate a future resale or bank loan for the next buyer.\n\nFinally, if the original project was RERA-registered, the registration doesn't automatically transfer any protection to a resale buyer in the same way it does for the first buyer — but it's still worth checking the project's RERA page for any recorded complaints or issues before you finalise the deal.",
  },
];

for (const post of newBlogPosts) {
  const file = path.join(blogDir, `${post.slug}.json`);
  fs.writeFileSync(file, JSON.stringify(post, null, 2) + "\n");
}

/* ============================================================
   Cosmetic CSS polish (appended, guarded against double-append)
   ============================================================ */
const cssMarker = "/* === batch-2 cosmetic polish === */";
let css = fs.readFileSync(cssPath, "utf8");
if (!css.includes(cssMarker)) {
  css += `
${cssMarker}
.property-card { border-radius: var(--radius-lg); border-color: transparent; box-shadow: var(--shadow-sm), 0 0 0 1px var(--color-border); }
.property-card:hover { box-shadow: var(--shadow-lg), 0 0 0 1px var(--color-border); transform: translateY(-4px); }
.property-card__media { overflow: hidden; }
.property-card__media img { transition: transform 0.35s ease; }
.property-card:hover .property-card__media img { transform: scale(1.06); }
.property-card__media::after {
  content: "";
  position: absolute; inset: auto 0 0 0; height: 55%;
  background: linear-gradient(0deg, rgba(11,37,69,0.35), transparent);
  pointer-events: none;
}
.property-card__price { letter-spacing: -0.01em; }

.hero { padding-bottom: 7rem; }
.hero::before {
  content: "";
  position: absolute; inset: 0;
  background-image:
    radial-gradient(circle at 10% 15%, rgba(255,255,255,0.06), transparent 35%),
    radial-gradient(circle at 92% 75%, rgba(201,162,75,0.14), transparent 40%);
  pointer-events: none;
}
.hero__stats { border-top: 1px solid rgba(255,255,255,0.14); padding-top: 1.5rem; }
.hero__stat { position: relative; padding-right: 1.5rem; }
.hero__stat:not(:last-child)::after {
  content: ""; position: absolute; right: 0; top: 0.15em; bottom: 0.15em;
  width: 1px; background: rgba(255,255,255,0.18);
}

.section__header .eyebrow { position: relative; padding-left: 1.15em; }
.section__header .eyebrow::before {
  content: ""; position: absolute; left: 0; top: 0.55em;
  width: 0.8em; height: 2px; background: var(--color-gold);
}

.locality-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
.locality-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
.locality-card img { transition: transform 0.35s ease; }
.locality-card:hover img { transform: scale(1.05); }

.btn--primary { box-shadow: 0 6px 16px rgba(201,162,75,0.35); }
.btn--primary:hover { box-shadow: 0 8px 22px rgba(201,162,75,0.45); }

.card, .blog-card, .testimonial-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
.card:hover, .blog-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
`;
  fs.writeFileSync(cssPath, css);
}

console.log("Batch 2 content + images + CSS polish generated.");
console.log(`Listings: ${existingFiles.length} refreshed + ${newListings.length} new = ${existingFiles.length + newListings.length} total`);
console.log(`Localities added: ${newLocalities.length}`);
console.log(`Blog posts added: ${newBlogPosts.length}`);
