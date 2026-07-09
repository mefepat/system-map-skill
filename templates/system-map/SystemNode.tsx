"use client";

import { motion } from "framer-motion";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORY_META, CATEGORY_SHORT_LABEL } from "./categoryMeta";
import { useReducedMotion } from "./useReducedMotion";
import type { SystemNodeRenderData } from "./types";

export default function SystemNode({ data, selected }: NodeProps & { data: SystemNodeRenderData }) {
  const reduced = useReducedMotion();
  const meta = CATEGORY_META[data.category];
  const Icon = meta.icon;
  const isPlanned = data.status === "planned";
  const isDeprecated = data.status === "deprecated";
  const isMuted = isPlanned || isDeprecated;

  const dimmed = data.visualState === "dimmed";
  const focused = data.visualState === "focused";

  const delay = reduced ? 0 : data.columnIndex * 0.09 + data.rowIndex * 0.045;

  // Health check status simulation
  const [health, setHealth] = useState<"loading" | "online" | "degraded" | "offline">("loading");

  useEffect(() => {
    // Generate a random loading state delay to make the map feel alive on mount
    const loadTime = Math.random() * 900 + 300;
    const timer = setTimeout(() => {
      if (data.healthStatus) {
        setHealth(data.healthStatus);
      } else if (isPlanned) {
        setHealth("offline");
      } else if (isDeprecated) {
        setHealth("degraded");
      } else {
        setHealth("online");
      }
    }, loadTime);

    return () => clearTimeout(timer);
  }, [data.healthStatus, isPlanned, isDeprecated]);

  return (
    <motion.div
      initial={reduced ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`system-node-card w-full rounded-xl border px-4 py-3.5 shadow-sm transition-all duration-200 ${
          isMuted ? "border-dashed" : ""
        } ${dimmed ? "opacity-50 grayscale" : "opacity-100"} ${
          focused ? `is-focused -translate-y-0.5 shadow-lg ${meta.glow}` : ""
        } ${selected ? "is-selected" : ""}`}
      >
        {/* Pulsing Health Status Dot */}
        <span
          className={`health-dot ${health}`}
          title={`Health status: ${health.toUpperCase()}`}
        />

        <div className="mb-2 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${meta.badge}`}
          >
            <Icon className="h-3 w-3" strokeWidth={2.25} />
            {CATEGORY_SHORT_LABEL[data.category]}
          </span>
          {isPlanned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              <Clock className="h-3 w-3" />
              planned
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold transition-colors pr-4">{data.title}</h3>
        {data.subtitle && (
          <p className="node-subtitle mt-0.5 font-mono text-[10px]">{data.subtitle}</p>
        )}
        <p className="node-description mt-1.5 text-[12px] leading-snug transition-colors">{data.description}</p>

        {data.tags && data.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {data.tags.map((t) => (
              <span
                key={t}
                className="tag-pill rounded-full border px-1.5 py-0.5 text-[9px] transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <Handle
          type="target"
          position={Position.Left}
          className={`system-handle-port !h-3.5 !w-3.5 !border-2 !bg-white transition-all duration-200 hover:scale-110 ${
            focused ? `focused-port !${meta.dot.replace("bg-", "border-")}` : "!border-slate-200"
          }`}
          style={{ left: "-7px" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          className={`system-handle-port !h-3.5 !w-3.5 !border-2 !bg-white transition-all duration-200 hover:scale-110 ${
            focused ? `focused-port !${meta.dot.replace("bg-", "border-")}` : "!border-slate-200"
          }`}
          style={{ right: "-7px" }}
        />
      </div>
    </motion.div>
  );
}
