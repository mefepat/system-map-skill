import { Bot, Cloud, Cog, Database, LayoutPanelLeft, type LucideIcon } from "lucide-react";
import type { EdgeKind, SystemCategory } from "./data";

export const CATEGORY_ORDER: SystemCategory[] = [
  "AGENTS",
  "SURFACES",
  "CORE_SUBSYSTEMS",
  "STORE_DATA",
  "EXTERNAL_DEPLOY",
];

interface CategoryMeta {
  icon: LucideIcon;
  badge: string;
  chip: string;
  glow: string;
  dot: string;
}

export const CATEGORY_META: Record<SystemCategory, CategoryMeta> = {
  AGENTS: {
    icon: Bot,
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    chip: "border-violet-200 bg-violet-50 text-violet-700",
    glow: "shadow-violet-200/60",
    dot: "bg-violet-400",
  },
  SURFACES: {
    icon: LayoutPanelLeft,
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    chip: "border-sky-200 bg-sky-50 text-sky-700",
    glow: "shadow-sky-200/60",
    dot: "bg-sky-400",
  },
  CORE_SUBSYSTEMS: {
    icon: Cog,
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    glow: "shadow-amber-200/60",
    dot: "bg-amber-400",
  },
  STORE_DATA: {
    icon: Database,
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    glow: "shadow-emerald-200/60",
    dot: "bg-emerald-400",
  },
  EXTERNAL_DEPLOY: {
    icon: Cloud,
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    chip: "border-rose-200 bg-rose-50 text-rose-700",
    glow: "shadow-rose-200/60",
    dot: "bg-rose-400",
  },
};

export const CATEGORY_SHORT_LABEL: Record<SystemCategory, string> = {
  AGENTS: "Agent",
  SURFACES: "Surface",
  CORE_SUBSYSTEMS: "Core",
  STORE_DATA: "Store",
  EXTERNAL_DEPLOY: "External",
};

export const EDGE_COLOR: Record<EdgeKind, string> = {
  auth: "#f59e0b",
  data: "#34d399",
  ai: "#a78bfa",
  http: "#38bdf8",
  deploy: "#fb7185",
};
