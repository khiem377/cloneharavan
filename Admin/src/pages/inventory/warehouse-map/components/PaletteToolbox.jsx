import React from 'react';
import {
  ThermometerSnowflake, Box, DoorOpen, Truck,
  Move, ShieldAlert, Info
} from 'lucide-react';

export default function PaletteToolbox({ elements, handleAddPaletteItem }) {
  return (
    <div className="flex flex-col h-[calc(100vh-210px)] overflow-y-auto p-4 space-y-5 text-xs">
      <div>
        <h3 className="text-xs font-bold text-foreground">Chọn Biểu Tượng</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Nhấn vào biểu tượng để thêm nhanh vào sơ đồ kho
        </p>
      </div>

      {/* Section 1: Khu vực lưu trữ */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Khu vực lưu trữ
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleAddPaletteItem('room', 'cold', 'Kho lạnh')}
            className="flex flex-col items-center justify-center p-3 rounded-[6px] border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors active:scale-[0.98] cursor-pointer text-center"
          >
            <ThermometerSnowflake className="size-5 text-amber-600 mb-1" />
            <span className="font-semibold text-foreground">Kho lạnh</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddPaletteItem('room', 'packing', 'Khu đóng gói')}
            className="flex flex-col items-center justify-center p-3 rounded-[6px] border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors active:scale-[0.98] cursor-pointer text-center"
          >
            <Box className="size-5 text-emerald-600 mb-1" />
            <span className="font-semibold text-foreground">Khu đóng gói</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddPaletteItem('room', 'office', 'Văn phòng')}
            className="flex flex-col items-center justify-center p-3 rounded-[6px] border border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 transition-colors active:scale-[0.98] cursor-pointer text-center"
          >
            <div className="size-5 rounded-[4px] border border-sky-600 flex items-center justify-center text-[10px] font-bold text-sky-600 mb-1">
              VP
            </div>
            <span className="font-semibold text-foreground">Văn phòng</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddPaletteItem('room', 'receiving', 'Khu nhận hàng')}
            className="flex flex-col items-center justify-center p-3 rounded-[6px] border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors active:scale-[0.98] cursor-pointer text-center"
          >
            <div className="size-5 rounded-[4px] border border-blue-600 flex items-center justify-center text-[10px] font-bold text-blue-600 mb-1">
              NH
            </div>
            <span className="font-semibold text-foreground">Nhận hàng</span>
          </button>
        </div>
      </div>

      {/* Section 2: Kệ hàng */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Kệ hàng (Racks)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              handleAddPaletteItem(
                'rack',
                'vertical',
                `Dãy Kệ ${elements.filter((e) => e.type === 'rack').length + 1}`
              )
            }
            className="flex flex-col items-center justify-center p-3 rounded-[6px] border border-border bg-card hover:bg-muted/50 transition-colors active:scale-[0.98] cursor-pointer text-center"
          >
            <div className="w-5 h-8 border-2 border-primary/70 rounded-[2px] flex flex-col justify-between py-1 px-0.5 mb-1 bg-primary/10">
              <div className="w-full h-0.5 bg-primary/70" />
              <div className="w-full h-0.5 bg-primary/70" />
            </div>
            <span className="font-semibold text-foreground">Kệ dọc 5 tầng</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddPaletteItem('pallet', 'pallet', 'Pallet đệm')}
            className="flex flex-col items-center justify-center p-3 rounded-[6px] border border-border bg-card hover:bg-muted/50 transition-colors active:scale-[0.98] cursor-pointer text-center"
          >
            <div className="size-6 border border-dashed border-border bg-muted/40 rounded-[2px] mb-1 flex items-center justify-center text-[10px] text-muted-foreground font-mono">
              ▦
            </div>
            <span className="font-semibold text-foreground">Pallet xếp hàng</span>
          </button>
        </div>
      </div>

      {/* Section 3: Cửa & Thiết bị */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Cửa & Thiết bị
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleAddPaletteItem('door', 'door', 'Cửa ra vào')}
            className="flex flex-col items-center justify-center p-3 rounded-[6px] border border-border bg-card hover:bg-muted/50 transition-colors active:scale-[0.98] cursor-pointer text-center"
          >
            <DoorOpen className="size-5 text-muted-foreground mb-1" />
            <span className="font-semibold text-foreground">Cửa ra vào</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddPaletteItem('equipment', 'forklift', 'Xe nâng điện')}
            className="flex flex-col items-center justify-center p-3 rounded-[6px] border border-border bg-card hover:bg-muted/50 transition-colors active:scale-[0.98] cursor-pointer text-center"
          >
            <Truck className="size-5 text-blue-600 mb-1" />
            <span className="font-semibold text-foreground">Xe nâng kho</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddPaletteItem('equipment', 'trolley', 'Xe kéo tay')}
            className="flex flex-col items-center justify-center p-3 rounded-[6px] border border-border bg-card hover:bg-muted/50 transition-colors active:scale-[0.98] cursor-pointer text-center"
          >
            <Move className="size-5 text-indigo-600 mb-1" />
            <span className="font-semibold text-foreground">Xe kéo tay</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddPaletteItem('equipment', 'safety', 'Bình PCCC')}
            className="flex flex-col items-center justify-center p-3 rounded-[6px] border border-border bg-card hover:bg-muted/50 transition-colors active:scale-[0.98] cursor-pointer text-center"
          >
            <ShieldAlert className="size-5 text-rose-500 mb-1" />
            <span className="font-semibold text-foreground">Bình PCCC</span>
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-[6px] border border-border bg-muted/20 p-3 space-y-1 text-[11px] text-muted-foreground">
        <div className="font-semibold text-foreground flex items-center gap-1">
          <Info className="size-3.5 text-primary" /> Hướng dẫn thao tác
        </div>
        <p>• Nhấp vào phần tử trong sơ đồ để kéo rê di chuyển vị trí.</p>
        <p>• Sử dụng thanh công cụ nổi để xoay 90° hoặc xóa phần tử.</p>
      </div>
    </div>
  );
}
