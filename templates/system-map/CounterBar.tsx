"use client";

import { motion } from "framer-motion";
import { Share2, Sun, Moon, Search, X } from "lucide-react";
import { CATEGORY_LABELS, type SystemCategory, type SystemNodeData } from "./data";
import { CATEGORY_META, CATEGORY_ORDER } from "./categoryMeta";

interface CounterBarProps {
  nodes: SystemNodeData[];
  activeCategory: SystemCategory | null;
  onCategoryChange: (category: SystemCategory | null) => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function CounterBar({
  nodes,
  activeCategory,
  onCategoryChange,
  theme,
  onThemeToggle,
  searchQuery,
  onSearchChange,
}: CounterBarProps) {
  const total = nodes.length;
  const dataStoreCount = nodes.filter((n) => n.category === "STORE_DATA").length;
  const agentCount = nodes.filter((n) => n.category === "AGENTS").length;

  return (
    <div className="system-counter-bar relative z-10 flex flex-col gap-3 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
            <Share2 className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 transition-colors">System Map</h1>
            <p className="text-[11px] text-slate-400">your architecture, mapped</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="system-search-container">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search stack..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="system-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="system-search-clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-500">
            <Counter value={total} label="nodes" />
            <Counter value={dataStoreCount} label="data stores" />
            <Counter value={agentCount} label="agents" />
          </div>

          <button
            type="button"
            onClick={onThemeToggle}
            className="system-theme-toggle flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900 dark:hover:text-white"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" strokeWidth={2.25} />
            ) : (
              <Sun className="h-4 w-4" strokeWidth={2.25} />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterPill
          label="All"
          active={activeCategory === null}
          onClick={() => onCategoryChange(null)}
        />
        {CATEGORY_ORDER.map((cat) => {
          const Icon = CATEGORY_META[cat].icon;
          return (
            <FilterPill
              key={cat}
              label={CATEGORY_LABELS[cat]}
              icon={Icon}
              active={activeCategory === cat}
              onClick={() => onCategoryChange(activeCategory === cat ? null : cat)}
            />
          );
        })}
      </div>
    </div>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  return (
    <span className="counter-pill rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 transition-colors">
      <span className="font-semibold text-slate-700 dark:text-slate-300">{value}</span> {label}
    </span>
  );
}

function FilterPill({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`filter-pill relative rounded-full px-3 py-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900 ${
        active ? "active-pill" : ""
      }`}
    >
      {active && (
        <motion.span
          layoutId="active-filter-pill"
          className="absolute inset-0 rounded-full bg-slate-900 dark:bg-slate-100"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <span className={`relative z-10 inline-flex items-center gap-1.5 ${active ? "text-white dark:text-slate-950" : ""}`}>
        {Icon && <Icon className="h-3 w-3" strokeWidth={2.25} />}
        {label}
      </span>
    </button>
  );
}
