'use client';

import { useState } from 'react';
import userService from '@/services/user.service';
import shippingService from '@/services/shipping.service';
import { toast } from '@/components/ui/toast';
import { confirm } from '@/components/ui/confirm-dialog';

export function useAccountAddresses(user) {
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    province: '',
    provinceId: null,
    district: '',
    districtId: null,
    ward: '',
    wardCode: '',
    detailAddress: '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const data = await userService.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      setAddressLoading(false);
    }
  };

  const ensureProvincesLoaded = async () => {
    if (provinces.length > 0) return provinces;
    setLoadingProvinces(true);
    try {
      const data = await shippingService.getProvinces();
      setProvinces(data);
      return data;
    } catch {
      return [];
    } finally {
      setLoadingProvinces(false);
    }
  };

  const handleOpenAddAddress = async () => {
    setEditingAddressId(null);
    setDistricts([]);
    setWards([]);
    setAddressForm({
      fullName: user?.fullName || user?.name || '',
      phone: user?.phone || '',
      province: '',
      provinceId: null,
      district: '',
      districtId: null,
      ward: '',
      wardCode: '',
      detailAddress: '',
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
    await ensureProvincesLoaded();
  };

  const handleOpenEditAddress = async (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      province: addr.province || '',
      provinceId: addr.provinceId || null,
      district: addr.district || '',
      districtId: addr.districtId || null,
      ward: addr.ward || '',
      wardCode: addr.wardCode || '',
      detailAddress: addr.detailAddress || '',
      isDefault: Boolean(addr.isDefault),
    });
    setAddressModalOpen(true);

    const loadedProvinces = await ensureProvincesLoaded();
    let pid = addr.provinceId;
    if (!pid && addr.province && loadedProvinces.length > 0) {
      const matchedP = loadedProvinces.find(
        (p) =>
          p.ProvinceName.toLowerCase() === addr.province.toLowerCase() ||
          addr.province.toLowerCase().includes(p.ProvinceName.toLowerCase())
      );
      if (matchedP) {
        pid = matchedP.ProvinceID;
        setAddressForm((prev) => ({ ...prev, provinceId: pid }));
      }
    }

    if (pid) {
      setLoadingDistricts(true);
      try {
        const loadedDistricts = await shippingService.getDistricts(pid);
        setDistricts(loadedDistricts);

        let did = addr.districtId;
        if (!did && addr.district && loadedDistricts.length > 0) {
          const matchedD = loadedDistricts.find(
            (d) =>
              d.DistrictName.toLowerCase() === addr.district.toLowerCase() ||
              addr.district.toLowerCase().includes(d.DistrictName.toLowerCase())
          );
          if (matchedD) {
            did = matchedD.DistrictID;
            setAddressForm((prev) => ({ ...prev, districtId: did }));
          }
        }

        if (did) {
          setLoadingWards(true);
          const loadedWards = await shippingService.getWards(did);
          setWards(loadedWards);

          if (!addr.wardCode && addr.ward && loadedWards.length > 0) {
            const matchedW = loadedWards.find(
              (w) =>
                w.WardName.toLowerCase() === addr.ward.toLowerCase() ||
                addr.ward.toLowerCase().includes(w.WardName.toLowerCase())
            );
            if (matchedW) {
              setAddressForm((prev) => ({ ...prev, wardCode: String(matchedW.WardCode) }));
            }
          }
        }
      } catch {
      } finally {
        setLoadingDistricts(false);
        setLoadingWards(false);
      }
    }
  };

  const handleProvinceSelect = async (selectedPid, matchedProvince) => {
    if (!selectedPid) {
      setAddressForm((prev) => ({
        ...prev,
        province: '',
        provinceId: null,
        district: '',
        districtId: null,
        ward: '',
        wardCode: '',
      }));
      setDistricts([]);
      setWards([]);
      return;
    }

    const matched =
      matchedProvince || provinces.find((p) => String(p.ProvinceID) === String(selectedPid));
    const pName = matched?.ProvinceName || matched?.label || '';

    setAddressForm((prev) => ({
      ...prev,
      province: pName,
      provinceId: Number(selectedPid),
      district: '',
      districtId: null,
      ward: '',
      wardCode: '',
    }));
    setDistricts([]);
    setWards([]);

    setLoadingDistricts(true);
    try {
      const data = await shippingService.getDistricts(selectedPid);
      setDistricts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không thể tải danh sách quận/huyện');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictSelect = async (selectedDid, matchedDistrict) => {
    if (!selectedDid) {
      setAddressForm((prev) => ({
        ...prev,
        district: '',
        districtId: null,
        ward: '',
        wardCode: '',
      }));
      setWards([]);
      return;
    }

    const matched =
      matchedDistrict || districts.find((d) => String(d.DistrictID) === String(selectedDid));
    const dName = matched?.DistrictName || matched?.label || '';

    setAddressForm((prev) => ({
      ...prev,
      district: dName,
      districtId: Number(selectedDid),
      ward: '',
      wardCode: '',
    }));
    setWards([]);

    setLoadingWards(true);
    try {
      const data = await shippingService.getWards(selectedDid);
      setWards(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không thể tải danh sách phường/xã');
    } finally {
      setLoadingWards(false);
    }
  };

  const handleWardSelect = (selectedWardCode, matchedWard) => {
    if (!selectedWardCode) {
      setAddressForm((prev) => ({ ...prev, ward: '', wardCode: '' }));
      return;
    }
    const matched = matchedWard || wards.find((w) => String(w.WardCode) === String(selectedWardCode));
    setAddressForm((prev) => ({
      ...prev,
      ward: matched?.WardName || matched?.label || '',
      wardCode: String(selectedWardCode),
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.fullName?.trim()) {
      toast.error('Vui lòng nhập họ và tên người nhận');
      return;
    }
    if (!addressForm.phone?.trim() || !/^0\d{9}$/.test(addressForm.phone.trim())) {
      toast.error('Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0');
      return;
    }
    if (!addressForm.province?.trim() || !addressForm.district?.trim() || !addressForm.ward?.trim()) {
      toast.error('Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã');
      return;
    }
    if (!addressForm.detailAddress?.trim()) {
      toast.error('Vui lòng nhập địa chỉ cụ thể');
      return;
    }

    setAddressSaving(true);
    try {
      const payload = {
        fullName: addressForm.fullName.trim(),
        phone: addressForm.phone.trim(),
        province: addressForm.province.trim(),
        provinceId: addressForm.provinceId ? Number(addressForm.provinceId) : undefined,
        district: addressForm.district.trim(),
        districtId: addressForm.districtId ? Number(addressForm.districtId) : undefined,
        ward: addressForm.ward.trim(),
        wardCode: addressForm.wardCode ? String(addressForm.wardCode) : undefined,
        detailAddress: addressForm.detailAddress.trim(),
        isDefault: Boolean(addressForm.isDefault),
      };

      if (editingAddressId) {
        await userService.updateAddress(editingAddressId, payload);
        toast.success('Cập nhật địa chỉ thành công!');
      } else {
        await userService.addAddress(payload);
        toast.success('Thêm địa chỉ nhận hàng thành công!');
      }
      setAddressModalOpen(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const isConfirmed = await confirm({
      title: 'Xóa địa chỉ nhận hàng?',
      description: 'Bạn có chắc chắn muốn xóa địa chỉ này? Thao tác này không thể hoàn tác.',
      confirmText: 'Xóa địa chỉ',
      cancelText: 'Hủy bỏ',
      variant: 'destructive',
    });
    if (!isConfirmed) return;
    try {
      await userService.deleteAddress(addressId);
      toast.success('Đã xóa địa chỉ thành công!');
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa địa chỉ');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await userService.setDefaultAddress(addressId);
      toast.success('Đã đặt làm địa chỉ mặc định!');
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đặt làm địa chỉ mặc định');
    }
  };

  return {
    addresses,
    addressLoading,
    addressModalOpen,
    setAddressModalOpen,
    editingAddressId,
    addressSaving,
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    addressForm,
    setAddressForm,
    fetchAddresses,
    ensureProvincesLoaded,
    handleOpenAddAddress,
    handleOpenEditAddress,
    handleProvinceSelect,
    handleDistrictSelect,
    handleWardSelect,
    handleSaveAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
  };
}
