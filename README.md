# system-map-skill

Installs the **System Map** skill and components into your Next.js project in one step. It scaffolds a draggable, animated, and interactive architecture-graph page (built on React Flow & Framer Motion) supporting both Light/Dark themes and an n8n-style details drawer.

```bash
npx system-map-skill
```

This copies the skill definition to `.claude/skills/system-map/SKILL.md` and copies the standardized, fully-encapsulated UI components into `components/system-map/`.

---

## Features

- **n8n-Style Ports & Connections**: Nodes have distinct circular connection handles that highlight on hover. Connections are solid lines with clear closed arrowheads indicating data flow direction.
- **Light & Dark Theme Options**: Dynamic theme switching (Sun/Moon toggle) with custom dark mode colors scoped to prevent leakages.
- **Details Drawer (Click for Info)**: Clicking any node opens an animated slide-over panel showing its description, tags, status, and input/output dependencies. Connections inside the drawer are clickable for easy navigation.
- **Tidy Layout**: Drag cards around to inspect overlapping items, and click the "Tidy" button to instantly snap back to the computed layout.
- **Zero-Hallucination UI**: The React Flow, CSS, and layout code are fully pre-written and packaged. The installer's agent only analyzes your codebase and updates the data structure.

---

## Installation & Usage

1. Go to your Next.js project directory:
   ```bash
   cd your-nextjs-project
   ```

2. Run the installer:
   ```bash
   npx system-map-skill
   ```
   *This copies the component templates into `components/system-map/` and adds the skill definition to `.claude/skills/system-map/`.*

3. Open your project in Claude Code (or your preferred AI agent) and say:
   > "add system map" (or "sistem haritası ekle")

   The agent will install the required peer dependencies (`@xyflow/react`, `framer-motion`, `lucide-react`), analyze your project's folder structure, databases, routes, and services, populate `components/system-map/data.ts` with your actual project map, and wire it up to `app/system-map/page.tsx`.

---

## Keeping the Map Updated

To ensure your architecture diagram never goes stale:

- **Auto-Maintenance (Agents)**: The installer automatically appends a maintenance rule to your project's `AGENTS.md`. When your AI agent writes new code (e.g. adding a database, route, or service), it will automatically update the data structure.
- **Manual Sync**: At any time, you can ask your agent:
  > "update system map" (or "sistem haritasını güncelle")
  
  The agent will run a git diff check, find what changed since the last update, and merge the updates into your map.

---

## Support & Contact

For support, feedback, or inquiries:
- **Website**: [www.patchtr.com](http://www.patchtr.com)
- **Email**: [info@patchtr.com](mailto:info@patchtr.com)

---

## License

MIT - see [LICENSE](LICENSE)
