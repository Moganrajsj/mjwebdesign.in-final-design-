// Static site: everything Vercel should serve already lives in public/.
// This check makes the build fail loudly instead of deploying a 404.
const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "..", "public");
const index = path.join(publicDir, "index.html");

if (!fs.existsSync(index)) {
  console.error("Build failed: public/index.html is missing.");
  process.exit(1);
}

const requiredServicePages = [
  "website-design",
  "ecommerce",
  "brand-identity",
  "creative-design",
  "brand-films",
  "seo-digital-marketing",
];

for (const slug of requiredServicePages) {
  const page = path.join(publicDir, "services", slug, "index.html");
  if (!fs.existsSync(page)) {
    console.error(`Build failed: service page is missing for "${slug}".`);
    process.exit(1);
  }
}

const files = fs.readdirSync(publicDir);
console.log(`Static site ready in public/ (${files.length} top-level files) and ${requiredServicePages.length} service pages:`);
for (const file of files) console.log(" -", file);
