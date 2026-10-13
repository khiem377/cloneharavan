import React from 'react';

export default function SupplierStatusTabs({ statusTab, setStatusTab, setPage, counts = { all: 0, active: 0, inactive: 0 } }) {
  return (
    <div className="flex items-center gap-1 border-b border-border text-xs">
      <button
        type="button"
        onClick={() => {
          setStatusTab('all');
          setPage(1);
        }}
        className={`px-3 py-2 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
          statusTab === 'all'
            ? 'border-primary text-primary font-bold'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
      >
        <span>Tất cả</span>
        <span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[10px] tabular-nums font-bold">
          {counts.all || 0}
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          setStatusTab('active');
          setPage(1);
        }}
        className={`px-3 py-2 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
          statusTab === 'active'
            ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="size-2 rounded-full bg-emerald-500 inline-block" />
        <span>Đang hoạt động</span>
        <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 font-mono text-[10px] tabular-nums font-bold">
          {counts.active || 0}
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          setStatusTab('inactive');
          setPage(1);
        }}
        className={`px-3 py-2 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
          statusTab === 'inactive'
            ? 'border-destructive text-destructive font-bold'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="size-2 rounded-full bg-destructive inline-block" />
        <span>Không hoạt động</span>
        <span className="rounded-full bg-destructive/10 text-destructive px-1.5 py-0.2 font-mono text-[10px] tabular-nums font-bold">
          {counts.inactive || 0}
        </span>
      </button>
    </div>
  );
}
