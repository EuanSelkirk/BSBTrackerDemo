// scripts/download-route-images.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Usage: node scripts/download-route-images.mjs path/to/bsbtracker_mock_data.js
const INPUT_PATH =
  process.argv[2] || path.resolve(process.cwd(), "bsbtracker_mock_data.js");
const OUT_DIR = path.resolve(process.cwd(), "public", "route-images");

// Simple concurrency limiter
function pLimit(concurrency = Math.max(2, os.cpus().length)) {
  const queue = [];
  let active = 0;
  const next = () => {
    if (active >= concurrency || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn()
      .then((v) => resolve(v))
      .catch(reject)
      .finally(() => {
        active--;
        next();
      });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
}

// Try to load data by importing the JS module
async function tryImport(file) {
  try {
    const url = pathToFileURL(file).href;
    const mod = await import(url);
    // Heuristics: support various export shapes
    const candidates = [
      mod.routes,
      mod.default,
      mod.data,
      mod.mockData,
      mod.MOCK_ROUTES,
    ].filter(Boolean);

    for (const c of candidates) {
      if (Array.isArray(c)) return c;
      if (typeof c === "object" && Array.isArray(c.routes)) return c.routes;
    }
    return null;
  } catch {
    return null;
  }
}

// Fallback: regex-scan the file for route_id + image_url pairs
async function regexExtract(file) {
  const text = await fs.readFile(file, "utf8");
  const results = [];
  // Capture route_id "...", then later image_url "..."
  const re =
    /route_id:\s*["']([^"']+)["'][\s\S]*?image_url:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const route_id = m[1].trim();
    const image_url = m[2].trim();
    if (route_id && image_url) {
      results.push({ route_id, image_url });
    }
  }
  return results;
}

function extFromUrlOrContentType(url, contentType) {
  // Try URL path first
  const u = new URL(url);
  const base = path.basename(u.pathname);
  const ext = (base.split(".").pop() || "").toLowerCase();
  if (ext && ext.length <= 5) {
    return ext; // jpg, jpeg, png, webp, avif, etc.
  }
  // Fallback: infer from content-type
  if (contentType) {
    if (contentType.includes("image/jpeg")) return "jpg";
    if (contentType.includes("image/png")) return "png";
    if (contentType.includes("image/webp")) return "webp";
    if (contentType.includes("image/avif")) return "avif";
  }
  return "jpg"; // default
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(fp) {
  try {
    await fs.access(fp);
    return true;
  } catch {
    return false;
  }
}

async function downloadOne({ route_id, image_url }) {
  // HEAD to get content-type (best-effort), then GET
  let ext = "jpg";
  try {
    const head = await fetch(image_url, { method: "HEAD" });
    const ct = head.headers.get("content-type") || "";
    ext = extFromUrlOrContentType(image_url, ct);
  } catch {
    // ignore, we’ll infer from URL or default
    ext = extFromUrlOrContentType(image_url, null);
  }

  const outPath = path.join(OUT_DIR, `${route_id}.${ext}`);
  if (await fileExists(outPath)) {
    console.log(`⏭️  Skip (exists): ${outPath}`);
    return { route_id, status: "skipped", outPath };
  }

  console.log(`⬇️  Downloading ${image_url} -> ${outPath}`);
  const res = await fetch(image_url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${image_url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buf);
  return { route_id, status: "saved", outPath };
}

async function main() {
  console.log(`Reading: ${INPUT_PATH}`);
  await ensureDir(OUT_DIR);

  let routes = await tryImport(INPUT_PATH);

  if (!routes) {
    console.log(
      "Module import failed or no array export found — falling back to regex scan…"
    );
    routes = await regexExtract(INPUT_PATH);
  }

  // Normalize to objects with route_id + image_url
  const items = [];
  if (Array.isArray(routes)) {
    for (const r of routes) {
      if (r && typeof r === "object") {
        const route_id = r.route_id || r.id || r.routeId;
        const image_url = r.image_url || r.imageUrl;
        if (route_id && image_url)
          items.push({
            route_id: String(route_id),
            image_url: String(image_url),
          });
      }
    }
  }

  if (items.length === 0) {
    console.error(
      "No route image URLs found. Make sure your file contains { route_id, image_url } entries."
    );
    process.exit(1);
  }

  // Deduplicate by route_id (last one wins)
  const map = new Map();
  for (const it of items) map.set(it.route_id, it);
  const unique = Array.from(map.values());

  console.log(
    `Found ${items.length} entries, ${unique.length} unique by route_id.`
  );
  const limit = pLimit(6); // adjust concurrency if needed

  const results = await Promise.allSettled(
    unique.map((it) => limit(() => downloadOne(it)))
  );

  const summary = {
    saved: results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "saved"
    ).length,
    skipped: results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "skipped"
    ).length,
    failed: results.filter((r) => r.status === "rejected").length,
  };

  console.log("\nDone.");
  console.log(`✅ Saved:  ${summary.saved}`);
  console.log(`⏭️  Skipped: ${summary.skipped}`);
  console.log(`❌ Failed:  ${summary.failed}`);

  if (summary.failed > 0) {
    for (const r of results) {
      if (r.status === "rejected") console.error(r.reason);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
