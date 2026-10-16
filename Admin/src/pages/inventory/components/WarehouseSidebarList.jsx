import { Search, Loader2, Star, Phone, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function WarehouseSidebarList({
  searchKeyword,
  setSearchKeyword,
  loading,
  filteredWarehouses,
  selectedWarehouseId,
  isCreatingNew,
  onSelectWarehouse,
}) {
  return (
    <div className="lg:col-span-4 rounded-[6px] border border-border bg-card overflow-hidden">
      {/* List Search Bar */}
      <div className="p-3 border-b border-border bg-muted/20">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã, địa chỉ..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-background rounded-[6px] border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* List Items */}
      <div className="divide-y divide-border max-h-[calc(100vh-220px)] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Đang tải danh sách kho...</span>
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Không tìm thấy kho hàng nào
          </div>
        ) : (
          filteredWarehouses.map((wh) => {
            const isSelected = wh._id === selectedWarehouseId && !isCreatingNew;
            return (
              <div
                key={wh._id}
                onClick={() => onSelectWarehouse(wh)}
                className={cn(
                  'p-3.5 cursor-pointer transition-colors relative',
                  isSelected
                    ? 'bg-primary/5 border-l-4 border-l-primary'
                    : 'hover:bg-muted/40'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {wh.name}
                      </span>
                      {wh.isDefault && (
                        <Badge variant="default" className="text-[10px] h-4 px-1.5 gap-0.5 rounded-[4px]">
                          <Star size={9} className="fill-current" /> Mặc định
                        </Badge>
                      )}
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-[4px] font-mono',
                          wh.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {wh.code}
                      </span>
                    </div>

                    {wh.phone && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                        <Phone size={11} />
                        <span className="tabular-nums font-mono">{wh.phone}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-1 text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      <MapPin size={11} className="shrink-0 mt-0.5" />
                      <span>{wh.address?.fullAddress || 'Chưa thiết lập địa chỉ chi tiết'}</span>
                    </div>

                    {/* Stock & SKU & Staff Count Pills */}
                    <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-border/40 text-[11px]">
                      <span className="text-muted-foreground">
                        Tồn kho:{' '}
                        <strong className="font-mono tabular-nums text-foreground">
                          {Number(wh.totalStock || 0).toLocaleString()}
                        </strong>
                      </span>
                      <span className="text-border">•</span>
                      <span className="text-muted-foreground">
                        Mặt hàng:{' '}
                        <strong className="font-mono tabular-nums text-foreground">
                          {Number(wh.totalSKUs || 0)}
                        </strong>
                      </span>
                      <span className="text-border">•</span>
                      <span className="text-muted-foreground flex items-center gap-1 font-medium text-primary">
                        <Users size={11} />
                        <strong className="font-mono tabular-nums">
                          {wh.assignedStaffIds?.length || 0}
                        </strong> nv
                      </span>
                    </div>
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
