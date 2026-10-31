'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';

export default function AddressFormFields({
  addressForm,
  setAddressForm,
  provinces = [],
  districts = [],
  wards = [],
  loadingProvinces = false,
  loadingDistricts = false,
  loadingWards = false,
  handleProvinceSelect,
  handleDistrictSelect,
  handleWardSelect,
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="recipientName"
            className="text-xs font-semibold text-slate-700"
          >
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
            className="h-9 text-xs rounded-[6px] border-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="recipientPhone"
            className="text-xs font-semibold text-slate-700"
          >
            Số điện thoại người nhận <span className="text-[#e30019]">*</span>
          </Label>
          <Input
            id="recipientPhone"
            type="tel"
            required
            maxLength={10}
            value={addressForm.phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              setAddressForm({ ...addressForm, phone: val });
            }}
            placeholder="0949527013 (10 số)"
            className="h-9 text-xs font-mono rounded-[6px] border-slate-200"
          />
        </div>
      </div>

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

      <div className="space-y-1.5">
        <Label
          htmlFor="detailAddress"
          className="text-xs font-semibold text-slate-700"
        >
          Địa chỉ cụ thể (Số nhà, tên đường...) <span className="text-[#e30019]">*</span>
        </Label>
        <Input
          id="detailAddress"
          type="text"
          required
          value={addressForm.detailAddress}
          onChange={(e) =>
            setAddressForm({
              ...addressForm,
              detailAddress: e.target.value,
            })
          }
          placeholder="Ví dụ: Số 123 đường Lê Lợi, Khóm 1"
          className="h-9 text-xs rounded-[6px] border-slate-200"
        />
      </div>

      <div className="pt-1 p-2.5 rounded-[6px] bg-slate-50 border border-slate-100 flex items-start gap-2.5">
        <Checkbox
          id="default-address"
          checked={addressForm.isDefault}
          onCheckedChange={(val) =>
            setAddressForm({
              ...addressForm,
              isDefault: Boolean(val),
            })
          }
          className="mt-0.5"
        />
        <div className="space-y-0.5">
          <Label
            htmlFor="default-address"
            className="text-xs text-slate-800 font-semibold block cursor-pointer"
          >
            Đặt làm địa chỉ nhận hàng mặc định
          </Label>
          <span className="text-[11px] text-slate-500 block leading-tight">
            Nếu chọn, địa chỉ này sẽ là mặc định khi đặt hàng. Địa chỉ mặc định trước đó sẽ tự động chuyển thành địa chỉ phụ.
          </span>
        </div>
      </div>
    </>
  );
}
