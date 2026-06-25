#!/usr/bin/env node
/**
 * Bump the app version.
 * Usage:
 *   node scripts/bump-version.mjs          # patch: 1.0.0 → 1.0.1
 *   node scripts/bump-version.mjs minor     # minor: 1.0.0 → 1.1.0
 *   node scripts/bump-version.mjs major     # major: 1.0.0 → 2.0.0
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const versionFile = resolve(__dirname, "../lib/version.ts");

const raw = readFileSync(versionFile, "utf-8");
const match = raw.match(/APP_VERSION\s*=\s*"(\d+)\.(\d+)\.(\d+)"/);
if (!match) {
  console.error("Cannot find APP_VERSION in version.ts");
  process.exit(1);
}

let [, major, minor, patch] = match.map(Number);
const type = process.argv[2] || "patch";

if (type === "major") { major++; minor = 0; patch = 0; }
else if (type === "minor") { minor++; patch = 0; }
else { patch++; }

const newVersion = `${major}.${minor}.${patch}`;
const today = new Date().toISOString().slice(0, 10);

const updated = raw
  .replace(/APP_VERSION\s*=\s*"[^"]*"/, `APP_VERSION = "${newVersion}"`)
  .replace(/BUILD_DATE\s*=\s*"[^"]*"/, `BUILD_DATE = "${today}"`);

writeFileSync(versionFile, updated, "utf-8");
console.log(`Version bumped to ${newVersion} (${today})`);