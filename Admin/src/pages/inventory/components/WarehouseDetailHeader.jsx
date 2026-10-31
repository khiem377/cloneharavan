import React from 'react';
import {
  Warehouse as WarehouseIcon,
  Save,
  Trash2,
  Star,
  Loader2,
  Package,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function WarehouseDetailHeader({
  isCreatingNew,
  form,
  selectedWarehouseId,
  warehouses,
  activeTab,
  setActiveTab,
  stockTotal,
  saving,
  onSetDefault,
  onDelete,
}) {
  return (
    <div className="px-5 py-3.5 border-b border-border bg-muted/10 rounded-t-[6px] flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <WarehouseIcon className="size-4 text-primary" />
          {isCreatingNew
            ? 'Tạo kho hàng mới'
            : `Cấu hình kho: ${form.name || 'Chi tiết'}`}
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {isCreatingNew
            ? 'Nhập đầy đủ thông tin định danh và địa chỉ để khởi tạo kho'
            : 'Cập nhật thông tin định danh và địa chỉ bưu chính kho hàng'}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {!isCreatingNew && selectedWarehouseId && (
          <div className="flex items-center rounded-[6px] border border-border p-0.5 bg-muted/40 text-xs font-semibold mr-1">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={cn(
                'px-2.5 py-1 rounded-[4px] transition-colors',
                activeTab === 'settings'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Thông tin kho
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={cn(
                'px-2.5 py-1 rounded-[4px] transition-colors flex items-center gap-1',
                activeTab === 'stock'
                  ? 'bg-background text-foreground shadow-xs font-bold text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Package size={12} />
              Tồn kho ({Number(stockTotal ?? warehouses.find((w) => w._id === selectedWarehouseId)?.totalSKUs ?? 0)})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={cn(
                'px-2.5 py-1 rounded-[4px] transition-colors flex items-center gap-1',
                activeTab === 'staff'
                  ? 'bg-background text-foreground shadow-xs font-bold text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Users size={12} />
              Nhân viên ({form.assignedStaffIds?.length || 0})
            </button>
          </div>
        )}

        {!isCreatingNew && !form.isDefault && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(selectedWarehouseId)}
            title="Đặt làm kho mặc định"
          >
            <Star size={13} />
            <span className="hidden sm:inline">Đặt mặc định</span>
          </Button>
        )}

        {!isCreatingNew && !form.isDefault && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(selectedWarehouseId)}
            title="Xóa kho hàng"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Xóa kho</span>
          </Button>
        )}

        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={saving}
        >
          {saving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
          <span>Lưu kho</span>
        </Button>
      </div>
    </div>
  );
}
