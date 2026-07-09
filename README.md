# system-map-skill

Installs the [System Map](https://github.com/) Claude Code skill into your project in one step.

```
npx system-map-skill
```

This copies `SKILL.md` into `.claude/skills/system-map/` in your current directory. Claude Code
picks up project-scoped skills automatically — no restart needed. Commit the folder so your
teammates get it too.

## Usage

```
cd your-nextjs-project
npx system-map-skill
```

Then, in Claude Code:

> add system map

The skill scaffolds a read-only, animated architecture-graph page (React Flow + framer-motion)
for your Next.js App Router project — either embedded as a dev-only route, or as a standalone
publishable template.

## Flags

- `--force` / `-f` — overwrite an existing `.claude/skills/system-map/SKILL.md`.

## What gets installed

Just the skill definition (`SKILL.md`) — no runtime dependencies are added to your project by
this CLI. The skill itself, once triggered, installs `@xyflow/react`, `framer-motion`, and
`lucide-react` into your project as it scaffolds the page.
