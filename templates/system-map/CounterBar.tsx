"use client";

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
    <div className="system-counter-bar relative z-50 flex items-center border-b px-5 py-2.5 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto w-full max-w-[1600px] flex items-center gap-4">
        {/* Logo / Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Share2 className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <div>
            <h1 className="text-sm font-semibold transition-colors">System Map</h1>
            <p className="text-[10px]">your architecture, mapped</p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200 shrink-0" style={{ backgroundColor: 'var(--border-color)' }} />

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
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

        {/* Right side: Counters + Search + Theme */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3 font-mono text-[10px]">
            <Counter value={total} label="nodes" />
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <Counter value={dataStoreCount} label="stores" />
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <Counter value={agentCount} label="agents" />
          </div>

          {/* Search bar */}
          <div className="system-search-container">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search stack..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="system-search-input pl-9"
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

          <button
            type="button"
            onClick={onThemeToggle}
            className="system-theme-toggle flex h-8 w-8 items-center justify-center rounded-lg transition-all"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Sun className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="counter-value font-semibold">{value}</span>
      <span className="counter-label">{label}</span>
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
      className={`filter-pill relative transition-all duration-150 ${
        active ? "active-pill" : ""
      }`}
    >
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" strokeWidth={2.25} />}
        {label}
      </span>
    </button>
  );
}
