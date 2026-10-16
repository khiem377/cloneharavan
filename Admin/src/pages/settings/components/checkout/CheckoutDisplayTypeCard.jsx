import React from 'react';
import { User, Truck, CreditCard } from 'lucide-react';

export default function CheckoutDisplayTypeCard({ layoutType, onChange }) {
  return (
    <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-5 shadow-xs space-y-4">
      <h3 className="text-[14px] font-bold text-[#212b36] dark:text-foreground">Kiểu hiển thị trang thanh toán</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Thanh toán 1 bước */}
        <div
          onClick={() => onChange('one_step')}
          className={`border rounded-[6px] p-4 cursor-pointer transition-all ${
            layoutType === 'one_step'
              ? 'border-[#0088ff] bg-[#f4f8fd] dark:bg-[#0088ff]/10 ring-1 ring-[#0088ff]'
              : 'border-[#dfe3e8] dark:border-border hover:border-[#c4cdd5] dark:hover:border-border/80 bg-white dark:bg-card'
          }`}
        >
          <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-[#212b36] dark:text-foreground mb-3">
            <input
              type="radio"
              name="layoutType"
              value="one_step"
              checked={layoutType === 'one_step'}
              onChange={() => onChange('one_step')}
              className="text-[#0088ff] focus:ring-0"
            />
            <span>Thanh toán 1 bước</span>
          </label>

          {/* Sapo Illustration 1 bước */}
          <div className="h-28 flex items-center justify-center">
            <div className="w-44 h-24 bg-white dark:bg-muted/30 border border-[#dfe3e8] dark:border-border rounded-[4px] p-3 flex items-center gap-3 shadow-xs">
              <div className="space-y-2.5">
                <div className="w-4 h-4 rounded-full bg-[#0088ff] flex items-center justify-center text-[9px] text-white font-bold">
                  ✓
                </div>
                <div className="w-4 h-4 rounded-full bg-[#0088ff] flex items-center justify-center text-[9px] text-white font-bold">
                  ✓
                </div>
                <div className="w-4 h-4 rounded-full bg-[#0088ff] flex items-center justify-center text-[9px] text-white font-bold">
                  ✓
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                <div className="h-2 bg-[#dfe3e8] dark:bg-muted-foreground/30 rounded-[2px] w-full" />
                <div className="h-2 bg-[#dfe3e8] dark:bg-muted-foreground/30 rounded-[2px] w-4/5" />
                <div className="h-2 bg-[#dfe3e8] dark:bg-muted-foreground/30 rounded-[2px] w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Thanh toán 3 bước */}
        <div
          onClick={() => onChange('three_step')}
          className={`border rounded-[6px] p-4 cursor-pointer transition-all ${
            layoutType === 'three_step'
              ? 'border-[#0088ff] bg-[#f4f8fd] dark:bg-[#0088ff]/10 ring-1 ring-[#0088ff]'
              : 'border-[#dfe3e8] dark:border-border hover:border-[#c4cdd5] dark:hover:border-border/80 bg-white dark:bg-card'
          }`}
        >
          <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-[#212b36] dark:text-foreground mb-3">
            <input
              type="radio"
              name="layoutType"
              value="three_step"
              checked={layoutType === 'three_step'}
              onChange={() => onChange('three_step')}
              className="text-[#0088ff] focus:ring-0"
            />
            <span>Thanh toán 3 bước</span>
          </label>

          {/* Sapo Illustration 3 bước chuẩn vector và dấu nối */}
          <div className="h-28 flex items-center justify-center gap-1.5">
            {/* Bước 1: Thông tin khách hàng */}
            <div className="w-[50px] h-24 bg-white dark:bg-muted/30 border border-[#dfe3e8] dark:border-border rounded-[4px] p-1.5 flex flex-col items-center justify-between shadow-xs">
              <div className="w-6 h-6 rounded-full bg-[#0088ff] ring-2 ring-[#e0f0ff] dark:ring-blue-900/50 flex items-center justify-center text-white mt-1">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="w-full space-y-1.5 mb-1">
                <div className="h-1.5 bg-[#dfe3e8] dark:bg-muted-foreground/30 rounded-[1px] w-full" />
                <div className="h-1.5 bg-[#dfe3e8] dark:bg-muted-foreground/30 rounded-[1px] w-3/4" />
              </div>
            </div>

            {/* Dấu nối bước 1 -> 2 */}
            <div className="flex gap-0.5 text-[#c4cdd5] dark:text-muted-foreground text-[10px] font-bold select-none">
              <span>-</span>
              <span>-</span>
            </div>

            {/* Bước 2: Vận chuyển */}
            <div className="w-[50px] h-24 bg-white dark:bg-muted/30 border border-[#dfe3e8] dark:border-border rounded-[4px] p-1.5 flex flex-col items-center justify-between shadow-xs">
              <div className="w-6 h-6 rounded-full bg-[#0088ff] ring-2 ring-[#e0f0ff] dark:ring-blue-900/50 flex items-center justify-center text-white mt-1">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div className="w-full space-y-1.5 mb-1">
                <div className="h-1.5 bg-[#dfe3e8] dark:bg-muted-foreground/30 rounded-[1px] w-full" />
                <div className="h-1.5 bg-[#dfe3e8] dark:bg-muted-foreground/30 rounded-[1px] w-3/4" />
              </div>
            </div>

            {/* Dấu nối bước 2 -> 3 */}
            <div className="flex gap-0.5 text-[#c4cdd5] dark:text-muted-foreground text-[10px] font-bold select-none">
              <span>-</span>
              <span>-</span>
            </div>

            {/* Bước 3: Thanh toán */}
            <div className="w-[50px] h-24 bg-white dark:bg-muted/30 border border-[#dfe3e8] dark:border-border rounded-[4px] p-1.5 flex flex-col items-center justify-between shadow-xs">
              <div className="w-6 h-6 rounded-full bg-[#0088ff] ring-2 ring-[#e0f0ff] dark:ring-blue-900/50 flex items-center justify-center text-white mt-1">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="w-full space-y-1.5 mb-1">
                <div className="h-1.5 bg-[#dfe3e8] dark:bg-muted-foreground/30 rounded-[1px] w-full" />
                <div className="h-1.5 bg-[#dfe3e8] dark:bg-muted-foreground/30 rounded-[1px] w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
