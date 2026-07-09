"use client";

import { CATEGORY_META } from "./categoryMeta";
import { CATEGORY_LABELS, type SystemCategory } from "./data";

interface ColumnGroupProps {
  data: {
    category: SystemCategory;
    count: number;
  };
}

export default function ColumnGroup({ data }: ColumnGroupProps) {
  const meta = CATEGORY_META[data.category];
  const Icon = meta.icon;

  return (
    <div className="system-column-group flex h-full w-full flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50/20 p-5 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.badge}`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          {CATEGORY_LABELS[data.category]}
        </span>
        <span className="text-[10px] font-mono font-medium text-slate-400">
          ({data.count})
        </span>
      </div>
    </div>
  );
}
