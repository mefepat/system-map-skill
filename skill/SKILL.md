---
name: system-map
description: >
  Scaffolds a light/editorial, richly animated "System Map" page — a draggable (with a one-click
  "Tidy" reset), read-only-for-edges React Flow node-graph visualizing a project's own
  architecture (agents, surfaces, core subsystems,
  store/data, external & deploy). Two modes: embedded in an existing Next.js (App Router)
  project as a dev-only route, or as a standalone Next.js template repo meant to be published
  (e.g. to GitHub) with generic example data. Trigger when the user says "system map", "control
  plane arayüzü", "mimari haritası", "add system map to this project", "sistem haritası ekle",
  or asks to visualize a project's own stack/architecture as a node graph.
---

# System Map skill

Builds an architecture-visualization page: a column-organized, animated, hoverable node graph.
Read this whole file before scaffolding — several steps encode gotchas discovered the hard way
(Next.js special-file collision, TypeScript generic constraints, ESLint text-node rule, a
light-theme opacity bug, fixed-row-height card overlap causing a click flicker). Skipping them
reproduces bugs already fixed once.

## Step 0 — Confirm mode and target stack

This skill assumes **Next.js App Router + Tailwind**. If the project uses Pages Router, or a
different framework, stop and ask the user how to adapt — do not silently force App Router
conventions onto a different framework.

Ask the user (unless already answered in this conversation):
1. **Mode** — (a) embed into the current project as a route (e.g. `/system-map`), dev-only by
   default, or (b) standalone repo meant to be published/shared, with generic example data
   instead of the current project's real internals. These differ in Step 1 (real vs. generic
   data) and Step 4 (access gate vs. none — a standalone repo's page IS the product, it doesn't
   need a production gate).
