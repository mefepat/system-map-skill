import type { Node } from "@xyflow/react";
import type { SystemCategory, SystemNodeData } from "./data";
import { CATEGORY_ORDER } from "./categoryMeta";
import type { SystemNodeRenderData } from "./types";

export const CARD_WIDTH = 288;
const COLUMN_GAP = 128;
const COLUMN_TOP_PADDING = 72;
const ROW_GAP = 28;

// Rough text-metric estimate for a 12px/16.8px-leading paragraph inside a
// 288px card (minus padding) — good enough to reserve vertical space without
// measuring the DOM. Deliberately generous: overestimating just adds a
// little air between cards, underestimating causes overlap.
const CHARS_PER_LINE = 36;
const LINE_HEIGHT = 17;

function estimateNodeHeight(item: SystemNodeData): number {
  let height = 44; // badge row + top padding
  height += 20; // title line
  if (item.subtitle) height += 15;
  const lines = Math.max(1, Math.ceil(item.description.length / CHARS_PER_LINE));
  height += lines * LINE_HEIGHT + 6;
  if (item.tags && item.tags.length > 0) height += 26;
  height += 14; // bottom padding
  return height;
}

const COLUMN_X: Record<SystemCategory, number> = CATEGORY_ORDER.reduce(
  (acc, cat, i) => {
    acc[cat] = i * (CARD_WIDTH + COLUMN_GAP);
    return acc;
  },
  {} as Record<SystemCategory, number>,
);

export function buildColumnLayout(nodes: SystemNodeData[]): Node<SystemNodeRenderData>[] {
  const byCategory = new Map<SystemCategory, SystemNodeData[]>();
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
  for (const n of nodes) byCategory.get(n.category)?.push(n);

  const columnHeights = CATEGORY_ORDER.map((cat) => {
    const items = byCategory.get(cat) ?? [];
    const contentHeight = items.reduce((sum, item) => sum + estimateNodeHeight(item), 0);
    return contentHeight + Math.max(0, items.length - 1) * ROW_GAP;
  });
  const maxColumnHeight = Math.max(...columnHeights);

  return CATEGORY_ORDER.flatMap((cat, columnIndex) => {
    const items = byCategory.get(cat) ?? [];
    const startY = COLUMN_TOP_PADDING + (maxColumnHeight - columnHeights[columnIndex]) / 2;
    let y = startY;
    return items.map((item, rowIndex) => {
      const node: Node<SystemNodeRenderData> = {
        id: item.id,
        type: "system",
        position: { x: COLUMN_X[cat], y },
        data: { ...item, columnIndex, rowIndex, visualState: "normal" as const },
        draggable: true,
        style: { width: CARD_WIDTH },
      };
      y += estimateNodeHeight(item) + ROW_GAP;
      return node;
    });
  });
}
