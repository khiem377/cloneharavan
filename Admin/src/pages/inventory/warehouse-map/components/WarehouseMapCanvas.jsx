import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CanvasElementNode from './CanvasElementNode';

export default function WarehouseMapCanvas({
  selectedWarehouseObj,
  mode,
  filterInStockOnly,
  setFilterInStockOnly,
  zoom,
  setZoom,
  elements,
  selectedElementId,
  draggingId,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleElementClick,
  handleMouseDownItem,
  handleRotateElement,
  handleDeleteElement,
  openInspectForElement,
}) {
  return (
    <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-xs flex flex-col h-[calc(100vh-210px)] relative">
      {/* Canvas Top Bar: Warehouse info & Zoom Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-4 text-xs">
          <span className="font-bold text-foreground">
            Sơ đồ:{' '}
            <span className="text-primary font-mono">
              {selectedWarehouseObj?.name || 'Kho Tổng Bình Tân'} (Tầng 1)
            </span>
          </span>

          {mode === 'view' && (
            <label className="flex items-center gap-2 cursor-pointer font-medium text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={filterInStockOnly}
                onChange={(e) => setFilterInStockOnly(e.target.checked)}
                className="rounded-[4px] accent-primary"
              />
              <span>Chỉ hiện vị trí còn tồn</span>
            </label>
          )}
        </div>

        {/* Zoom controls (Screenshot 2 & 3 bottom right) */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
            className="h-7 w-7 rounded-[4px] border-border text-muted-foreground active:scale-[0.98]"
            title="Thu nhỏ"
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <span className="text-xs font-mono font-semibold tabular-nums w-12 text-center text-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
            className="h-7 w-7 rounded-[4px] border-border text-muted-foreground active:scale-[0.98]"
            title="Phóng to"
          >
            <ZoomIn className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(1)}
            className="h-7 px-2 text-[11px] font-mono text-muted-foreground active:scale-[0.98]"
          >
            100%
          </Button>
        </div>
      </div>

      {/* Canvas Viewport (Scrollable with Blueprint Grid Pattern) */}
      <div
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        className="flex-1 overflow-auto p-8 relative flex items-center justify-center bg-muted/10 cursor-default"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* The Scalable Canvas Area */}
        <div
          style={{
            width: 1040,
            height: 560,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: draggingId ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative rounded-[8px] border-2 border-primary/50 bg-background shadow-xs select-none"
        >
          {/* Warehouse Inner Floor Tint */}
          <div className="absolute inset-2 rounded-[6px] bg-blue-50/20 dark:bg-blue-950/10 pointer-events-none" />

          {/* RENDER ALL ELEMENTS ON CANVAS */}
          {elements.map((el) => {
            const isSelected = el.id === selectedElementId;
            const isHiddenByFilter =
              filterInStockOnly && mode === 'view' && el.type === 'rack' && !el.hasStock;

            if (isHiddenByFilter) return null;

            return (
              <CanvasElementNode
                key={el.id}
                el={el}
                mode={mode}
                isSelected={isSelected}
                handleElementClick={handleElementClick}
                handleMouseDownItem={handleMouseDownItem}
                handleRotateElement={handleRotateElement}
                handleDeleteElement={handleDeleteElement}
                openInspectForElement={openInspectForElement}
              />
            );
          })}
        </div>
      </div>

      {/* Canvas Bottom Legend (Screenshot 3 footer) */}
      <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-muted-foreground">Chú giải ký hiệu:</span>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-[2px] border-2 border-blue-500 bg-blue-500/20" />
            <span>Vị trí còn tồn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-[2px] border border-border bg-background" />
            <span className="text-muted-foreground">Vị trí trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-[2px] border-2 border-amber-500 bg-amber-500/30" />
            <span className="text-amber-600 font-semibold">Đang chọn</span>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground font-mono">
          Nhấn vào kệ hoặc phòng lạnh để xem chi tiết tồn kho VTHH
        </div>
      </div>
    </div>
  );
}