2. **Route path** (mode a only) — default `/system-map`.
3. **Access model** (mode a only) — default: dev-only via `NODE_ENV !== "production"` gate
   (recommended, fully portable, no coupling to the project's auth). Only wire it into the
   project's real auth system if the user explicitly wants it protected in production too.
4. **Full-screen or embedded** (mode a only) — does this project have a global layout wrapper
   (wraps every page with Navbar/Footer/Chatbot, e.g. `LayoutWrapper.tsx`)? If yes, ask whether
   the new route should bypass it for a full-screen look (usually yes). This is the *only*
   project-specific touch in mode a — everything else is copy-paste portable.
5. **Design personality** — ask for 3 words or a reference (Linear/Notion/Raycast-style are
   good prompts) and whether accessibility (colorblind-safe category coding) matters. Default
   recommendation if the user has no preference: light/editorial, "clear, fast, trustworthy"
   (Linear-adjacent), category = color + icon + label always (never color-only).

## Step 1 — Derive content

**Mode a (embedded):** explore the target repo (package.json, key lib/integration files,
README, existing docs) to build a *real* inventory — don't fabricate a technology the user
mentions if you can't find it in the codebase; add it with `status: "planned"` instead.

- **AGENTS** — AI agents/assistants actually wired in
- **SURFACES** — actual routes/pages a user hits
- **CORE SUBSYSTEMS** — auth, session, business-logic RPCs/functions actually in the code
- **STORE + DATA** — actual database, ORM, migrations, key tables
- **EXTERNAL & DEPLOY** — actual third-party services, webhooks, hosting

**Mode b (standalone/publishable):** never ship the source project's real internal details
(RPC names, cookie names, auth mechanisms, migration filenames) to a public template — that's
an information-disclosure risk, not a portfolio flex, unless the user explicitly confirms they
want their real architecture public. Default to a relatable **generic example** (e.g. a
fictional SaaS with an AI support agent, a web/mobile/admin surface, an auth/billing/notification
core, Postgres/Redis/S3 storage, Stripe/SendGrid/Vercel/Sentry/OpenAI externals) so the template
looks real out of the box and is obviously meant to be replaced.

## Step 2 — Install the package

```
npm install @xyflow/react framer-motion lucide-react
```

**Use `@xyflow/react`, never `reactflow`** (deprecated, superseded by v12/`@xyflow/react`). If
the project already has `reactflow` installed, flag it rather than adding a second graph
library. `framer-motion` drives entrance/hover motion; `lucide-react` supplies category icons
(check first — the project may already have an icon set; don't add a second one).

If install throws a peer-dependency error, retry with `--legacy-peer-deps` for that command
only — don't persist it to `.npmrc`.

## Step 3 — Scaffold files

| File | Purpose |
|---|---|
| `page.tsx` (mode a: Server Component; mode b: can render the client component directly, see Step 4) | Entry point / access gate. |
| `SystemMap.tsx` (or `SystemMapClient.tsx` in mode a) | `"use client"`. `ReactFlowProvider` + `ReactFlow` setup, hover/filter state, CSS imports. |
| `components/SystemNode.tsx` | Custom node card, framer-motion entrance + hover/dim states. |
| `components/SystemEdge.tsx` | Custom edge: `BaseEdge` + a path helper, animated dash, color by `kind`, dim/focus states. |
| `components/CounterBar.tsx` | Top bar: title, counters derived from data (never hardcode), category filter pills with a sliding active-pill background. |
| `data/exampleData.ts` (or `mockData.ts`) | Types + the inventory from Step 1. |
| `lib/categoryMeta.ts` | Icon + color-class mapping per category (single source of truth for node badges, edge colors, filter pills). |
| `lib/nodeLayout.ts` | Deterministic column-layout function with **per-node estimated height** (not a fixed row height — see gotcha below). **Never name this file `layout.ts`**. |
| `lib/types.ts` | Render-time types that extend the data types with `visualState` (`"normal" \| "dimmed" \| "focused"`) and, for nodes, `columnIndex`/`rowIndex` for stagger timing. |
| `lib/useReducedMotion.ts` | Hook reading `prefers-reduced-motion`, lazily initialized (see gotcha below). |
| a small overrides CSS file | `.react-flow__attribution` styling only — don't hide attribution (license term), just recolor it. |

### Gotcha: don't name any file `layout.ts`/`layout.tsx` under `app/`

Next.js's App Router route-type validator treats a file named `layout.ts`/`layout.tsx`
anywhere under `app/` as a special route file — even nested inside a non-route directory like
`lib/`. Compiles fine in dev, **fails `next build`'s TypeScript route-validation pass** with a
confusing `Property 'default' is missing in type ... LayoutConfig<...>` error. Name it
`nodeLayout.ts` or similar.

### Gotcha: `@xyflow/react`'s `Node<T>`/`Edge<T>` generics require `Record<string, unknown>`

```ts
export interface SystemNodeData extends Record<string, unknown> {
  id: string;
  category: SystemCategory;
  // ...
}
```

### Gotcha: literal `//` inside JSX text trips `react/jsx-no-comment-textnodes`

Wrap it: `<span>{"// Control Plane"}</span>`.

### Gotcha: `setState` inside a `useEffect` body trips `react-hooks/set-state-in-effect`

For the reduced-motion hook, compute the initial value with a **lazy `useState` initializer**,
and only use the effect to subscribe to changes:

```ts
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);
  return reduced;
}
```

Because this hook (and React Flow generally) reads `window`/`ResizeObserver`, render the map
via `next/dynamic` with `{ ssr: false }` from a `"use client"` page — this sidesteps SSR/
hydration mismatches entirely rather than guarding every browser API call.

### Gotcha: a fixed `ROW_HEIGHT` overlaps cards with real (non-placeholder) content — and the overlap causes a click-triggered flicker

Placeholder example data (1-2 short sentences) fits comfortably in a fixed row height like
130-156px, so this bug hides in mode b (generic data) and only surfaces in mode a once real
project descriptions go in. A real description that runs 3-4 lines overflows its fixed slot and
visually overlaps the card below it — this reads as "text got cut off" (it didn't; it's just
covered) and as "cards are nested/jumbled".

Worse: React Flow elevates a node's z-index on click/select, which reorders overlapping DOM
elements under the cursor. That reorder fires a spurious `mouseleave`/`mouseenter` pair, which
flips the hover-highlight state (`focused` → `dimmed` → `focused`) — the user sees the card
"flash" or "disappear and come back" on click. This looks like an animation bug but the root
cause is layout overlap, not motion code — fixing the layout fixes the flicker too.

**Fix: estimate each card's height from its actual content and stack cumulatively**, don't use
one constant for every row:

```ts
const CHARS_PER_LINE = 36; // tuned to card width minus padding, ~12px font
const LINE_HEIGHT = 17;
const ROW_GAP = 28;

function estimateNodeHeight(item: SystemNodeData): number {
  let h = 44 + 20; // badge row + title
  if (item.subtitle) h += 15;
  const lines = Math.max(1, Math.ceil(item.description.length / CHARS_PER_LINE));
  h += lines * LINE_HEIGHT + 6;
  if (item.tags?.length) h += 26;
  return h + 14; // bottom padding
}
```

Stack each column cumulatively (`y += estimateNodeHeight(item) + ROW_GAP`) instead of
`rowIndex * ROW_HEIGHT`. To vertically center shorter columns against the tallest one, compute
each column's total height first, then offset `startY` by `(maxColumnHeight - thisColumnHeight)
/ 2` — this also fixes the "cards crammed at the top, dead space at the bottom" complaint,
since columns are no longer forced into uniform per-row slots.

This is an estimate, not a DOM measurement — it doesn't need to be exact, just generous enough
that real descriptions never overflow their reserved slot. **Verify with the project's actual
longest description**, not the shortest placeholder, before calling layout done.

### Gotcha: on a light background, a 30%-opacity "dimmed" state reads as *invisible*, not muted

The brutalist dark version dimmed filtered-out nodes to `opacity-30` against `bg-zinc-950` and
it read fine — low-opacity light content on black is still visible. The same `opacity-30`
against a white/light card on a light page is nearly imperceptible in a screenshot and hard to
read live; users perceive filtered items as "gone" rather than "de-emphasized". **On a light
theme, dim to ~45-50% opacity and add `grayscale`** so filtered items stay legible but are
clearly muted. Verify this specific state visually (not just in isolation) — take a screenshot
with a filter active and confirm the non-matching cards are still readable.

## Step 4 — Data schema

```ts
export type SystemCategory =
  | "AGENTS" | "SURFACES" | "CORE_SUBSYSTEMS" | "STORE_DATA" | "EXTERNAL_DEPLOY";

export type NodeStatus = "active" | "planned" | "deprecated";

export interface SystemNodeData extends Record<string, unknown> {
  id: string;
  category: SystemCategory;
  title: string;
  subtitle?: string;
  description: string;
  tags?: string[];
  status?: NodeStatus;
}

export type EdgeKind = "auth" | "data" | "ai" | "http" | "deploy";

export interface SystemEdgeData extends Record<string, unknown> {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  label?: string;
}
```

Render-time extensions (`lib/types.ts`), kept separate from the user-editable data types:

```ts
export type VisualState = "normal" | "dimmed" | "focused";

export interface SystemNodeRenderData extends SystemNodeData {
  columnIndex: number;
  rowIndex: number;
  visualState: VisualState;
}

export interface SystemEdgeRenderData extends SystemEdgeData {
  visualState: VisualState;
}
```

## Step 5 — Visual language (light/editorial default)

Ask Step 0's design-personality question before committing to this, but absent a stronger
preference, this is the validated default:

- Page background: a cool, slightly-tinted light neutral (e.g. `bg-slate-50`), **not** the
  cream/sand "AI default" — a cool neutral reads as a tech/dev tool, warm cream reads as a
  lifestyle blog.
- Card: `rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm`, hover lifts
  (`-translate-y-0.5 shadow-lg`) with a category-tinted glow shadow.
- Category = **color + icon + label, always** (accessibility requirement, not a nice-to-have):
  one Tailwind pastel family per category (`violet`/`sky`/`amber`/`emerald`/`rose` at
  `-50` bg / `-200` border / `-700` text is a solid, contrast-checked starting point — Tailwind
  v4's default palette is already OKLCH-authored) plus a small `lucide-react` icon per category,
  defined once in `lib/categoryMeta.ts` and reused by nodes, edges, and filter pills.
- Edges: `getBezierPath` (softer than a rigid smoothstep for an approachable feel),
  `strokeDasharray` + a CSS `stroke-dashoffset` keyframe animation for a subtle "flow" direction
  cue, color by `EdgeKind`.
- Ambient atmosphere (optional but effective): 1-2 large, blurred, low-opacity gradient blobs
  fixed behind the canvas (`blur-3xl`, slow `drift` keyframe, `prefers-reduced-motion: reduce`
  disables the animation entirely, not just slows it).
- Top bar: sticky, `bg-white/80 backdrop-blur-sm border-b`, counters computed from the data
  array (never hardcoded), filter pills as a segmented control with a `framer-motion`
  `layoutId`-shared sliding active background.

Absolute bans (from the broader impeccable design guidance, apply here too): no gradient text
on the title, no tiny uppercase "eyebrow" labels, no decorative glassmorphism beyond the one
purposeful backdrop-blur top bar, no side-stripe borders.

## Step 6 — Motion (this is a first-class part of the brief, not a finishing touch)

- **Entrance**: each node fades/scales/slides in (`opacity 0→1, scale 0.92→1, y 10→0`),
  staggered by `columnIndex * 0.09 + rowIndex * 0.045` seconds — the graph visibly builds
  column by column. Use `framer-motion`'s `initial`/`animate`/`transition` on a wrapper
  `motion.div`; this only fires once at mount, so later re-renders (hover/filter changes) don't
  replay it.
- **Hover-to-highlight**: track `hoveredNodeId` in the parent (`onNodeMouseEnter`/
  `onNodeMouseLeave` on `<ReactFlow>`). Compute the connected node/edge id set and mark them
  `"focused"`, everything else `"dimmed"`. This is the single most "wow, that's nice" detail in
  the whole build — don't skip it for time.
- **Filter transition**: dim non-matching nodes/edges (see the opacity gotcha above); animate
  the active-filter-pill background with a shared `layoutId` so it slides rather than jumps.
- **Edge flow**: a CSS `@keyframes` animating `stroke-dashoffset` on focused/normal edges,
  disabled via `@media (prefers-reduced-motion: reduce)`.
- **Every animation needs a reduced-motion path.** Read `prefers-reduced-motion` via the hook
  from Step 3 for JS-driven motion (framer-motion delays/durations → 0), and a plain CSS media
  query for anything defined in `@keyframes`.

## Step 7 — React Flow props (draggable, with a one-click reset)

Default to **draggable nodes + a "Tidy" reset button**, not a fully locked read-only layout.
Users expect to nudge a card that's inconveniently placed or overlapping a neighbor (the
estimate in Step 3's gotcha is generous but not pixel-perfect), and a one-click return to the
computed layout is cheap to add and removes any pressure to get every position perfect:

```
nodesDraggable                // cards can be repositioned by hand
nodesConnectable={false}      // still read-only for edges — no new connections drawable
onNodeMouseEnter / onNodeMouseLeave  // drives the hover-highlight state
onNodesChange={onNodesChange} // from useNodesState — required for dragging to work at all
panOnDrag zoomOnScroll fitView fitViewOptions={{ padding: 0.15 }}
colorMode="light"             // or "dark" for a dark-theme variant
proOptions={{ hideAttribution: false }}  // don't hide attribution — license term
```

Only fall back to `nodesDraggable={false}` (fully locked) if the user explicitly asks for a
strictly read-only map — confirm in Step 0 rather than assuming.

Use `useNodesState` (from `@xyflow/react`) instead of a plain `useMemo` for the node array, so
drags persist in state:

```tsx
const [baseNodes, setBaseNodes, onNodesChange] = useNodesState<Node<SystemNodeRenderData>>(
  useMemo(() => buildColumnLayout(SYSTEM_NODES), []),
);
const handleTidy = useCallback(() => setBaseNodes(buildColumnLayout(SYSTEM_NODES)), [setBaseNodes]);
```

Layer hover/filter `visualState` on top of `baseNodes` in a second `useMemo` exactly as before
— dragging only changes `position`, not the derived visual-state logic. Add a small floating
"Tidy" button (bottom-right of the canvas, `position: absolute`) wired to `handleTidy`; give the
card `cursor: grab` so the affordance is discoverable without a tooltip.

Skip `<Controls />` and `<MiniMap />` — their default chrome clashes with a clean, custom look.

### CSS import placement

Import `@xyflow/react/dist/style.css` and the overrides CSS **inside the client map component**,
not the project's global CSS — this scopes React Flow's reset styles to the one route/page that
uses them.

## Step 8 — Access gate (mode a only)

```tsx
import { notFound } from "next/navigation";
import SystemMapClient from "./SystemMapClient";

export default function SystemMapPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <SystemMapClient />;
}
```

Zero dependency on whatever auth system the target project has — copy-paste portable. In mode b
(standalone/publishable repo), skip this entirely: the map page is the whole product, so
`app/page.tsx` renders the map directly (typically via `next/dynamic(..., { ssr: false })`, see
the gotcha in Step 3).

## Step 9 — Global layout wrapper bypass (mode a, only if applicable)

If Step 0 established the project has a layout wrapper injecting Navbar/Footer/Chatbot on every
route, add the new route to its bypass condition for a full-screen look. Locate the wrapper
(grep for where `<Navbar` / `<Footer` render near the root layout) and extend its route check.

## Step 10 — Verify end to end

1. `npm run dev`, open in a browser — confirm columns are aligned with **no card overlap**
   (check against the project's actual longest description, not a short placeholder), entrance
   stagger plays once, hovering a node highlights exactly its connected nodes/edges and dims the
   rest, clicking a node does **not** cause it to flicker/disappear (a symptom of layout overlap
   — see the `ROW_HEIGHT` gotcha), a category filter dims non-matching cards **without making
   them unreadable** (the opacity gotcha), dragging a card repositions it and the "Tidy" button
   restores the computed layout, pan/zoom works, no console errors.
2. `npm run build` — must succeed (catches the `layout.ts` naming gotcha and TS generic issues).
3. Mode a: `NODE_ENV=production npm run start` — confirm the route 404s, rest of site serves
   normally. Mode b: confirm `/` renders the map directly in a production build.
4. Only then report the work done — a green typecheck/lint is not the same as a working page.
