import type { SystemEdgeData, SystemNodeData } from "./data";

export type VisualState = "normal" | "dimmed" | "focused";

export interface SystemNodeRenderData extends SystemNodeData {
  columnIndex: number;
  rowIndex: number;
  visualState: VisualState;
}

export interface SystemEdgeRenderData extends SystemEdgeData {
  visualState: VisualState;
}
