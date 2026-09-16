// One-off script: generates generic placeholder property photo SVGs.
// Run with: node scripts/gen-placeholders.js
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "images", "listings");
fs.mkdirSync(outDir, { recursive: true });

const shots = [
  { name: "exterior", label: "Exterior View", bg: "#D8CDBA", fg: "#0B2545" },
  { name: "living-room", label: "Living Room", bg: "#E7E2D8", fg: "#0B2545" },
  { name: "bedroom", label: "Bedroom", bg: "#DCE3E0", fg: "#0B2545" },
  { name: "kitchen", label: "Kitchen", bg: "#E9DFCB", fg: "#0B2545" },
  { name: "bathroom", label: "Bathroom", bg: "#DDE5EA", fg: "#0B2545" },
  { name: "balcony-view", label: "Balcony View", bg: "#E3E8D9", fg: "#0B2545" },
];

function svg({ label, bg, fg }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="${bg}"/>
  <g opacity="0.5" stroke="${fg}" stroke-width="2">
    <line x1="0" y1="0" x2="800" y2="600"/>
    <line x1="800" y1="0" x2="0" y2="600"/>
  </g>
  <rect x="40" y="40" width="720" height="520" fill="none" stroke="${fg}" stroke-width="2" opacity="0.35"/>
  <text x="400" y="290" font-family="'Poppins','Segoe UI',Arial,sans-serif" font-size="30" font-weight="700" fill="${fg}" text-anchor="middle">NestNeev</text>
  <text x="400" y="330" font-family="'Segoe UI',Arial,sans-serif" font-size="20" fill="${fg}" text-anchor="middle">Sample Photo &#8212; ${label}</text>
</svg>`;
}

for (const shot of shots) {
  fs.writeFileSync(path.join(outDir, `${shot.name}.svg`), svg(shot));
}

console.log(`Generated ${shots.length} placeholder images in ${outDir}`);
