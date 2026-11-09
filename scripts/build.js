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

const requiredLearningPages = [
  "python",
];

for (const slug of requiredLearningPages) {
  const page = path.join(publicDir, slug, "index.html");
  if (!fs.existsSync(page)) {
    console.error(`Build failed: learning page is missing for "${slug}".`);
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

const requiredNewInsights = [
  "mj-insights/how-to-choose-the-best-website-designer-in-tamil-nadu",
  "mj-insights/how-much-does-website-development-cost-in-india",
  "mj-insights/local-seo-guide-small-businesses-tamil-nadu",
  "mj-insights/google-business-profile-complete-beginners-guide",
  "mj-insights/why-website-not-showing-on-google",
  "mj-insights/how-to-submit-website-to-google-search-console",
];

for (const slug of requiredNewInsights) {
  const page = path.join(publicDir, slug, "index.html");
  if (!fs.existsSync(page)) {
    console.error(`Build failed: new insights page is missing for "${slug}".`);
    process.exit(1);
  }
}

const requiredModelLaunchInsights = [
  "mj-insights/kimi-k3-1-pro-open-weight-ai-model",
  "mj-insights/qwen3-8-max-ai-model",
  "mj-insights/deepseek-v4-1-flash-1017-model",
  "mj-insights/mistral-large-4-open-weight-model",
  "mj-insights/liquid-ai-lfm3-1-7b-model",
  "mj-insights/ricursive-ripple-65b-preview-model",
  "mj-insights/nvidia-nemotron-3-5-transcribe-model",
];

for (const slug of requiredModelLaunchInsights) {
  const page = path.join(publicDir, slug, "index.html");
  if (!fs.existsSync(page)) {
    console.error(`Build failed: model launch insight is missing for "${slug}".`);
    process.exit(1);
  }
}

const requiredAiInsights = [
  "mj-insights/gpt-vs-claude-vs-gemini-latest-ai-model-comparison",
  "mj-insights/what-are-ai-reasoning-models",
  "mj-insights/top-ai-models-for-coding-2026",
  "mj-insights/understanding-ai-benchmark-scores-gpqa-swebench-aime",
  "mj-insights/best-open-source-ai-models-for-local-use",
  "mj-insights/how-ai-agents-are-changing-software-development",
  "mj-insights/ai-model-releases-monthly-roundup-november-2026",
  "mj-insights/what-is-an-llm-context-window",
  "mj-insights/ai-image-generation-vs-ai-video-generation",
  "mj-insights/how-to-run-ai-models-locally-on-your-laptop",
];

for (const slug of requiredAiInsights) {
  const page = path.join(publicDir, slug, "index.html");
  if (!fs.existsSync(page)) {
    console.error(`Build failed: AI insights page is missing for "${slug}".`);
    process.exit(1);
  }
}

const files = fs.readdirSync(publicDir);
console.log(`Static site ready in public/ (${files.length} top-level files), ${requiredServicePages.length} service pages, ${requiredProjectPages.length} project case studies and ${requiredLocationPages.length} location landing pages:`);
for (const file of files) console.log(" -", file);
