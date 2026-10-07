'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import userService from '../../services/user.service';
import authService from '../../services/auth.service';
import shippingService from '../../services/shipping.service';
import { toast } from '../../components/ui/toast';
import { confirm } from '../../components/ui/confirm-dialog';

// Modular Account Sub-Components
import AccountSidebar from '../../components/account/AccountSidebar';
import AccountOverviewTab from '../../components/account/AccountOverviewTab';
import AccountOrdersTab from '../../components/account/AccountOrdersTab';
import AccountWarrantyTab from '../../components/account/AccountWarrantyTab';
import AccountProfileTab from '../../components/account/AccountProfileTab';
import AccountAddressesTab from '../../components/account/AccountAddressesTab';
import AccountChangePasswordTab from '../../components/account/AccountChangePasswordTab';
import AccountSecurityTab from '../../components/account/AccountSecurityTab';
import AddressModal from '../../components/account/AddressModal';

function AccountContent() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avatar Upload State
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);

  // Sync tab with URL search param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    router.replace(`/tai-khoan?tab=${newTab}`, { scroll: false });
  };

  const isUserAuth =
    typeof isAuthenticated === 'function'
      ? isAuthenticated()
      : !!isAuthenticated || !!user;

  // Protect page
  useEffect(() => {
    if (mounted && !isUserAuth) {
      router.push('/login');
    }
  }, [mounted, isUserAuth, router]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'other',
    dateOfBirth: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Orders State
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Warranty State
  const [warrantySearch, setWarrantySearch] = useState('');

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);

  // GHN Master Data State
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


  // Sync user profile data
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender || 'other',
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split('T')[0]
          : '',
      });
    }
  }, [user]);

  // Fetch Addresses
  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const data = await userService.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách địa chỉ:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && isUserAuth) {
      fetchAddresses();
      ensureProvincesLoaded();
    }
  }, [mounted, isUserAuth]);

  // Avatar Upload Handlers
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 5MB');
      return;
    }

    setAvatarUploading(true);
    try {
      const res = await userService.uploadAvatar(file);
      if (res.data?.avatar || res.avatar) {
        const newAvatar = res.data?.avatar || res.avatar;
        setUser({ ...user, avatar: newAvatar });
        toast.success('Đổi ảnh đại diện thành công!');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại!'
      );
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    const isConfirmed = await confirm({
      title: 'Gỡ ảnh đại diện?',
      description: 'Bạn có chắc chắn muốn gỡ ảnh đại diện hiện tại khỏi tài khoản?',
      confirmText: 'Gỡ ảnh',
      cancelText: 'Hủy bỏ',
      variant: 'destructive',
    });
    if (!isConfirmed) return;
    setAvatarUploading(true);
    try {
      await userService.deleteAvatar();
      setUser({ ...user, avatar: null });
      toast.success('Đã gỡ ảnh đại diện thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gỡ ảnh đại diện');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileMessage(null);
    if (user) {
      setProfileForm({
        fullName: user.fullName || user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender || 'other',
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split('T')[0]
          : '',
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isEditing) return;

    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const payload = {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        gender: profileForm.gender,
        dateOfBirth: profileForm.dateOfBirth || null,
      };

      const updatedUser = await userService.updateProfile(payload);
      if (updatedUser) {
        setUser({ ...user, ...updatedUser });
      }
      setIsEditing(false);
      setProfileMessage({
        type: 'success',
        text: 'Cập nhật thông tin cá nhân thành công!',
      });
      toast.success('Cập nhật thông tin cá nhân thành công!');
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        'Không thể cập nhật thông tin. Vui lòng thử lại!';
      setProfileMessage({
        type: 'error',
        text: errMsg,
      });
      toast.error(errMsg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Mật khẩu xác nhận không trùng khớp!',
      });
      return;
    }

    const npw = passwordForm.newPassword || '';
    if (npw.length < 8) {
      setPasswordMessage({
        type: 'error',
        text: 'Mật khẩu mới phải có tối thiểu 8 ký tự!',
      });
      return;
    }
    if (!/[A-Z]/.test(npw)) {
      setPasswordMessage({
        type: 'error',
        text: 'Mật khẩu mới phải chứa ít nhất 1 chữ in hoa (A-Z)!',
      });
      return;
    }
    if (!/[a-z]/.test(npw)) {
      setPasswordMessage({
        type: 'error',
        text: 'Mật khẩu mới phải chứa ít nhất 1 chữ in thường (a-z)!',
      });
      return;
    }
    if (!/[0-9]/.test(npw)) {
      setPasswordMessage({
        type: 'error',
        text: 'Mật khẩu mới phải chứa ít nhất 1 chữ số (0-9)!',
      });
      return;
    }
    if (!/[^A-Za-z0-9]/.test(npw)) {
      setPasswordMessage({
        type: 'error',
        text: 'Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt (!@#$%...)!',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordMessage({
        type: 'success',
        text: 'Đổi mật khẩu thành công!',
      });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!';
      setPasswordMessage({
        type: 'error',
        text: errMsg,
      });
      toast.error(errMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const ensureProvincesLoaded = async () => {
    if (provinces.length > 0) return provinces;
    setLoadingProvinces(true);
    try {
      const data = await shippingService.getProvinces();
      setProvinces(data);
      return data;
    } catch (err) {
      console.error('Lỗi tải danh sách tỉnh/thành:', err);
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
      isDefault: !!addr.isDefault,
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
      } catch (err) {
        console.error('Lỗi tải danh mục địa chỉ GHN:', err);
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
      matchedProvince ||
      provinces.find((p) => String(p.ProvinceID) === String(selectedPid));
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
    } catch (err) {
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
      matchedDistrict ||
      districts.find((d) => String(d.DistrictID) === String(selectedDid));
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
    } catch (err) {
      toast.error('Không thể tải danh sách phường/xã');
    } finally {
      setLoadingWards(false);
    }
  };

  const handleWardSelect = (selectedWardCode, matchedWard) => {
    if (!selectedWardCode) {
      setAddressForm((prev) => ({
        ...prev,
        ward: '',
        wardCode: '',
      }));
      return;
    }

    const matched =
      matchedWard ||
      wards.find((w) => String(w.WardCode) === String(selectedWardCode));
    const wName = matched?.WardName || matched?.label || '';

    setAddressForm((prev) => ({
      ...prev,
      ward: wName,
      wardCode: String(selectedWardCode),
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.fullName?.trim()) {
      toast.error('Vui lòng nhập họ và tên người nhận');
      return;
    }
    if (!addressForm.phone?.trim()) {
      toast.error('Vui lòng nhập số điện thoại người nhận');
      return;
    }
    if (!/^0\d{9}$/.test(addressForm.phone.trim())) {
      toast.error('Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0');
      return;
    }
    if (!addressForm.province?.trim()) {
      toast.error('Vui lòng chọn Tỉnh / Thành phố');
      return;
    }
    if (!addressForm.district?.trim()) {
      toast.error('Vui lòng chọn Quận / Huyện');
      return;
    }
    if (!addressForm.ward?.trim()) {
      toast.error('Vui lòng chọn Phường / Xã');
      return;
    }
    if (!addressForm.detailAddress?.trim()) {
      toast.error('Vui lòng nhập địa chỉ cụ thể (Số nhà, tên đường...)');
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
        isDefault: !!addressForm.isDefault,
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
      toast.error(
        err.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ'
      );
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const isConfirmed = await confirm({
      title: 'Xóa địa chỉ nhận hàng?',
      description: 'Bạn có chắc chắn muốn xóa địa chỉ nhận hàng này? Thao tác này không thể hoàn tác.',
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
      toast.error(
        err.response?.data?.message || 'Không thể đặt làm địa chỉ mặc định'
      );
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <Loader2 size={24} className="animate-spin text-[#e30019]" />
      </div>
    );
  }

  if (!user && !isUserAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="w-12 h-12 rounded-[6px] bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-3">
          <User size={22} />
        </div>
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          Đang chuyển hướng...
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Vui lòng đăng nhập để xem và quản lý thông tin tài khoản của bạn.
        </p>
        <Link
          href="/login"
          className="px-4 py-2 bg-[#e30019] hover:bg-[#c40015] text-white font-semibold text-xs rounded-[6px] shadow-xs active:scale-[0.98] transition"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const displayName =
    user?.fullName || user?.name || user?.email?.split('@')[0] || 'Khách hàng';
  const initial = displayName.charAt(0).toUpperCase();
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const tabTitles = {
    overview: 'Tổng quan',
    orders: 'Đơn hàng của tôi',
    warranty: 'Bảo hành & Thiết bị',
    profile: 'Thông tin cá nhân',
    addresses: 'Địa chỉ nhận hàng',
    security: 'Mật khẩu & Bảo mật',
    'change-password': 'Mật khẩu & Bảo mật',
  };

  return (
    <div className="bg-slate-50/70 min-h-[90vh] py-6 text-slate-800">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
          <Link href="/" className="hover:text-[#e30019] transition">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">
            {tabTitles[activeTab] || 'Tài khoản'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 1. Sidebar Component */}
          <div className="lg:col-span-1">
            <AccountSidebar
              user={user}
              displayName={displayName}
              initial={initial}
              activeTab={activeTab}
              handleTabChange={handleTabChange}
              avatarUploading={avatarUploading}
              avatarInputRef={avatarInputRef}
              addressesCount={addresses.length}
              handleLogout={handleLogout}
            />
          </div>

          {/* 2. Main Content Tab Views */}
          <div className="lg:col-span-3 space-y-5">
            {activeTab === 'overview' && (
              <AccountOverviewTab
                user={user}
                displayName={displayName}
                initial={initial}
                handleTabChange={handleTabChange}
                addresses={addresses}
                defaultAddress={defaultAddress}
                handleOpenAddAddress={handleOpenAddAddress}
              />
            )}

            {activeTab === 'orders' && (
              <AccountOrdersTab
                orderSearch={orderSearch}
                setOrderSearch={setOrderSearch}
                orderFilter={orderFilter}
                setOrderFilter={setOrderFilter}
              />
            )}

            {activeTab === 'warranty' && (
              <AccountWarrantyTab
                warrantySearch={warrantySearch}
                setWarrantySearch={setWarrantySearch}
              />
            )}

            {activeTab === 'profile' && (
              <AccountProfileTab
                user={user}
                displayName={displayName}
                initial={initial}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleCancelEdit={handleCancelEdit}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                profileLoading={profileLoading}
                profileMessage={profileMessage}
                handleUpdateProfile={handleUpdateProfile}
                avatarUploading={avatarUploading}
                avatarInputRef={avatarInputRef}
                handleDeleteAvatar={handleDeleteAvatar}
              />
            )}

            {activeTab === 'addresses' && (
              <AccountAddressesTab
                addresses={addresses}
                addressLoading={addressLoading}
                handleOpenAddAddress={handleOpenAddAddress}
                handleOpenEditAddress={handleOpenEditAddress}
                handleDeleteAddress={handleDeleteAddress}
                handleSetDefaultAddress={handleSetDefaultAddress}
              />
            )}

            {(activeTab === 'security' || activeTab === 'change-password') && (
              <AccountSecurityTab
                user={user}
                setUser={setUser}
                onRefreshProfile={async () => {
                  try {
                    const res = await authService.getProfile();
                    if (res?.data?.user) {
                      setUser(res.data.user);
                    }
                  } catch (_) {}
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. Address Add / Edit Modal */}
      <AddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        editingAddressId={editingAddressId}
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
        handleSaveAddress={handleSaveAddress}
        addressSaving={addressSaving}
      />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
          <Loader2 size={24} className="animate-spin text-[#e30019]" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
