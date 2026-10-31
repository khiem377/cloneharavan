import React from 'react';
import { RefreshCw, Plus } from '@/components/ui/Icons';
import { Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Can from '@/components/auth/Can';

export default function ProductHeader({
  total = 0,
  isLoading,
  onRefresh,
  onOpenBarcodeModal,
  onNavigateNew,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Sản phẩm</h1>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono tabular-nums">
          {total} sản phẩm
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="rounded-[6px] text-xs font-semibold h-8"
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={14} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenBarcodeModal}
          className="rounded-[6px] text-xs font-semibold h-8"
          title="In tem mã vạch cho các sản phẩm"
        >
          <Barcode size={15} className="mr-1.5 text-primary" />
          In tem mã vạch
        </Button>

        <Can do="product.create">
          <Button
            size="sm"
            className="rounded-[6px] text-xs font-semibold h-8 active:scale-[0.98] transition-transform"
            onClick={onNavigateNew}
          >
            <Plus size={15} className="mr-1.5" /> Thêm sản phẩm
          </Button>
        </Can>
      </div>
    </div>
  );
}
