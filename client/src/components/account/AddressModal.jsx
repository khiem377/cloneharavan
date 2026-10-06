'use client';

import React from 'react';
import { X, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
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
}) {
  if (!isOpen) return null;

  const detailPrefix = addressForm.detailAddress ? `${addressForm.detailAddress.trim()}, ` : '';
  const currentAddress = `${detailPrefix}${addressForm.ward}, ${addressForm.district}, ${addressForm.province}`;
  const isMerged = Boolean(postMergerInfo?.isMerged);
  const newAddress = postMergerInfo?.postMergerFullAddress || (
    addressForm.province && addressForm.ward
      ? `${detailPrefix}${postMergerInfo?.newWard || addressForm.ward}, ${postMergerInfo?.province || addressForm.province}`
      : ''
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 animate-fadeIn">
      <Card className="max-w-2xl sm:max-w-3xl w-full shadow-xl overflow-hidden animate-scaleUp p-0 rounded-[6px] border border-slate-200/90 bg-white">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {editingAddressId ? 'Cập nhật địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Vui lòng nhập chính xác để đơn hàng được giao nhanh chóng và tận tay
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
        <form onSubmit={handleSaveAddress} className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="recipientName" className="text-xs font-semibold text-slate-700">
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
              <Label htmlFor="recipientPhone" className="text-xs font-semibold text-slate-700">
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
                placeholder="0949527013"
                className="h-9 text-xs font-mono rounded-[6px] focus-visible:ring-[#e30019] focus-visible:border-[#e30019]"
              />
            </div>
          </div>

          {/* Row 2: Cascading Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
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
              <Label className="text-xs font-semibold text-slate-700">
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
              <Label className="text-xs font-semibold text-slate-700">
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
            <Label htmlFor="detailAddress" className="text-xs font-semibold text-slate-700">
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

          {/* User-friendly Address Preview */}
          {addressForm.province && addressForm.ward && (
            <Card className="p-3.5 bg-slate-50/90 border-slate-200/90 space-y-2.5 animate-fadeIn rounded-[6px]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <MapPin size={14} className="text-[#e30019] shrink-0" />
                <span>Xem trước địa chỉ nhận hàng:</span>
              </div>

              {isMerged ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 font-medium shrink-0 w-28 text-[11px]">
                      Địa chỉ hiện tại:
                    </span>
                    <span className="text-slate-800 font-medium leading-relaxed">
                      {currentAddress}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 pt-1.5 border-t border-slate-200/70">
                    <span className="text-emerald-700 font-semibold shrink-0 w-28 text-[11px]">
                      Địa chỉ mới (sau sáp nhập):
                    </span>
                    <div className="flex-1 space-y-1">
                      <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200 inline-block leading-relaxed">
                        {newAddress}
                      </span>
                      {/* <p className="text-[11px] text-emerald-600 font-normal flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                        <span>Hệ thống tự động đồng bộ theo địa giới mới để giao hàng chính xác.</span>
                      </p> */}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs flex items-start gap-2">
                  <span className="text-slate-500 font-medium shrink-0 w-28 text-[11px]">
                    Địa chỉ đầy đủ:
                  </span>
                  <span className="text-slate-900 font-semibold leading-relaxed">
                    {currentAddress}
                  </span>
                </div>
              )}
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
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
              className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 px-5 shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {addressSaving ? 'Đang lưu...' : editingAddressId ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
