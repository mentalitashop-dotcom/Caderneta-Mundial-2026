"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const packagePath = path.join(root, "package.json");
const lockPath = path.join(root, "package-lock.json");
const type = process.argv[2] || "patch";

function nextVersion(version, bumpType) {
  const parts = String(version || "0.0.0").split(".").map(part => Number.parseInt(part, 10) || 0);
  while (parts.length < 3) parts.push(0);
  if (bumpType === "major") return `${parts[0] + 1}.0.0`;
  if (bumpType === "minor") return `${parts[0]}.${parts[1] + 1}.0`;
  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const version = nextVersion(packageJson.version, type);
packageJson.version = version;
packageJson.appVersion = `${version}.0`;
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

if (fs.existsSync(lockPath)) {
  const lockJson = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  lockJson.version = version;
  if (lockJson.packages?.[""]) lockJson.packages[""].version = version;
  fs.writeFileSync(lockPath, `${JSON.stringify(lockJson, null, 2)}\n`);
}

console.log(`Versao atualizada para ${version}`);
