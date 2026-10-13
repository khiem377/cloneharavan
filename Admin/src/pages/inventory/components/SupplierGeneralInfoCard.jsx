import React from 'react';
import { Building2, Phone, Mail, CreditCard, Tag, Edit3, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SupplierGeneralInfoCard({ supplier, onEditBasic }) {
  if (!supplier) return null;

  const bInfo = supplier.bankInfo || {};
  const isActive = supplier.isActive !== false && supplier.status !== 'inactive';

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Trạng thái hoạt động */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <span className="text-muted-foreground font-medium">Trạng thái</span>
        <Badge
          className={`rounded-[4px] text-[11px] font-semibold flex items-center gap-1.5 ${
            isActive
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          <span className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
          {isActive ? 'Đang hoạt động' : 'Tạm dừng'}
        </Badge>
      </div>

      {/* Card Thông tin cơ bản */}
      <div className="rounded-[6px] border border-border p-3.5 bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground flex items-center gap-1.5">
            <Building2 size={14} className="text-primary" /> Thông tin đối tác
          </h3>
          {onEditBasic && (
            <button
              onClick={() => onEditBasic(supplier)}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <Edit3 size={11} /> Sửa
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Mã NCC:</span>
            <span className="font-mono font-bold text-primary px-1.5 py-0.5 rounded-[4px] bg-primary/10">
              {supplier.code}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tên NCC:</span>
            <span className="font-bold text-foreground text-right truncate max-w-[180px]">
              {supplier.name}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Số điện thoại:</span>
            <span className="font-mono text-foreground">{supplier.phone || 'Chưa có'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Loại NCC:</span>
            <span className="text-foreground">{supplier.supplierType || 'Sản phẩm'}</span>
          </div>

          {supplier.address && (
            <div className="pt-1.5 border-t border-border">
              <span className="text-muted-foreground block mb-0.5">Địa chỉ:</span>
              <p className="text-foreground text-[11px] leading-relaxed">{supplier.address}</p>
            </div>
          )}

          {supplier.description && (
            <div className="pt-1.5 border-t border-border">
              <span className="text-muted-foreground block mb-0.5">Mô tả:</span>
              <p className="text-foreground text-[11px] leading-relaxed line-clamp-2">
                {supplier.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card Thông tin thanh toán / Ngân hàng */}
      <div className="rounded-[6px] border border-border p-3.5 bg-muted/20 space-y-2.5">
        <h3 className="font-bold text-foreground flex items-center gap-1.5">
          <CreditCard size={14} className="text-primary" /> Thông tin thanh toán
        </h3>

        {bInfo.bankName || bInfo.accountNumber ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ngân hàng:</span>
              <span className="font-semibold text-foreground">{bInfo.bankName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Số tài khoản:</span>
              <span className="font-mono font-bold text-foreground">{bInfo.accountNumber}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Chủ tài khoản:</span>
              <span className="font-mono uppercase text-foreground">{bInfo.accountHolder || '-'}</span>
            </div>

            {bInfo.branch && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Chi nhánh:</span>
                <span className="text-muted-foreground">{bInfo.branch}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground italic text-[11px]">
            Chưa cập nhật tài khoản ngân hàng
          </p>
        )}
      </div>
    </div>
  );
}
