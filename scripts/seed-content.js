// One-off script to seed sample/placeholder content so the site is fully
// functional out of the box. Run with: node scripts/seed-content.js
// Non-technical editing later happens through the /admin CMS, which reads
// and writes these same files.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LISTINGS_DIR = path.join(ROOT, "content", "listings");
const LOCALITIES_DIR = path.join(ROOT, "content", "localities");
const BLOG_DIR = path.join(ROOT, "content", "blog");

function writeJSON(dir, slug, data) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify(data, null, 2) + "\n");
}

// ---------------------------------------------------------------------------
// Localities
// ---------------------------------------------------------------------------
const localities = [
  {
    slug: "dlf-phase-1",
    name: "DLF Phase 1",
    region: "South Gurugram",
    featured: true,
    shortDescription: "One of Gurugram's earliest planned residential colonies, known for wide tree-lined streets and independent floors.",
    longDescription: "DLF Phase 1 is among the oldest and most established residential neighbourhoods in Gurugram, popular for its low-rise independent floors, mature greenery, and proximity to Galleria Market. It suits buyers who prefer a settled, low-density neighbourhood close to the city centre.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "dlf-phase-2",
    name: "DLF Phase 2",
    region: "South Gurugram",
    featured: true,
    shortDescription: "A well-connected residential and commercial mix close to MG Road metro corridor.",
    longDescription: "DLF Phase 2 blends residential apartments and independent floors with easy access to the MG Road commercial belt and metro connectivity, making it a practical choice for professionals working in the area.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "dlf-phase-3",
    name: "DLF Phase 3",
    region: "South Gurugram",
    featured: true,
    shortDescription: "Established locality with a mix of independent floors, apartments, and easy access to Golf Course Road.",
    longDescription: "DLF Phase 3 sits close to Golf Course Road and Sikanderpur metro station, offering a mix of housing formats from independent floors to mid-rise apartments, along with good access to retail and dining.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "dlf-phase-4",
    name: "DLF Phase 4",
    region: "South Gurugram",
    featured: false,
    shortDescription: "Premium low-rise residential pockets near Golf Course Road.",
    longDescription: "DLF Phase 4 is a sought-after low-rise residential area offering independent floors and villas, valued for its quieter streets while staying close to Golf Course Road's commercial hubs.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "dlf-phase-5",
    name: "DLF Phase 5",
    region: "South Gurugram",
    featured: true,
    shortDescription: "High-rise apartment hub near Golf Course Road with premium societies and schools nearby.",
    longDescription: "DLF Phase 5 is home to several premium high-rise apartment complexes, positioned close to Golf Course Road, reputed schools, and hospitals, making it popular with families and working professionals alike.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "golf-course-road",
    name: "Golf Course Road",
    region: "South Gurugram",
    featured: true,
    shortDescription: "Gurugram's premium high-rise corridor with luxury apartments, malls, and corporate offices.",
    longDescription: "Golf Course Road is one of Gurugram's most prominent addresses, lined with luxury high-rise residential towers, grade-A office space, and premium retail. It commands strong demand from both end-users and investors.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "golf-course-extension-road",
    name: "Golf Course Extension Road",
    region: "South Gurugram",
    featured: true,
    shortDescription: "Rapidly developed residential corridor extending south from Golf Course Road.",
    longDescription: "Golf Course Extension Road has grown into a major residential corridor with newer high-rise developments, wide roads, and improving social infrastructure, appealing to buyers seeking modern construction.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "sohna-road",
    name: "Sohna Road",
    region: "South Gurugram",
    featured: true,
    shortDescription: "Budget-to-mid-range residential belt with a large number of apartment complexes.",
    longDescription: "Sohna Road offers a wide range of housing options from affordable to mid-range apartments, along with independent floors, and continues to see steady residential development.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "mg-road",
    name: "MG Road",
    region: "Central Gurugram",
    featured: true,
    shortDescription: "Gurugram's original commercial and retail hub, metro-connected.",
    longDescription: "MG Road is Gurugram's original high street, home to malls, offices, and mixed residential-commercial developments, with direct Rapid Metro and Yellow Line connectivity.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "sector-49",
    name: "Sector 49",
    region: "South Gurugram",
    featured: false,
    shortDescription: "Well-established residential sector near Sohna Road with a mix of apartments and floors.",
    longDescription: "Sector 49 is a well-settled residential sector offering a mix of group housing societies and independent floors, positioned close to Sohna Road's retail and dining options.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "sector-50",
    name: "Sector 50",
    region: "South Gurugram",
    featured: false,
    shortDescription: "Popular mid-segment residential sector with good schools and parks.",
    longDescription: "Sector 50 is a family-friendly residential sector known for its parks, schools, and a healthy mix of independent floors and mid-rise apartment complexes.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "sector-57",
    name: "Sector 57",
    region: "South Gurugram",
    featured: false,
    shortDescription: "Residential and commercial sector along Golf Course Extension Road.",
    longDescription: "Sector 57 sits along Golf Course Extension Road and offers a mix of residential apartments and ground-floor retail/commercial spaces.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "dwarka-expressway",
    name: "Dwarka Expressway",
    region: "New Gurugram",
    featured: true,
    shortDescription: "Gurugram's fastest-growing residential corridor with new-age high-rise societies.",
    longDescription: "Dwarka Expressway has emerged as one of Gurugram's most active residential corridors, with numerous new-age high-rise developments, improving expressway connectivity to Delhi and IGI Airport, and a strong pipeline of upcoming infrastructure.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "sector-70a",
    name: "Sector 70A",
    region: "South Gurugram",
    featured: false,
    shortDescription: "Newer residential sector off Golf Course Extension Road.",
    longDescription: "Sector 70A is a newer residential pocket off Golf Course Extension Road, popular among buyers looking for relatively newer construction at moderate price points.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "sector-82",
    name: "Sector 82 (New Gurugram)",
    region: "New Gurugram",
    featured: false,
    shortDescription: "Part of the New Gurugram belt with plotted developments and new societies.",
    longDescription: "Sector 82 is part of the New Gurugram belt along Dwarka Expressway, known for plotted development colonies alongside newer group housing societies.",
    image: "/images/listings/exterior.svg"
  },
  {
    slug: "sushant-lok",
    name: "Sushant Lok",
    region: "Central Gurugram",
    featured: true,
    shortDescription: "One of Gurugram's most established and centrally located residential colonies.",
    longDescription: "Sushant Lok is a mature, centrally located residential area spread across multiple phases, offering independent floors and villas with excellent access to MG Road, Golf Course Road, and the rapid metro.",
    image: "/images/listings/exterior.svg"
  }
];

