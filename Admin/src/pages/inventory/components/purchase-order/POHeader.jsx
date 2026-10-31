import React from 'react';
import { FileCheck, Plus, Building2 } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';

export default function POHeader({ navigate }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" />
            Đơn Mua Hàng & Nhập Kho (Inbound Management)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý Đơn Mua Hàng với Nhà Cung Cấp và các đợt Phiếu Nhập Kho thực tế
          </p>
        </div>
        <Button
          onClick={() => navigate('/purchase-orders/create')}
          className="rounded-[6px] text-xs font-semibold shadow-xs active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tạo Đơn Mua Hàng Mới (PO)
        </Button>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Button
          size="sm"
          onClick={() => navigate('/purchase-orders')}
          className="rounded-[6px] text-xs font-bold shadow-xs active:scale-[0.98]"
        >
          <Building2 className="h-4 w-4 mr-1.5" /> Đơn Mua Hàng (PO)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/stock-receivings')}
          className="rounded-[6px] text-xs font-semibold text-muted-foreground hover:bg-muted"
        >
          <FileCheck className="h-4 w-4 mr-1.5" /> Phiếu Nhập Kho (PNK)
        </Button>
      </div>
    </div>
  );
}
