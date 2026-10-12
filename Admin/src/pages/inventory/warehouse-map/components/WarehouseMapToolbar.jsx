import React from 'react';
import { ArrowLeft, Layers, Eye, Edit3, RefreshCw, Save, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function WarehouseMapToolbar({
  navigate,
  warehouses,
  selectedWarehouseId,
  setSelectedWarehouseId,
  mode,
  setMode,
  isFullscreen,
  setIsFullscreen,
  handleResetToDefault,
  handleSaveLayout,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/warehouses')}
          className="h-9 w-9 rounded-[6px] border-border text-muted-foreground hover:bg-muted active:scale-[0.98]"
          title="Quay lại Danh sách kho"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            Thiết lập & Xem sơ đồ Kho hàng hóa
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mô phỏng mặt bằng kho 2D trực quan kiểu MISA AMIS: tra cứu vị trí tồn, kệ hàng & thiết lập sơ đồ
          </p>
        </div>
      </div>

      {/* Right Topbar Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Warehouse Selector */}
        <select
          value={selectedWarehouseId}
          onChange={(e) => setSelectedWarehouseId(e.target.value)}
          className="h-8 px-2.5 text-xs bg-background rounded-[6px] border border-input focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
        >
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name} {w.isDefault ? '(Kho mặc định)' : ''}
            </option>
          ))}
        </select>

        {/* Mode Toggle Switch */}
        <div className="inline-flex rounded-[6px] border border-border p-0.5 bg-muted/40">
          <button
            type="button"
            onClick={() => setMode('view')}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer",
              mode === 'view'
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="size-3.5" /> Xem tồn kho
          </button>
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer",
              mode === 'edit'
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Edit3 className="size-3.5" /> Thiết lập sơ đồ
          </button>
        </div>

        {mode === 'edit' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="h-8 rounded-[6px] text-xs text-muted-foreground hover:text-foreground active:scale-[0.98]"
              title="Khôi phục lại layout mẫu MISA AMIS"
            >
              <RefreshCw className="size-3.5 mr-1" /> Mẫu chuẩn
            </Button>
            <Button
              size="sm"
              onClick={handleSaveLayout}
              className="h-8 rounded-[6px] text-xs font-semibold shadow-xs active:scale-[0.98]"
            >
              <Save className="size-3.5 mr-1" /> Lưu sơ đồ
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="h-8 w-8 rounded-[6px] border-border text-muted-foreground active:scale-[0.98]"
          title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
        >
          {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </Button>
      </div>
    </div>
  );
}
