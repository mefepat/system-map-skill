#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const force = process.argv.includes("--force") || process.argv.includes("-f");

// Define paths for the skill definition
const skillSrc = path.join(__dirname, "..", "skill", "SKILL.md");
const skillTargetDir = path.join(process.cwd(), ".claude", "skills", "system-map");
const skillTarget = path.join(skillTargetDir, "SKILL.md");

// Define paths for the React components and hooks
const templatesSrcDir = path.join(__dirname, "..", "templates", "system-map");
const componentsTargetDir = path.join(process.cwd(), "components", "system-map");

// Check if any destination files already exist
let conflicts = [];
if (fs.existsSync(skillTarget) && !force) {
  conflicts.push(`.claude/skills/system-map/SKILL.md`);
}

if (fs.existsSync(templatesSrcDir)) {
  const files = fs.readdirSync(templatesSrcDir);
  for (const file of files) {
    const destPath = path.join(componentsTargetDir, file);
    if (fs.existsSync(destPath) && !force) {
      conflicts.push(`components/system-map/${file}`);
    }
  }
}

if (conflicts.length > 0) {
  console.error("system-map-skill: The following files already exist:");
  conflicts.forEach(file => console.error(`  - ${file}`));
  console.error("Re-run with --force or -f to overwrite existing files.");
  process.exit(1);
}

// 1. Copy the skill definition
fs.mkdirSync(skillTargetDir, { recursive: true });
fs.copyFileSync(skillSrc, skillTarget);
console.log(`system-map-skill: installed .claude/skills/system-map/SKILL.md`);

// 2. Copy the components templates
if (fs.existsSync(templatesSrcDir)) {
  fs.mkdirSync(componentsTargetDir, { recursive: true });
  const files = fs.readdirSync(templatesSrcDir);
  for (const file of files) {
    const srcPath = path.join(templatesSrcDir, file);
    const destPath = path.join(componentsTargetDir, file);
    fs.copyFileSync(srcPath, destPath);
  }
  console.log(`system-map-skill: copied React Flow templates to components/system-map/`);
}

// 3. Append auto-update rule to AGENTS.md
const agentsMdPath = path.join(process.cwd(), "AGENTS.md");
const ruleHeader = "<!-- BEGIN:system-map-auto-update -->";
const ruleFooter = "<!-- END:system-map-auto-update -->";
const autoUpdateRule = `${ruleHeader}
# System Map Auto-Update Rule
Whenever you make changes to this codebase that add, modify, or remove architectural components (such as new routes, databases, AI agents, APIs, or third-party services), you MUST update the architecture inventory in \`components/system-map/data.ts\` to keep the system map accurate.
${ruleFooter}
`;

let agentsMdContent = "";
if (fs.existsSync(agentsMdPath)) {
  agentsMdContent = fs.readFileSync(agentsMdPath, "utf8");
}

if (!agentsMdContent.includes(ruleHeader)) {
  const spacer = agentsMdContent.length > 0 ? "\n\n" : "";
  fs.writeFileSync(agentsMdPath, agentsMdContent + spacer + autoUpdateRule, "utf8");
  console.log("system-map-skill: appended auto-update rule to AGENTS.md");
} else {
  console.log("system-map-skill: auto-update rule already exists in AGENTS.md");
}

console.log("");
console.log("Next step: open this project in Claude Code and say \"add system map\"");
console.log("(or \"sistem haritası ekle\") — the agent will install dependencies,");
console.log("analyze your codebase, and populate components/system-map/data.ts.");
console.log("");
console.log("Commit .claude/skills/system-map/ and components/system-map/ so your team gets it too.");
