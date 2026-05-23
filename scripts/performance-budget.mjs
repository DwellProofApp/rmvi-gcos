import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const distDir = "dist/assets";
const budgets = {
  appJsGzip: Number(process.env.GCOS_BUDGET_APP_JS_GZIP ?? 130 * 1024),
  cssGzip: Number(process.env.GCOS_BUDGET_CSS_GZIP ?? 70 * 1024),
  vendorJsGzip: Number(process.env.GCOS_BUDGET_VENDOR_JS_GZIP ?? 80 * 1024)
};

const assets = readdirSync(distDir)
  .filter((name) => /\.(js|css)$/.test(name))
  .map((name) => {
    const path = join(distDir, name);
    const bytes = statSync(path).size;
    const gzipBytes = gzipSync(readFileSync(path)).length;
    return { name, path, bytes, gzipBytes };
  });

const checks = [
  {
    name: "app-js-gzip",
    budget: budgets.appJsGzip,
    assets: assets.filter((asset) => /^index-.*\.js$/.test(asset.name))
  },
  {
    name: "css-gzip",
    budget: budgets.cssGzip,
    assets: assets.filter((asset) => /^index-.*\.css$/.test(asset.name))
  },
  {
    name: "vendor-js-gzip",
    budget: budgets.vendorJsGzip,
    assets: assets.filter((asset) => /vendor.*\.js$/.test(asset.name))
  }
];

let failed = false;
for (const check of checks) {
  const total = check.assets.reduce((sum, asset) => sum + asset.gzipBytes, 0);
  const ok = total <= check.budget;
  failed ||= !ok;
  console.log(`${ok ? "✓" : "✕"} ${check.name}: ${formatBytes(total)} / ${formatBytes(check.budget)}`);
  for (const asset of check.assets) {
    console.log(`  - ${asset.name}: ${formatBytes(asset.gzipBytes)} gzip, ${formatBytes(asset.bytes)} raw`);
  }
}

if (failed) process.exit(1);

function formatBytes(value) {
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${(value / 1024).toFixed(1)} KB`;
}
