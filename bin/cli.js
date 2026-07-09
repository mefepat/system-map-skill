#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const force = process.argv.includes("--force") || process.argv.includes("-f");

const src = path.join(__dirname, "..", "skill", "SKILL.md");
const targetDir = path.join(process.cwd(), ".claude", "skills", "system-map");
const target = path.join(targetDir, "SKILL.md");

if (fs.existsSync(target) && !force) {
  console.error(
    `system-map-skill: ${path.relative(process.cwd(), target)} already exists. Re-run with --force to overwrite.`,
  );
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(src, target);

console.log(`system-map-skill: installed ${path.relative(process.cwd(), target)}`);
console.log("");
console.log("Next step: open this project in Claude Code and say \"add system map\"");
console.log("(or \"sistem haritası ekle\") — the skill scaffolds the page for you.");
console.log("");
console.log("Commit .claude/skills/system-map/ so your team gets it too.");
