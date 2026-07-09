---
name: system-map
description: >
  Sets up, configures, and updates the "System Map" page — an interactive, draggable (with a one-click
  "Tidy" reset), animated React Flow architecture-graph. The CLI tool has already copied the
  standard components/assets to `components/system-map/`. Trigger when the user says "system map",
  "control plane arayüzü", "mimari haritası", "add system map to this project", "sistem haritası ekle",
  "update system map", "sistem haritasını güncelle", or asks to sync/visualize/update the architecture graph.
---

# System Map Skill

The CLI tool has already copied the complete, standard, production-ready React Flow system map implementation into the target project's `components/system-map/` directory.

Your job as the AI Agent is to perform the integration steps: install runtime dependencies, analyze the project's codebase to discover its real architecture, update the inventory (`components/system-map/data.ts`), and set up the Next.js page routing.

Follow these steps exactly:

## Step 1 — Install Dependencies

Ensure the target project has the required packages installed:
```bash
npm install @xyflow/react framer-motion lucide-react
```
*Note: Always use `@xyflow/react`, never the deprecated `reactflow` library. If peer dependencies fail, use `--legacy-peer-deps`.*

## Step 2 — Confirm Mode & Setup

Determine the rendering destination:
1. **Route path**: Typically `/system-map` (which means you will create `app/system-map/page.tsx`).
2. **Access control**: By default, protect it in production by serving it as a dev-only route:
   ```tsx
   import { notFound } from "next/navigation";
   import dynamic from "next/dynamic";

   const SystemMap = dynamic(() => import("@/components/system-map/SystemMap"), {
     ssr: false,
   });

   export default function Page() {
     if (process.env.NODE_ENV === "production") {
       notFound();
     }
     return <SystemMap />;
   }
   ```
   *Note: Using `dynamic` with `ssr: false` is critical to prevent hydration errors since React Flow relies heavily on client-side browser APIs (window, ResizeObserver).*
3. **Layout bypass**: Check if the project wraps all pages in a global layout (like navigation bars or footers). If the user wants a clean, immersive full-screen view, bypass the wrapper or add a conditional layout check.

## Step 3 — Analyze Codebase & Derive Architecture

Analyze the workspace files (e.g. `package.json`, main pages, API routes, database schemas, environment variables, authentication configs) to compile a real inventory of the project's components. Categorize them into:

1. **AGENTS**: AI assistants, prompts, or workflows configured in the system.
2. **SURFACES**: Main user-facing pages, admin consoles, or APIs.
3. **CORE_SUBSYSTEMS**: Core application modules (auth, payment processors, async workers, search, limiters).
4. **STORE_DATA**: Primary database, vector store, caches, object storages.
5. **EXTERNAL_DEPLOY**: External third-party integrations (Stripe, SendGrid, Sentry, LLM APIs) and deployment hosts.

*Avoid fabricating technologies. If a feature or database is planned but not yet implemented, set `status: "planned"`.*

## Step 4 — Update the Data File

Replace the dummy content in `components/system-map/data.ts` with your derived architecture arrays:
- `SYSTEM_NODES`: Contains nodes with `id`, `category`, `title`, `subtitle`, `description`, `tags`, and `status`.
- `SYSTEM_EDGES`: Contains connections with `id`, `source`, `target`, and `kind` (`"auth" | "data" | "ai" | "http" | "deploy"`).

Maintain the TS types defined at the top of `components/system-map/data.ts`.

## Step 5 — Verification & Build

1. Run `npm run dev` and test the page.
2. Confirm:
   - Node positioning is correct, with no overlapping text.
   - Hovering a node correctly focuses connected edges and dims non-connected nodes (dimmed states should stay grayscale and visible, around 50% opacity).
   - Dragging works and clicking the **Tidy** button resets positions.
   - Category filtering works via the CounterBar pills.
   - Theme toggling works (switching between Light and Dark modes).
   - Clicking on a node reveals its details and clickable connections in the right-side Details Drawer.
3. Run `npm run build` to verify there are no TypeScript, ESLint, or Next.js route validation compilation errors.

## Step 6 — Incremental Updates

When the user asks to "update system map", "sistem haritasını güncelle", or when you are auto-updating the map after code modifications:
1. Examine the git diff (`git diff`) and repository changes to identify newly added, deleted, or modified routes, integrations, databases, or agents.
2. Scan the relevant directories to gather the updated details of these components.
3. Modify `components/system-map/data.ts` by merging the new components with the existing ones. Do not discard manual custom nodes/edges added by the user unless requested; perform a clean semantic merge.
4. Run `npm run build` to verify that the project still compiles perfectly.