localities.forEach((l) => writeJSON(LOCALITIES_DIR, l.slug, l));

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------
const listings = [
  {
    slug: "3bhk-apartment-dlf-phase-5",
    title: "3 BHK Apartment in DLF Phase 5",
    purpose: "buy",
    propertyType: "apartment",
    bhk: 3,
    price: 25000000,
    priceLabel: "₹2.5 Cr",
    rentPeriod: null,
    areaSqft: 1850,
    areaUnit: "sqft",
    localitySlug: "dlf-phase-5",
    possessionStatus: "ready-to-move",
    furnishing: "semi-furnished",
    featured: true,
    reraNumber: "PLACEHOLDER-HRERA-GGM-0000",
    description: "A well-maintained 3 BHK apartment in a gated high-rise society in DLF Phase 5, close to Golf Course Road. Bright, cross-ventilated layout with a large living/dining area and two covered parking slots.",
    amenities: ["Clubhouse", "Swimming Pool", "24x7 Security", "Power Backup", "Covered Parking", "Children's Play Area", "Gymnasium"],
    images: [{ src: "/images/listings/living-room.svg" }, { src: "/images/listings/bedroom.svg" }, { src: "/images/listings/kitchen.svg" }, { src: "/images/listings/balcony-view.svg" }],
    floorPlanImage: "",
    postedDate: "2026-08-20",
    specs: { bedrooms: 3, bathrooms: 3, balconies: 2, floor: "12 of 24", facing: "East", age: "2 years" }
  },
  {
    slug: "4bhk-villa-sushant-lok",
    title: "4 BHK Independent Villa in Sushant Lok",
    purpose: "buy",
    propertyType: "villa",
    bhk: 4,
    price: 65000000,
    priceLabel: "₹6.5 Cr",
    rentPeriod: null,
    areaSqft: 3800,
    areaUnit: "sqft",
    localitySlug: "sushant-lok",
    possessionStatus: "ready-to-move",
    furnishing: "unfurnished",
    featured: true,
    reraNumber: "",
    description: "Spacious 4 BHK independent villa on a corner plot in Sushant Lok Phase 1, with a private garden, terrace, and dedicated staff quarters. Ideal for large families seeking a central location.",
    amenities: ["Private Garden", "Terrace", "Servant Quarter", "4 Car Parking", "Modular Kitchen", "Power Backup"],
    images: [{ src: "/images/listings/exterior.svg" }, { src: "/images/listings/living-room.svg" }, { src: "/images/listings/bedroom.svg" }],
    floorPlanImage: "",
    postedDate: "2026-08-15",
    specs: { bedrooms: 4, bathrooms: 5, balconies: 3, floor: "G+2", facing: "North", age: "5 years" }
  },
  {
    slug: "2bhk-apartment-sector-49-rent",
    title: "2 BHK Apartment for Rent in Sector 49",
    purpose: "rent",
    propertyType: "apartment",
    bhk: 2,
    price: 35000,
    priceLabel: "₹35,000/month",
    rentPeriod: "month",
    areaSqft: 1200,
    areaUnit: "sqft",
    localitySlug: "sector-49",
    possessionStatus: "ready-to-move",
    furnishing: "semi-furnished",
    featured: true,
    reraNumber: "",
    description: "Semi-furnished 2 BHK apartment available for rent in a gated society in Sector 49, close to Sohna Road. Modular kitchen, wardrobes fitted, and one covered parking included.",
    amenities: ["Clubhouse", "Lift", "24x7 Security", "Covered Parking", "Power Backup"],
    images: [{ src: "/images/listings/living-room.svg" }, { src: "/images/listings/kitchen.svg" }, { src: "/images/listings/bedroom.svg" }],
    floorPlanImage: "",
    postedDate: "2026-09-01",
    specs: { bedrooms: 2, bathrooms: 2, balconies: 1, floor: "6 of 14", facing: "West", age: "4 years" }
  },
  {
    slug: "commercial-office-mg-road",
    title: "Commercial Office Space on MG Road",
    purpose: "buy",
    propertyType: "commercial",
    bhk: null,
    price: 18000000,
    priceLabel: "₹1.8 Cr",
    rentPeriod: null,
    areaSqft: 2200,
    areaUnit: "sqft",
    localitySlug: "mg-road",
    possessionStatus: "ready-to-move",
    furnishing: "unfurnished",
    featured: false,
    reraNumber: "",
    description: "Bare-shell commercial office space in a Grade-A building on MG Road, walking distance from the metro station. Suited for corporate offices, consulting firms, or studios.",
    amenities: ["Central AC Ready", "24x7 Security", "Power Backup", "Reserved Parking", "Metro Connectivity"],
    images: [{ src: "/images/listings/exterior.svg" }],
    floorPlanImage: "",
    postedDate: "2026-07-28",
    specs: { bedrooms: null, bathrooms: 2, balconies: 0, floor: "5 of 9", facing: "South", age: "3 years" }
  },
  {
    slug: "residential-plot-sector-82",
    title: "Residential Plot in Sector 82",
    purpose: "buy",
    propertyType: "plot",
    bhk: null,
    price: 40000000,
    priceLabel: "₹4 Cr",
    rentPeriod: null,
    areaSqft: 2250,
    areaUnit: "sqyd",
    localitySlug: "sector-82",
    possessionStatus: "ready-to-move",
    furnishing: "unfurnished",
    featured: false,
    reraNumber: "PLACEHOLDER-HRERA-GGM-0000",
    description: "Clear-title residential plot (250 sq. yd.) in a licensed colony in Sector 82, New Gurugram, with wide approach road and all basic infrastructure in place.",
    amenities: ["Wide Approach Road", "Corner Plot", "Gated Colony"],
    images: [{ src: "/images/listings/exterior.svg" }],
    floorPlanImage: "",
    postedDate: "2026-08-05",
    specs: { bedrooms: null, bathrooms: null, balconies: null, floor: null, facing: "East", age: null }
  },
  {
    slug: "3bhk-apartment-golf-course-road-rent",
    title: "3 BHK Fully-Furnished Apartment for Rent on Golf Course Road",
    purpose: "rent",
    propertyType: "apartment",
    bhk: 3,
    price: 85000,
    priceLabel: "₹85,000/month",
    rentPeriod: "month",
    areaSqft: 2100,
    areaUnit: "sqft",
    localitySlug: "golf-course-road",
    possessionStatus: "ready-to-move",
    furnishing: "fully-furnished",
    featured: true,
    reraNumber: "",
    description: "Premium fully-furnished 3 BHK in a landmark high-rise on Golf Course Road, with skyline views, modular interiors, and access to a large clubhouse.",
    amenities: ["Clubhouse", "Swimming Pool", "Gymnasium", "Concierge", "Covered Parking", "Power Backup", "24x7 Security"],
    images: [{ src: "/images/listings/living-room.svg" }, { src: "/images/listings/bedroom.svg" }, { src: "/images/listings/balcony-view.svg" }, { src: "/images/listings/bathroom.svg" }],
    floorPlanImage: "",
    postedDate: "2026-09-05",
    specs: { bedrooms: 3, bathrooms: 3, balconies: 2, floor: "21 of 30", facing: "North-East", age: "3 years" }
  },
  {
    slug: "2bhk-independent-floor-sohna-road",
    title: "2 BHK Independent Floor on Sohna Road",
    purpose: "buy",
    propertyType: "independent-house",
    bhk: 2,
    price: 9500000,
    priceLabel: "₹95 Lakh",
    rentPeriod: null,
    areaSqft: 1350,
    areaUnit: "sqft",
    localitySlug: "sohna-road",
    possessionStatus: "under-construction",
    furnishing: "unfurnished",
    featured: false,
    reraNumber: "PLACEHOLDER-HRERA-GGM-0000",
    description: "Second-floor independent unit in a low-rise builder floor on Sohna Road, with a private terrace and separate entrance. Expected possession in the coming months.",
    amenities: ["Private Terrace", "Separate Entrance", "Stilt Parking", "Power Backup"],
    images: [{ src: "/images/listings/exterior.svg" }],
    floorPlanImage: "",
    postedDate: "2026-08-28",
    specs: { bedrooms: 2, bathrooms: 2, balconies: 1, floor: "2 of 4", facing: "South", age: "Under construction" }
  },
  {
    slug: "1bhk-apartment-dwarka-expressway-rent",
    title: "1 BHK Apartment for Rent near Dwarka Expressway",
    purpose: "rent",
    propertyType: "apartment",
    bhk: 1,
    price: 18000,
    priceLabel: "₹18,000/month",
    rentPeriod: "month",
    areaSqft: 650,
    areaUnit: "sqft",
    localitySlug: "dwarka-expressway",
    possessionStatus: "ready-to-move",
    furnishing: "semi-furnished",
    featured: false,
    reraNumber: "",
    description: "Compact and efficient 1 BHK in a new-age high-rise society near Dwarka Expressway, well suited for young professionals and couples.",
    amenities: ["Lift", "24x7 Security", "Power Backup", "Visitor Parking"],
    images: [{ src: "/images/listings/living-room.svg" }, { src: "/images/listings/kitchen.svg" }],
    floorPlanImage: "",
    postedDate: "2026-09-10",
    specs: { bedrooms: 1, bathrooms: 1, balconies: 1, floor: "9 of 19", facing: "West", age: "1 year" }
  },
  {
    slug: "4bhk-penthouse-golf-course-extension",
    title: "4 BHK Penthouse on Golf Course Extension Road",
    purpose: "buy",
    propertyType: "apartment",
    bhk: 4,
    price: 95000000,
    priceLabel: "₹9.5 Cr",
    rentPeriod: null,
    areaSqft: 4200,
    areaUnit: "sqft",
    localitySlug: "golf-course-extension-road",
    possessionStatus: "ready-to-move",
    furnishing: "fully-furnished",
    featured: true,
    reraNumber: "PLACEHOLDER-HRERA-GGM-0000",
    description: "Duplex penthouse with a private terrace garden in a premium low-density society on Golf Course Extension Road. Premium fittings throughout, with panoramic city views.",
    amenities: ["Private Terrace Garden", "Clubhouse", "Swimming Pool", "Home Automation", "4 Car Parking", "Concierge"],
    images: [{ src: "/images/listings/exterior.svg" }, { src: "/images/listings/living-room.svg" }, { src: "/images/listings/balcony-view.svg" }],
    floorPlanImage: "",
    postedDate: "2026-08-12",
    specs: { bedrooms: 4, bathrooms: 5, balconies: 4, floor: "Duplex - 24 & 25 of 25", facing: "East", age: "2 years" }
  },
  {
    slug: "retail-shop-sector-57",
    title: "Retail Shop for Rent in Sector 57",
    purpose: "rent",
    propertyType: "commercial",
    bhk: null,
    price: 120000,
    priceLabel: "₹1,20,000/month",
    rentPeriod: "month",
    areaSqft: 900,
    areaUnit: "sqft",
    localitySlug: "sector-57",
    possessionStatus: "ready-to-move",
    furnishing: "unfurnished",
    featured: false,
    reraNumber: "",
    description: "Ground-floor retail shop with high street frontage in Sector 57, suitable for F&B, retail, or showroom use. High footfall location along Golf Course Extension Road.",
    amenities: ["High Street Frontage", "Reserved Parking", "Power Backup"],
    images: [{ src: "/images/listings/exterior.svg" }],
    floorPlanImage: "",
    postedDate: "2026-09-12",
    specs: { bedrooms: null, bathrooms: 1, balconies: 0, floor: "Ground", facing: "East", age: "2 years" }
  }
];

