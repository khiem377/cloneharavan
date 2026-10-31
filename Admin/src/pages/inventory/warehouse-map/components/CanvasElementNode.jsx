import React from 'react';
import {
  RotateCw, Trash2, FileText, Truck, Move, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CanvasElementNode({
  el,
  mode,
  isSelected,
  handleElementClick,
  handleMouseDownItem,
  handleRotateElement,
  handleDeleteElement,
  openInspectForElement,
}) {
  const totalStock = (el.items || []).reduce((acc, i) => acc + (i.stock || 0), 0);

  // Floating toolbar for selected element in Editor Mode (Screenshot 2)
  const renderFloatingToolbar = () => {
    if (mode !== 'edit' || !isSelected) return null;

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-card border border-border rounded-[6px] px-1.5 py-1 shadow-xs text-xs whitespace-nowrap"
      >
        {(el.type === 'rack' || el.type === 'room') && (
          <button
            type="button"
            onClick={() => openInspectForElement(el)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer font-medium text-[11px]"
            title="Chi tiết vị trí VTHH"
          >
            <FileText className="size-3.5 text-primary" />
            <span>VTHH</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => handleRotateElement(el.id)}
          className="p-1 hover:bg-muted rounded-[4px] text-muted-foreground hover:text-foreground cursor-pointer"
          title="Xoay 90 độ"
        >
          <RotateCw className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleDeleteElement(el.id)}
          className="p-1 hover:bg-destructive/10 rounded-[4px] text-destructive cursor-pointer"
          title="Xóa phần tử"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    );
  };

  // 1. ROOM / SPECIAL ZONE
  if (el.type === 'room') {
    return (
      <div
        onClick={() => handleElementClick(el)}
        onMouseDown={(e) => handleMouseDownItem(e, el)}
        style={{
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          transform: `rotate(${el.rotation}deg)`,
          backgroundColor: el.bgColor,
          borderColor: el.borderColor,
        }}
        className={cn(
          "absolute rounded-[6px] border-2 flex flex-col items-center justify-center p-2 text-center transition-shadow cursor-pointer select-none",
          isSelected && "ring-2 ring-amber-500 ring-offset-2 shadow-xs",
          mode === 'edit' && "cursor-move"
        )}
      >
        <span className="text-xs font-bold" style={{ color: el.color }}>
          {el.name}
        </span>
        <span
          className="text-[10px] font-mono tabular-nums opacity-85 mt-1"
          style={{ color: el.color }}
        >
          {totalStock} SP tồn
        </span>
        {renderFloatingToolbar()}
      </div>
    );
  }

  // 2. RACK (Dãy kệ hàng hóa)
  if (el.type === 'rack') {
    const slots = el.slots || 5;

    return (
      <div
        onClick={() => handleElementClick(el)}
        onMouseDown={(e) => handleMouseDownItem(e, el)}
        style={{
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          transform: `rotate(${el.rotation}deg)`,
        }}
        className={cn(
          "absolute flex flex-col justify-between p-1 rounded-[4px] border border-border bg-card shadow-2xs transition-all cursor-pointer select-none",
          isSelected
            ? "ring-2 ring-amber-500 ring-offset-1 border-amber-500 bg-amber-500/10"
            : el.hasStock
              ? "border-blue-500/80 bg-blue-500/5 hover:border-blue-500"
              : "hover:border-foreground/40",
          mode === 'edit' && "cursor-move"
        )}
        title={`${el.name} (${el.hasStock ? 'Còn tồn' : 'Trống'})`}
      >
        {/* Slots representation */}
        {Array.from({ length: slots }).map((_, slotIdx) => (
          <div
            key={slotIdx}
            className={cn(
              "w-full h-7 rounded-[2px] border border-border flex items-center justify-center text-[9px] font-mono",
              el.hasStock
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold border-blue-400/40"
                : "bg-background text-muted-foreground/40"
            )}
          >
            {slotIdx + 1}
          </div>
        ))}

        {renderFloatingToolbar()}
      </div>
    );
  }

  // 3. EQUIPMENT (Xe nâng / Xe đẩy)
  if (el.type === 'equipment') {
    return (
      <div
        onClick={() => handleElementClick(el)}
        onMouseDown={(e) => handleMouseDownItem(e, el)}
        style={{
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          transform: `rotate(${el.rotation}deg)`,
        }}
        className={cn(
          "absolute rounded-[4px] flex items-center justify-center transition-all cursor-pointer select-none",
          isSelected && "ring-2 ring-amber-500 ring-offset-1",
          mode === 'edit' && "cursor-move"
        )}
        title={el.name}
      >
        {el.subType === 'forklift' && (
          <div className="w-full h-full bg-blue-600 text-white rounded-[4px] flex flex-col items-center justify-center p-1 shadow-xs border border-blue-700">
            <Truck className="size-4" />
            <span className="text-[7px] font-mono leading-none mt-0.5">FORK</span>
          </div>
        )}
        {el.subType === 'trolley' && (
          <div className="w-full h-full bg-indigo-500/20 text-indigo-600 rounded-[4px] flex flex-col items-center justify-center p-0.5 border border-indigo-400">
            <Move className="size-3.5" />
          </div>
        )}
        {el.subType === 'safety' && (
          <div className="w-full h-full bg-rose-500/20 text-rose-600 rounded-[4px] flex flex-col items-center justify-center p-0.5 border border-rose-400">
            <ShieldAlert className="size-4 text-rose-600" />
          </div>
        )}

        {renderFloatingToolbar()}
      </div>
    );
  }

  // 4. PALLET STAGING PADS
  if (el.type === 'pallet') {
    return (
      <div
        onClick={() => handleElementClick(el)}
        onMouseDown={(e) => handleMouseDownItem(e, el)}
        style={{
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          transform: `rotate(${el.rotation}deg)`,
        }}
        className={cn(
          "absolute rounded-[2px] border border-border bg-muted/60 flex items-center justify-center text-muted-foreground font-mono text-[11px] cursor-pointer select-none",
          isSelected && "ring-2 ring-amber-500 ring-offset-1 border-amber-500",
          mode === 'edit' && "cursor-move"
        )}
        title={el.name}
      >
        ▦
        {renderFloatingToolbar()}
      </div>
    );
  }

  // 5. DOOR / OPENINGS ON BOUNDARY WALL
  if (el.type === 'door') {
    return (
      <div
        onClick={() => handleElementClick(el)}
        onMouseDown={(e) => handleMouseDownItem(e, el)}
        style={{
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          transform: `rotate(${el.rotation}deg)`,
        }}
        className={cn(
          "absolute bg-background border-2 border-primary rounded-[2px] flex items-center justify-center text-[8px] font-bold text-primary cursor-pointer shadow-xs select-none",
          isSelected && "ring-2 ring-amber-500 ring-offset-1",
          mode === 'edit' && "cursor-move"
        )}
        title={el.name}
      >
        DOOR
        {renderFloatingToolbar()}
      </div>
    );
  }

  return null;
}
