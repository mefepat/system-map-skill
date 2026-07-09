import type { Node } from "@xyflow/react";
import type { SystemCategory, SystemEdgeData, SystemNodeData } from "./data";

export type VisualState = "normal" | "dimmed" | "focused";

export interface SystemNodeRenderData extends SystemNodeData {
  columnIndex: number;
  rowIndex: number;
  visualState: VisualState;
}

export interface SystemEdgeRenderData extends SystemEdgeData {
  visualState: VisualState;
}

export type SystemMapNode = Node<
  SystemNodeRenderData | { category: SystemCategory; count: number }
>;
