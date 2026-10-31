'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatProvinceName } from '@/utils/vietnamAddressMerger';
import shippingService from '@/services/shipping.service';
import AddressMergerPreview from './address/AddressMergerPreview';
import AddressFormFields from './address/AddressFormFields';

export default function AddressModal({
  isOpen,
  onClose,
  editingAddressId,
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
  handleSaveAddress,
  addressSaving = false,
}) {
  const [mergerData, setMergerData] = useState(null);
  const [loadingMerger, setLoadingMerger] = useState(false);
  const lookupTimerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setMergerData(null);
      setLoadingMerger(false);
      return;
    }

    if (!addressForm.province || !addressForm.ward) {
      setMergerData(null);
      setLoadingMerger(false);
      return;
    }

    if (lookupTimerRef.current) {
      clearTimeout(lookupTimerRef.current);
    }

    setLoadingMerger(true);
    lookupTimerRef.current = setTimeout(async () => {
      try {
        const data = await shippingService.getPostMergerAddress({
          province: addressForm.province,
          district: addressForm.district,
          ward: addressForm.ward,
          detailAddress: addressForm.detailAddress,
          provinceId: addressForm.provinceId,
          districtId: addressForm.districtId,
          wardCode: addressForm.wardCode,
        });
        if (data) {
          setMergerData(data);
        }
      } catch (err) {
      } finally {
        setLoadingMerger(false);
      }
    }, 200);

    return () => {
      if (lookupTimerRef.current) {
        clearTimeout(lookupTimerRef.current);
      }
    };
  }, [
    isOpen,
    addressForm.province,
    addressForm.district,
    addressForm.ward,
    addressForm.detailAddress,
    addressForm.provinceId,
    addressForm.districtId,
    addressForm.wardCode,
  ]);

  if (!isOpen) return null;

  const preMergerParts = [
    addressForm.detailAddress?.trim(),
    addressForm.ward,
    addressForm.district,
    addressForm.province,
  ].filter(Boolean);
  const preMergerAddress = preMergerParts.join(', ');

  const postMergerAddress = mergerData?.fullAddress
    ? mergerData.fullAddress
    : [
        addressForm.detailAddress?.trim(),
        addressForm.ward,
        formatProvinceName(addressForm.province),
      ]
        .filter(Boolean)
        .join(', ');

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-xl p-0 rounded-[6px] overflow-hidden">
        <DialogHeader className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-white">
          <DialogTitle className="text-sm sm:text-base font-bold text-slate-900">
            {editingAddressId
              ? 'Cập nhật địa chỉ nhận hàng'
              : 'Thêm địa chỉ nhận hàng mới'}
          </DialogTitle>
          <DialogDescription className="text-[11px] text-slate-500">
            Vui lòng nhập chính xác để đơn hàng được giao nhanh chóng và tận tay
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSaveAddress}
          className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          <AddressFormFields
            addressForm={addressForm}
            setAddressForm={setAddressForm}
            provinces={provinces}
            districts={districts}
            wards={wards}
            loadingProvinces={loadingProvinces}
            loadingDistricts={loadingDistricts}
            loadingWards={loadingWards}
            handleProvinceSelect={handleProvinceSelect}
            handleDistrictSelect={handleDistrictSelect}
            handleWardSelect={handleWardSelect}
          />

          {addressForm.province && addressForm.ward && (
            <AddressMergerPreview
              preMergerAddress={preMergerAddress}
              postMergerAddress={postMergerAddress}
              loadingMerger={loadingMerger}
              mergerData={mergerData}
            />
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-[6px] h-9 px-4"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={addressSaving}
              size="sm"
              className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 px-5 shadow-xs"
            >
              {addressSaving
                ? 'Đang lưu...'
                : editingAddressId
                ? 'Lưu thay đổi'
                : 'Thêm địa chỉ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