listings.forEach((l) => writeJSON(LISTINGS_DIR, l.slug, l));

// ---------------------------------------------------------------------------
// Testimonials (clearly marked sample/placeholder — replace with real
// client reviews via the /admin panel before launch)
// ---------------------------------------------------------------------------
const testimonials = {
  note: "SAMPLE PLACEHOLDER CONTENT — replace every entry below with a real client review before launch. Do not publish fabricated reviews.",
  items: [
    {
      quote: "[Sample placeholder — replace with a real client quote via the admin panel.]",
      name: "Sample Client (edit me)",
      detail: "Add a real name, e.g. \"Bought a 3BHK in DLF Phase 5\""
    },
    {
      quote: "[Sample placeholder — replace with a real client quote via the admin panel.]",
      name: "Sample Client (edit me)",
      detail: "Add a real name, e.g. \"Rented an apartment on Golf Course Road\""
    },
    {
      quote: "[Sample placeholder — replace with a real client quote via the admin panel.]",
      name: "Sample Client (edit me)",
      detail: "Add a real name, e.g. \"Sold a plot in Sector 82\""
    }
  ]
};
fs.writeFileSync(path.join(ROOT, "content", "testimonials.json"), JSON.stringify(testimonials, null, 2) + "\n");

// ---------------------------------------------------------------------------
// Blog posts (generic, evergreen starter content — edit freely)
// ---------------------------------------------------------------------------
const blogPosts = [
  {
    slug: "5-things-to-check-before-buying-a-flat-in-gurugram",
    title: "5 Things to Check Before Buying a Flat in Gurugram",
    date: "2026-08-01",
    excerpt: "A practical checklist for anyone shortlisting apartments in Gurugram — from title verification to RERA registration.",
    coverImage: "/images/listings/exterior.svg",
    body: "Buying an apartment is one of the biggest financial decisions most families make, and Gurugram's fast-moving market makes it easy to rush. Before you sign anything, verify the project's Haryana RERA registration number on the official HRERA website — this confirms the project is legally registered and gives you access to the sanctioned plan and timelines.\n\nNext, check the title chain and encumbrance status through your lawyer, confirm the built-up vs carpet area being quoted, and ask for the occupancy certificate if the project is ready to move in. For under-construction projects, review the payment plan against the construction-linked schedule.\n\nFinally, visit the site at different times of day to get a feel for traffic, noise, and sunlight, and speak to existing residents where possible. A good broker should be able to walk you through all of this rather than just showing you photos.",
  },
  {
    slug: "renting-vs-buying-in-gurugram-what-to-consider",
    title: "Renting vs Buying in Gurugram: What to Consider",
    date: "2026-08-20",
    excerpt: "How to think about the rent-vs-buy decision if you're relocating to or settling down in Gurugram.",
    coverImage: "/images/listings/living-room.svg",
    body: "Gurugram attracts a large working population on relocation, which makes the rent-vs-buy question especially common here. Renting gives you flexibility to try different localities — Golf Course Road, Sohna Road, Dwarka Expressway, and New Gurugram all have very different characters — before committing long-term.\n\nBuying makes more sense once you have clarity on how long you plan to stay in the city, your down-payment readiness, and your comfort with a home loan EMI alongside other expenses. It's worth comparing the all-in cost of renting (rent plus maintenance) against the EMI plus maintenance plus opportunity cost of the down payment, rather than comparing rent to EMI alone.\n\nIf you're unsure, a short-term rental in your target locality followed by a purchase once you're confident is a common, low-risk path many buyers in Gurugram take.",
  },
  {
    slug: "guide-to-rera-registration-in-haryana",
    title: "A Simple Guide to RERA Registration in Haryana",
    date: "2026-09-02",
    excerpt: "What Haryana RERA is, why it matters, and how to verify a project's registration before you buy.",
    coverImage: "/images/listings/exterior.svg",
    body: "The Real Estate (Regulation and Development) Act, 2016 is implemented in Haryana through the Haryana Real Estate Regulatory Authority (HRERA), covering separate benches for Gurugram and Panchkula. Any project above the notified size threshold must be registered with HRERA before it can be marketed or sold.\n\nAs a buyer, always ask for the project's RERA registration number and verify it independently on the official HRERA website rather than taking a broker's word for it. The registration page will show the promoter's details, sanctioned layout, and expected completion date.\n\nFor resale/ready properties, RERA registration confirms the original project was compliant, though you should still do your own title and dues verification before purchase.",
  }
];

blogPosts.forEach((p) => writeJSON(BLOG_DIR, p.slug, p));

console.log(`Seeded ${localities.length} localities, ${listings.length} listings, ${blogPosts.length} blog posts, and testimonials.json`);
