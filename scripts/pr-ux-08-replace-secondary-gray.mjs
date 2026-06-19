import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set(["node_modules", ".next", ".git"]);
const TARGET_DIRS = ["app", "components", "lib"];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts|css)$/.test(name)) files.push(full);
  }
  return files;
}

let changed = 0;
for (const dir of TARGET_DIRS) {
  const base = path.join(ROOT, dir);
  if (!fs.existsSync(base)) continue;
  for (const file of walk(base)) {
    const original = fs.readFileSync(file, "utf8");
    const next = original
      .replaceAll("#5B6470", "#4A5565")
      .replaceAll("#5b6470", "#4a5565");
    if (next !== original) {
      fs.writeFileSync(file, next, "utf8");
      changed += 1;
    }
  }
}

console.log(`Updated ${changed} files`);
