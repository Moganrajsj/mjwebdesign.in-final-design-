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

const requiredLegalPages = [
  "privacy-policy",
  "about-us",
];

for (const slug of requiredLegalPages) {
  const page = path.join(publicDir, slug, "index.html");
  if (!fs.existsSync(page)) {
    console.error(`Build failed: legal page is missing for "${slug}".`);
    process.exit(1);
  }
}

const favicon = path.join(publicDir, "favicon.png");
if (!fs.existsSync(favicon)) {
  console.error("Build failed: public/favicon.png is missing.");
  process.exit(1);
}

const requiredLocationPages = [
  "website-design-company-tamil-nadu",
];

for (const slug of requiredLocationPages) {
  const page = path.join(publicDir, slug, "index.html");
  if (!fs.existsSync(page)) {
    console.error(`Build failed: location landing page is missing for "${slug}".`);
    process.exit(1);
  }
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
  "tm-international-tradeline",
];

for (const slug of requiredProjectPages) {
  const page = path.join(publicDir, "projects", slug, "index.html");
  if (!fs.existsSync(page)) {
    console.error(`Build failed: project case study is missing for "${slug}".`);
    process.exit(1);
  }
}

const requiredInsightsPages = [
  "mj-insights",
  "mj-insights/how-much-does-a-business-website-cost-in-tamil-nadu",
  "mj-insights/why-every-small-business-needs-a-website",
  "mj-insights/website-vs-instagram-which-is-better-for-your-business",
  "mj-insights/7-important-features-every-business-website-should-have",
  "mj-insights/how-to-start-an-online-store-in-tamil-nadu",
];

for (const slug of requiredInsightsPages) {
  const page = path.join(publicDir, slug, "index.html");
  if (!fs.existsSync(page)) {
    console.error(`Build failed: insights page is missing for "${slug}".`);
    process.exit(1);
  }
}

const files = fs.readdirSync(publicDir);
console.log(`Static site ready in public/ (${files.length} top-level files), ${requiredServicePages.length} service pages, ${requiredProjectPages.length} project case studies and ${requiredLocationPages.length} location landing pages:`);
for (const file of files) console.log(" -", file);
