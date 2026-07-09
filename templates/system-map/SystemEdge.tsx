import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { EDGE_COLOR } from "./categoryMeta";
import type { SystemEdgeRenderData } from "./types";

export default function SystemEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps & { data?: SystemEdgeRenderData }) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.35,
  });

  const color = data ? EDGE_COLOR[data.kind] : "#94a3b8";
  const focused = data?.visualState === "focused";
  const dimmed = data?.visualState === "dimmed";
  const isPlanned = data?.label === "planned";

  // Use dashed line for planned connections, or when focused to animate the flow
  const strokeDasharray = isPlanned ? "4 4" : focused ? "6 6" : undefined;

  return (
    <>
      <BaseEdge
        path={path}
        className={focused ? "edge-flow" : undefined}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: focused ? 2.5 : 1.75,
          strokeDasharray,
          opacity: dimmed ? 0.15 : focused ? 1 : 0.7,
          transition: "opacity 200ms ease, stroke-width 200ms ease",
        }}
      />
    </>
  );
}
