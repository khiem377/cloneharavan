'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Bookmark, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SearchableSelect from '@/components/ui/searchable-select';
import { getAdministrativeMergerInfo } from '@/utils/vietnamAddressMerger';
import shippingService from '@/services/shipping.service';
import CheckoutDualAddressCard from './CheckoutDualAddressCard';

export default function CheckoutAddressSection({
  addresses = [],
  selectedAddressId,
  onSelectAddressId,
  isCustomAddress,
  setIsCustomAddress,
  customAddress,
  onCustomAddressChange,
  provinces = [],
  districts = [],
  wards = [],
  newWards = [],
  loadingProvinces = false,
  loadingDistricts = false,
  loadingWards = false,
  loadingNewWards = false,
  onProvinceSelect,
  onDistrictSelect,
  onWardSelect,
  saveToAddressBook,
  setSaveToAddressBook,
  isAuthenticated = false,
  fieldMatrix = {},
  useTwoLevelAddress = false,
  allowDifferentShippingAddress = true,
  differentRecipient = false,
  onDifferentRecipientChange,
  recipientInfo = {},
  onRecipientInfoChange,
}) {
  const [mergerData, setMergerData] = useState(null);
  const [loadingMerger, setLoadingMerger] = useState(false);

  const hasSavedAddresses = isAuthenticated && addresses.length > 0;

  const phoneState = fieldMatrix?.phone || 'required';
  const showPhone = phoneState !== 'hidden';
  const phoneRequired = phoneState === 'required';

  const emailState = fieldMatrix?.email || 'required';
  const showEmail = emailState !== 'hidden';
  const emailRequired = emailState === 'required';

  const addressState = fieldMatrix?.address || 'required';
  const showAddress = addressState !== 'hidden';
  const addressRequired = addressState === 'required';

  const districtState = fieldMatrix?.district || 'required';
  const showDistrict = districtState !== 'hidden';
  const districtRequired = districtState === 'required';

  const wardState = fieldMatrix?.ward || 'required';
  const showWard = wardState !== 'hidden';
  const wardRequired = wardState === 'required';

  // Tự động đối soát địa chỉ hành chính mới sau sáp nhập
  useEffect(() => {
    if (!useTwoLevelAddress || !customAddress.province || !customAddress.ward) {
      setMergerData(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingMerger(true);
        const data = await shippingService.getPostMergerAddress({
          province: customAddress.province,
          district: customAddress.district,
          ward: customAddress.ward,
          detailAddress: customAddress.detailAddress,
          provinceId: customAddress.provinceId,
          districtId: customAddress.districtId,
          wardCode: customAddress.wardCode,
        });
        setMergerData(data || getAdministrativeMergerInfo(customAddress));
      } catch {
        setMergerData(getAdministrativeMergerInfo(customAddress));
      } finally {
        setLoadingMerger(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [
    useTwoLevelAddress,
    customAddress.province,
    customAddress.district,
    customAddress.ward,
    customAddress.detailAddress,
    customAddress.provinceId,
    customAddress.districtId,
    customAddress.wardCode,
  ]);

  // Danh sách options Phường/Xã cho chế độ 2 cấp (ưu tiên newWards từ GHN v3)
  const twoLevelWardOptions = (newWards.length > 0 ? newWards : wards).map((w) => ({
    value: w.WardCode,
    label: w.WardName ? (w.DistrictName ? `${w.WardName} (${w.DistrictName})` : w.WardName) : '',
    raw: w,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 space-y-4">
      {/* Header Địa chỉ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[6px] bg-slate-100 flex items-center justify-center text-slate-800">
            <MapPin size={15} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Địa chỉ nhận hàng
            </h3>
            {useTwoLevelAddress && (
              <span className="text-[11px] font-medium text-[#0088ff] bg-blue-50 px-1.5 py-0.5 rounded-[3px]">
                Áp dụng quy chuẩn địa chỉ 2 cấp hành chính mới
              </span>
            )}
          </div>
        </div>

        {hasSavedAddresses && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomAddress(!isCustomAddress)}
              className="text-xs text-[#0088ff] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              {isCustomAddress ? (
                <>
                  <Bookmark size={13} />
                  <span>Dùng địa chỉ đã lưu</span>
                </>
              ) : (
                <>
                  <Plus size={13} />
                  <span>Giao tới địa chỉ khác</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!isCustomAddress && hasSavedAddresses ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr._id;
            return (
              <div
                key={addr._id}
                onClick={() => onSelectAddressId(addr._id)}
                className={`p-3.5 rounded-[6px] border text-xs cursor-pointer transition-all relative ${
                  isSelected
                    ? 'border-[#0088ff] bg-blue-50/20 ring-1 ring-[#0088ff]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 truncate">{addr.fullName}</span>
                  {addr.isDefault && (
                    <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 bg-slate-100 text-slate-700">
                      Mặc định
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 font-mono text-[11px] mb-1">{addr.phone}</p>
                <p className="text-slate-700 line-clamp-2 leading-relaxed">
                  {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                </p>
                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-[#0088ff] font-semibold">
                    <CheckCircle2 size={13} />
                    <span>Đang giao tới địa chỉ này</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên người nhận <span className="text-red-500">*</span>
              </label>
              <Input
                value={customAddress.fullName}
                onChange={(e) => onCustomAddressChange('fullName', e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="h-9 text-xs rounded-[6px]"
              />
            </div>
            {showPhone && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại {phoneRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Tùy chọn)</span>}
                </label>
                <Input
                  value={customAddress.phone}
                  onChange={(e) => onCustomAddressChange('phone', e.target.value)}
                  placeholder="Ví dụ: 0901234567"
                  className="h-9 text-xs rounded-[6px] font-mono"
                />
              </div>
            )}
          </div>

          {showEmail && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email nhận thông báo đơn hàng {emailRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Tùy chọn)</span>}
              </label>
              <Input
                type="email"
                value={customAddress.email || ''}
                onChange={(e) => onCustomAddressChange('email', e.target.value)}
                placeholder="khachhang@gmail.com"
                className="h-9 text-xs rounded-[6px]"
              />
            </div>
          )}

          {/* CHẾ ĐỘ 2 CẤP (TỈNH - PHƯỜNG/XÃ MỚI) HOẶC 3 CẤP (TỈNH - HUYỆN - XÃ) */}
          {useTwoLevelAddress ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tỉnh / Thành phố <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={provinces.map((p) => ({
                    value: p.ProvinceID,
                    label: p.ProvinceName,
                    raw: p,
                  }))}
                  value={customAddress.provinceId || ''}
                  onChange={(val, raw) => onProvinceSelect(val, raw)}
                  placeholder="Chọn Tỉnh/Thành"
                  searchPlaceholder="Tìm kiếm tỉnh thành..."
                  loading={loadingProvinces}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phường / Xã (Hành chính mới) {wardRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Tùy chọn)</span>}
                </label>
                <SearchableSelect
                  options={twoLevelWardOptions}
                  value={customAddress.wardCode || ''}
                  onChange={(val, raw) => onWardSelect(val, raw)}
                  placeholder="Chọn Phường/Xã mới"
                  searchPlaceholder="Tìm kiếm phường xã..."
                  disabled={!customAddress.provinceId || loadingNewWards}
                  loading={loadingNewWards}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tỉnh / Thành phố <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={provinces.map((p) => ({
                    value: p.ProvinceID,
                    label: p.ProvinceName,
                    raw: p,
                  }))}
                  value={customAddress.provinceId || ''}
                  onChange={(val, raw) => onProvinceSelect(val, raw)}
                  placeholder="Chọn Tỉnh/Thành"
                  searchPlaceholder="Tìm kiếm tỉnh thành..."
                  loading={loadingProvinces}
                />
              </div>

              {showDistrict && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quận / Huyện {districtRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Tùy chọn)</span>}
                  </label>
                  <SearchableSelect
                    options={districts.map((d) => ({
                      value: d.DistrictID,
                      label: d.DistrictName,
                      raw: d,
                    }))}
                    value={customAddress.districtId || ''}
                    onChange={(val, raw) => onDistrictSelect(val, raw)}
                    placeholder="Chọn Quận/Huyện"
                    searchPlaceholder="Tìm kiếm quận huyện..."
                    disabled={!customAddress.provinceId || loadingDistricts}
                    loading={loadingDistricts}
                  />
                </div>
              )}

              {showWard && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phường / Xã {wardRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Tùy chọn)</span>}
                  </label>
                  <SearchableSelect
                    options={wards.map((w) => ({
                      value: w.WardCode,
                      label: w.WardName,
                      raw: w,
                    }))}
                    value={customAddress.wardCode || ''}
                    onChange={(val, raw) => onWardSelect(val, raw)}
                    placeholder="Chọn Phường/Xã"
                    searchPlaceholder="Tìm kiếm phường xã..."
                    disabled={!customAddress.districtId || loadingWards}
                    loading={loadingWards}
                  />
                </div>
              )}
            </div>
          )}

          {showAddress && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ chi tiết (Số nhà, tên đường) {addressRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(Tùy chọn)</span>}
              </label>
              <Input
                value={customAddress.detailAddress}
                onChange={(e) => onCustomAddressChange('detailAddress', e.target.value)}
                placeholder="Ví dụ: 123 Lê Lợi, Khóm 1"
                className="h-9 text-xs rounded-[6px]"
              />
            </div>
          )}

          {/* DUAL ADDRESS PREVIEW: ĐỊA CHỈ HÀNH CHÍNH MỚI (2 CẤP) VÀ TRUYỀN THỐNG (3 CẤP) */}
          {useTwoLevelAddress && (
            <CheckoutDualAddressCard
              customAddress={customAddress}
              mergerData={mergerData}
              loadingMerger={loadingMerger}
            />
          )}

          {/* CHECKBOX GIAO HÀNG ĐẾN ĐỊA CHỈ KHÁC VỚI THÔNG TIN MUA HÀNG */}
          {allowDifferentShippingAddress && (
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={differentRecipient}
                  onChange={(e) => onDifferentRecipientChange && onDifferentRecipientChange(e.target.checked)}
                  className="rounded-[4px] border-slate-300 text-[#0088ff] focus:ring-[#0088ff]"
                />
                <span>Giao hàng đến người nhận hoặc địa chỉ khác với thông tin mua hàng</span>
              </label>

              {differentRecipient && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-[6px] animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ tên người nhận riêng <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={recipientInfo.fullName || ''}
                      onChange={(e) => onRecipientInfoChange && onRecipientInfoChange('fullName', e.target.value)}
                      placeholder="Người nhận thay..."
                      className="h-8 text-xs rounded-[4px] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại người nhận riêng <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={recipientInfo.phone || ''}
                      onChange={(e) => onRecipientInfoChange && onRecipientInfoChange('phone', e.target.value)}
                      placeholder="09..."
                      className="h-8 text-xs rounded-[4px] bg-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {isAuthenticated && (
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveToAddressBook}
                  onChange={(e) => setSaveToAddressBook(e.target.checked)}
                  className="rounded-[4px] border-slate-300 text-[#0088ff] focus:ring-[#0088ff]"
                />
                <span>Lưu địa chỉ này vào sổ địa chỉ cho lần mua sau</span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
