'use client';

import React from 'react';
import {
  X,
  MapPin,
  Truck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { SearchableSelect } from '../ui/searchable-select';

export default function AddressModal({
  isOpen,
  onClose,
  editingAddressId,
  addressForm,
  setAddressForm,
  provinces,
  districts,
  wards,
  loadingProvinces,
  loadingDistricts,
  loadingWards,
  handleProvinceSelect,
  handleDistrictSelect,
  handleWardSelect,
  handleSaveAddress,
  addressSaving,
  postMergerInfo,
  mergerLoading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fadeIn">
      <Card className="max-w-lg w-full shadow-lg overflow-hidden animate-scaleUp p-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900">
              {editingAddressId ? 'Cập nhật địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
            </h3>
            <p className="text-[11px] text-slate-400">
              Tích hợp chuẩn địa giới hành chính Giao Hàng Nhanh (GHN)
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 h-7 w-7 rounded-[6px]"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveAddress} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="recipientName">
                Họ và tên người nhận <span className="text-[#e30019]">*</span>
              </Label>
              <Input
                id="recipientName"
                type="text"
                required
                value={addressForm.fullName}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, fullName: e.target.value })
                }
                placeholder="Ví dụ: Nguyễn Văn A"
                className="h-9 text-xs rounded-[6px] focus-visible:ring-[#e30019] focus-visible:border-[#e30019]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recipientPhone">
                Số điện thoại người nhận <span className="text-[#e30019]">*</span>
              </Label>
              <Input
                id="recipientPhone"
                type="tel"
                required
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, phone: e.target.value })
                }
                placeholder="0919615474"
                className="h-9 text-xs font-mono rounded-[6px] focus-visible:ring-[#e30019] focus-visible:border-[#e30019]"
              />
            </div>
          </div>

          {/* Row 2: Cascading Selects via GHN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>
                Tỉnh / Thành phố <span className="text-[#e30019]">*</span>
              </Label>
              <SearchableSelect
                options={provinces.map((p) => ({
                  value: p.ProvinceID,
                  label: p.ProvinceName,
                  ProvinceName: p.ProvinceName,
                }))}
                value={addressForm.provinceId}
                onChange={handleProvinceSelect}
                placeholder="Chọn Tỉnh/Thành"
                searchPlaceholder="Tìm tỉnh/thành..."
                disabled={loadingProvinces}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Quận / Huyện <span className="text-[#e30019]">*</span>
              </Label>
              <SearchableSelect
                options={districts.map((d) => ({
                  value: d.DistrictID,
                  label: d.DistrictName,
                  DistrictName: d.DistrictName,
                }))}
                value={addressForm.districtId}
                onChange={handleDistrictSelect}
                placeholder="Chọn Quận/Huyện"
                searchPlaceholder="Tìm quận/huyện..."
                disabled={!addressForm.provinceId || loadingDistricts}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Phường / Xã <span className="text-[#e30019]">*</span>
              </Label>
              <SearchableSelect
                options={wards.map((w) => ({
                  value: w.WardCode,
                  label: w.WardName,
                  WardName: w.WardName,
                }))}
                value={addressForm.wardCode}
                onChange={handleWardSelect}
                placeholder="Chọn Phường/Xã"
                searchPlaceholder="Tìm phường/xã..."
                disabled={!addressForm.districtId || loadingWards}
              />
            </div>
          </div>

          {/* Row 3: Detail Street Address */}
          <div className="space-y-1.5">
            <Label htmlFor="detailAddress">
              Địa chỉ cụ thể (Số nhà, tên đường...) <span className="text-[#e30019]">*</span>
            </Label>
            <Input
              id="detailAddress"
              type="text"
              required
              value={addressForm.detailAddress}
              onChange={(e) =>
                setAddressForm({ ...addressForm, detailAddress: e.target.value })
              }
              placeholder="Ví dụ: Số 123 đường Lê Lợi, Khóm 1"
              className="h-9 text-xs rounded-[6px] focus-visible:ring-[#e30019] focus-visible:border-[#e30019]"
            />
          </div>

          {/* Real-time Address Preview Card */}
          {addressForm.province && addressForm.district && addressForm.ward && (
            <Card className="p-3.5 bg-slate-50/80 border-slate-200 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      postMergerInfo?.isNameChanged ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span>
                    {postMergerInfo?.isNameChanged
                      ? 'Đơn vị hành chính sau sáp nhập'
                      : 'Địa chỉ nhận hàng chuẩn hóa'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {mergerLoading ? (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-[4px] flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin text-[#e30019]" />
                      <span>Đang tra cứu GHN v3...</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 border-emerald-200">
                      {postMergerInfo?.source || 'Giao Hàng Nhanh (GHN)'}
                    </Badge>
                  )}
                  {addressForm.wardCode && (
                    <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5 rounded-[4px]">
                      Mã GHN: {addressForm.wardCode}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Địa chỉ hành chính hiện tại (GHN cũ) */}
              <div className="text-xs text-slate-600 flex items-start gap-2">
                <span className="font-semibold text-slate-500 shrink-0 w-28 text-[11px]">
                  Hành chính (GHN/Cũ):
                </span>
                <span className="text-slate-800 font-medium">
                  {addressForm.detailAddress ? `${addressForm.detailAddress}, ` : ''}
                  {addressForm.ward}, {addressForm.district}, {addressForm.province}
                </span>
              </div>

              {/* Sau sáp nhập (chỉ hiển thị khi có chuyển đổi hoặc theo GHN v3) */}
              <div className="text-xs flex items-start gap-2 pt-2 border-t border-slate-200/80">
                <span className="font-semibold text-emerald-700 shrink-0 w-28 text-[11px]">
                  Sau sáp nhập:
                </span>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded-[4px] border border-emerald-100 inline-block">
                    {postMergerInfo?.postMergerFullAddress ||
                      `${addressForm.detailAddress ? `${addressForm.detailAddress}, ` : ''}${addressForm.ward}, ${addressForm.province}`}
                  </span>
                  {postMergerInfo?.isNameChanged && postMergerInfo?.changeDescription && (
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <Truck size={12} className="text-emerald-600 shrink-0" />
                      <span>{postMergerInfo.changeDescription}</span>
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Default address checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, isDefault: e.target.checked })
                }
                className="rounded-[4px] text-[#e30019] focus:ring-[#e30019]"
              />
              <span className="text-xs text-slate-700 font-medium">
                Đặt làm địa chỉ nhận hàng mặc định
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-[6px] h-9 px-4 active:scale-[0.98]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={addressSaving}
              size="sm"
              className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs rounded-[6px] h-9 px-5 shadow-xs active:scale-[0.98] disabled:opacity-50"
            >
              {addressSaving ? 'Đang lưu...' : editingAddressId ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
