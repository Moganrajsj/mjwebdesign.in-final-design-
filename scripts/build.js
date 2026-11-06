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

const requiredProjectPages = [
  "sriram-broadband",
  "ayli-womens-fashion",
  "spidy-clothing",
  "ugan-foods",
];

for (const slug of requiredProjectPages) {
  const page = path.join(publicDir, "projects", slug, "index.html");
  if (!fs.existsSync(page)) {
    console.error(`Build failed: project case study is missing for "${slug}".`);
    process.exit(1);
  }
}

const files = fs.readdirSync(publicDir);
console.log(`Static site ready in public/ (${files.length} top-level files), ${requiredServicePages.length} service pages and ${requiredProjectPages.length} project case studies:`);
for (const file of files) console.log(" -", file);
