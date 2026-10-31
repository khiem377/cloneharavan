import React from 'react';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SUPPLIER_TYPES = [
  'Sản phẩm / Nguyên vật liệu',
  'Sản phẩm',
  'Nguyên phụ liệu',
];

export default function SupplierGeneralInfoSection({
  code,
  setCode,
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  supplierType,
  setSupplierType,
  taxCode,
  setTaxCode,
  image,
  setImage,
  isUploadingImage,
  handleImageUpload,
  description,
  setDescription,
}) {
  return (
    <div className="lg:col-span-6 space-y-4">
      <div className="flex items-center gap-2 pb-1.5 border-b border-border/60">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
          1. Thông tin chung
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Mã NCC <span className="text-muted-foreground font-normal">(tự sinh nếu để trống)</span>
          </label>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="NCC-0001"
            className="rounded-[6px] h-9 text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Tên nhà cung cấp <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Công ty TNHH Phân Phối ABC..."
            className="rounded-[6px] h-9 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Số điện thoại
          </label>
          <Input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0987xxxxxx"
            className="rounded-[6px] h-9 text-xs font-mono tabular-nums"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Email liên hệ
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="supplier@company.com"
            className="rounded-[6px] h-9 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Loại nhà cung cấp
          </label>
          <select
            value={supplierType}
            onChange={(e) => setSupplierType(e.target.value)}
            className="w-full h-9 px-2.5 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer"
          >
            {SUPPLIER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Mã số thuế
          </label>
          <Input
            type="text"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            placeholder="0101xxxxxx"
            className="rounded-[6px] h-9 text-xs font-mono tabular-nums"
          />
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <label className="block text-xs font-semibold text-muted-foreground">
          Logo / Ảnh đại diện
        </label>
        <div className="flex items-start gap-4 p-3 bg-muted/20 rounded-[6px] border border-border">
          <div className="relative size-16 rounded-[6px] bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
            {image ? (
              <>
                <img src={image} alt="Logo" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="size-4" />
                </button>
              </>
            ) : isUploadingImage ? (
              <Loader2 className="size-5 animate-spin text-primary" />
            ) : (
              <Upload className="size-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Dán đường dẫn ảnh logo hoặc tải file..."
              className="rounded-[6px] h-9 text-xs bg-background"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Hỗ trợ JPG, PNG, WebP (Tối đa 2MB). Lưu vào thư viện Media.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">
          Ghi chú / Mô tả
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Thông tin thêm về chính sách chiết khấu, thời gian giao hàng, người phụ trách..."
          className="w-full px-3 py-2 text-xs rounded-[6px] border border-input bg-background focus:outline-hidden focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
