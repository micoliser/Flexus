const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "public", "sitemap.xml");

const DEFAULT_SITE_URL = "https://www.flexussolutions.com";
const DEFAULT_API_ADDRESS = "https://flexussolutions.com";
const DEFAULT_API_VERSION = "v1";

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/products", changefreq: "daily", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
];

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};

  const result = {};
  const content = fs.readFileSync(filePath, "utf8");

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  });

  return result;
};

const mergedEnv = {
  ...parseEnvFile(path.join(ROOT, ".env")),
  ...parseEnvFile(path.join(ROOT, ".env.production")),
  ...process.env,
};

const siteUrl = trimTrailingSlash(
  mergedEnv.REACT_APP_SITE_URL || DEFAULT_SITE_URL,
);
const apiAddress = trimTrailingSlash(
  mergedEnv.REACT_APP_API_ADDRESS || DEFAULT_API_ADDRESS,
);
const apiVersion = String(
  mergedEnv.REACT_APP_API_VERSION || DEFAULT_API_VERSION,
).trim();

const productsEndpoint = `${apiAddress}/api/${apiVersion}/products`;

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const buildUrlNode = ({ loc, changefreq, priority, lastmod }) => {
  const lines = ["  <url>", `    <loc>${escapeXml(loc)}</loc>`];

  if (lastmod) {
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
  }

  lines.push(`    <changefreq>${changefreq}</changefreq>`);
  lines.push(`    <priority>${priority}</priority>`);
  lines.push("  </url>");

  return lines.join("\n");
};

const fetchPublishedProducts = async () => {
  const allProducts = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const url = new URL(productsEndpoint);
    url.searchParams.set("status", "published");
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "100");

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Sitemap fetch failed (${response.status}) for ${url}`);
    }

    const payload = await response.json();
    const products = Array.isArray(payload?.data) ? payload.data : [];
    const pagination = payload?.pagination || {};

    allProducts.push(...products);
    hasNext = Boolean(pagination.hasNext);
    page += 1;

    if (!pagination.hasNext && products.length === 100) {
      hasNext = false;
    }
  }

  return allProducts;
};

const buildSitemapXml = (products = []) => {
  const staticNodes = STATIC_ROUTES.map((route) =>
    buildUrlNode({
      loc: `${siteUrl}${route.path}`,
      changefreq: route.changefreq,
      priority: route.priority,
    }),
  );

  const productNodes = products
    .map((product) => {
      const id = String(product?.id || product?._id || "").trim();
      if (!id) return null;

      return buildUrlNode({
        loc: `${siteUrl}/products/${id}`,
        changefreq: "weekly",
        priority: "0.85",
        lastmod: formatDate(product?.updatedAt || product?.createdAt),
      });
    })
    .filter(Boolean);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticNodes,
    ...productNodes,
    "</urlset>",
    "",
  ].join("\n");
};

const writeSitemap = (xml) => {
  fs.writeFileSync(OUTPUT_PATH, xml, "utf8");
};

const run = async () => {
  try {
    const products = await fetchPublishedProducts();
    const xml = buildSitemapXml(products);
    writeSitemap(xml);
    console.log(
      `[sitemap] Generated ${OUTPUT_PATH} with ${products.length} product URLs.`,
    );
  } catch (error) {
    console.warn(`[sitemap] Failed to fetch products: ${error.message}`);
    const xml = buildSitemapXml([]);
    writeSitemap(xml);
    console.warn(
      "[sitemap] Wrote fallback sitemap with static routes only so build can continue.",
    );
  }
};

run();
