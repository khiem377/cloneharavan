import React from 'react';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function LocationSidebarTree({
  treeLocations,
  locationSearch,
  setLocationSearch,
  selectedElementId,
  handleElementClick,
}) {
  return (
    <div className="flex flex-col h-[calc(100vh-210px)]">
      {/* Header & Search */}
      <div className="p-3 border-b border-border bg-muted/20 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Danh Sách Vị Trí</span>
          <Badge variant="outline" className="text-[10px] font-mono tabular-nums h-5 px-1.5">
            {treeLocations.length} vị trí
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên vị trí..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-background rounded-[6px] border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tree list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/60 text-xs">
        {treeLocations.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Không tìm thấy vị trí nào phù hợp
          </div>
        ) : (
          treeLocations.map((item) => {
            const isSelected = item.id === selectedElementId;
            const totalQty = (item.items || []).reduce((acc, i) => acc + (i.stock || 0), 0);

            return (
              <div
                key={item.id}
                onClick={() => handleElementClick(item)}
                className={cn(
                  "p-3 cursor-pointer transition-colors flex items-center justify-between gap-2",
                  isSelected
                    ? "bg-primary/10 border-l border-primary"
                    : "hover:bg-muted/40"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground truncate">{item.name}</span>
                    {item.hasStock ? (
                      <span className="inline-block size-2 rounded-full bg-blue-500" title="Còn tồn kho" />
                    ) : (
                      <span className="inline-block size-2 rounded-full bg-muted-foreground/30" title="Vị trí trống" />
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground tabular-nums">
                    {item.code || item.id}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Đang dùng
                  </span>
                  <div className="text-[11px] font-mono font-bold text-foreground tabular-nums mt-0.5">
                    {totalQty} cái
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
