#!/usr/bin/env node
/**
 * Convert .codex/agents/*.toml to .cursor/skills/codex-<name>/SKILL.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const agentsDir = path.join(root, ".codex", "agents");
const skillsRoot = path.join(root, ".cursor", "skills");

function parseTomlAgent(content) {
  const nameMatch = content.match(/^name\s*=\s*"([^"]+)"/m);
  const descMatch = content.match(/^description\s*=\s*"([^"]+)"/m);
  const instrMatch = content.match(
    /developer_instructions\s*=\s*"""\r?\n([\s\S]*?)"""/m,
  );
  if (!nameMatch || !descMatch || !instrMatch) {
    return null;
  }
  return {
    name: nameMatch[1],
    description: descMatch[1],
    instructions: instrMatch[1].trimEnd(),
  };
}

function toSkillDescription(agent) {
  const base = agent.description.replace(/^Use when /i, "Applies when ");
  return `${base} Use on PlannerDesk (insurance-planner B2B portal) tasks matching this specialty, or when the user invokes codex-${agent.name}.`;
}

function buildSkillMd(agent) {
  const skillName = `codex-${agent.name}`;
  const desc = toSkillDescription(agent);
  const title = agent.name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return `---
name: ${skillName}
description: ${desc.replace(/\n/g, " ")}
---

# ${title}

Specialist role mirrored from [\`awesome-codex-subagents\`](https://github.com/VoltAgent/awesome-codex-subagents). On PlannerDesk work, adopt this lens before implementing or reviewing.

## Instructions

${agent.instructions}

## PlannerDesk context

- Follow product boundaries and high-risk gates in \`AGENTS.md\`.
- Combine with \`plannerdesk-agents\` orchestration skill when multiple lenses apply.
- Full agent definition: \`.codex/agents/${agent.name}.toml\`
`;
}

const files = fs.readdirSync(agentsDir).filter((f) => f.endsWith(".toml"));
let created = 0;
let skipped = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(agentsDir, file), "utf8");
  const agent = parseTomlAgent(content);
  if (!agent) {
    console.warn(`SKIP (parse failed): ${file}`);
    skipped++;
    continue;
  }
  const skillDir = path.join(skillsRoot, `codex-${agent.name}`);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), buildSkillMd(agent), "utf8");
  created++;
}

console.log(`Created/updated ${created} skills, skipped ${skipped}`);
