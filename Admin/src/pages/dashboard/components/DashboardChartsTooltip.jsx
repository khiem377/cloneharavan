export default function DashboardChartsTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground border border-border rounded-[6px] px-3 py-2 text-xs shadow-md z-50 min-w-[150px] antialiased">
        <p className="text-muted-foreground font-semibold border-b border-border pb-1 mb-1.5 font-mono text-[11px] flex items-center justify-between">
          <span>Thời gian</span>
          <span className="text-foreground">{label}</span>
        </p>
        <div className="space-y-1">
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-[2px]" style={{ background: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold font-mono tabular-nums text-foreground">
                {entry.value?.toLocaleString('vi-VN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
