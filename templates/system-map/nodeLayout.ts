import type { SystemCategory, SystemNodeData } from "./data";
import { CATEGORY_ORDER } from "./categoryMeta";
import type { SystemMapNode } from "./types";

export const CARD_WIDTH = 288;
const GROUP_PADDING_X = 20;
const GROUP_PADDING_TOP = 56;
const GROUP_PADDING_BOTTOM = 20;
export const GROUP_WIDTH = CARD_WIDTH + GROUP_PADDING_X * 2; // 328px
const COLUMN_GAP = 96;
const COLUMN_TOP_PADDING = 32;
const ROW_GAP = 36;

// Rough text-metric estimate for a 12px/16.8px-leading paragraph inside a
// 288px card (minus padding) — good enough to reserve vertical space without
// measuring the DOM. Deliberately generous: overestimating just adds a
// little air between cards, underestimating causes overlap.
const CHARS_PER_LINE = 32;
const LINE_HEIGHT = 17;

function estimateNodeHeight(item: SystemNodeData): number {
  let height = 44; // badge row + top padding
  height += 22; // title line
  if (item.subtitle) height += 18;
  // Clamp description to 3 lines max (matching CSS line-clamp-3)
  const rawLines = Math.max(1, Math.ceil(item.description.length / CHARS_PER_LINE));
  const lines = Math.min(rawLines, 3);
  height += lines * LINE_HEIGHT + 6;
  if (item.tags && item.tags.length > 0) height += 28;
  height += 16; // bottom padding
  return height;
}

const COLUMN_X: Record<SystemCategory, number> = CATEGORY_ORDER.reduce(
  (acc, cat, i) => {
    acc[cat] = i * (GROUP_WIDTH + COLUMN_GAP);
    return acc;
  },
  {} as Record<SystemCategory, number>,
);

export function buildColumnLayout(nodes: SystemNodeData[]): SystemMapNode[] {
  const byCategory = new Map<SystemCategory, SystemNodeData[]>();
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
  for (const n of nodes) byCategory.get(n.category)?.push(n);

  const columnHeights = CATEGORY_ORDER.map((cat) => {
    const items = byCategory.get(cat) ?? [];
    if (items.length === 0) return 0;
    const contentHeight = items.reduce((sum, item) => sum + estimateNodeHeight(item), 0);
    return contentHeight + (items.length - 1) * ROW_GAP;
  });

  const maxColumnHeight = Math.max(...columnHeights);

  // Return column group containers first, followed by system card nodes
  const layoutNodes: SystemMapNode[] = [];

  CATEGORY_ORDER.forEach((cat, columnIndex) => {
    const items = byCategory.get(cat) ?? [];
    const contentHeight = columnHeights[columnIndex];
    const groupHeight = contentHeight > 0
      ? contentHeight + GROUP_PADDING_TOP + GROUP_PADDING_BOTTOM
      : GROUP_PADDING_TOP + GROUP_PADDING_BOTTOM + 60; // min height fallback

    const maxGroupHeight = maxColumnHeight + GROUP_PADDING_TOP + GROUP_PADDING_BOTTOM;
    const startY = COLUMN_TOP_PADDING + (maxGroupHeight - groupHeight) / 2;

    const groupId = `group-${cat}`;

    // Add column group container node
    layoutNodes.push({
      id: groupId,
      type: "group",
      position: { x: COLUMN_X[cat], y: startY },
      style: { width: GROUP_WIDTH, height: groupHeight },
      data: { category: cat, count: items.length },
      draggable: false,
      selectable: false,
    });

    // Add children card nodes using absolute coordinates to allow free dragging
    let y = GROUP_PADDING_TOP;
    items.forEach((item, rowIndex) => {
      layoutNodes.push({
        id: item.id,
        type: "system",
        position: { x: COLUMN_X[cat] + GROUP_PADDING_X, y: startY + y },
        data: { ...item, columnIndex, rowIndex, visualState: "normal" as const },
        draggable: true,
        style: { width: CARD_WIDTH },
      });
      y += estimateNodeHeight(item) + ROW_GAP;
    });
  });

  return layoutNodes;
}
