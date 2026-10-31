'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import authService from '../../services/auth.service';
import orderService from '../../services/order.service';
import AccountSidebar from '../../components/account/AccountSidebar';
import AccountOverviewTab from '../../components/account/AccountOverviewTab';
import AccountOrdersTab from '../../components/account/AccountOrdersTab';
import AccountWarrantyTab from '../../components/account/AccountWarrantyTab';
import AccountProfileTab from '../../components/account/AccountProfileTab';
import AccountAddressesTab from '../../components/account/AccountAddressesTab';
import AccountSecurityTab from '../../components/account/AccountSecurityTab';
import AddressModal from '../../components/account/AddressModal';
import { useAccountAddresses } from '../../components/account/useAccountAddresses';
import { useAccountProfile } from '../../components/account/useAccountProfile';

function AccountContent() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState(initialTab);

  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [warrantySearch, setWarrantySearch] = useState('');

  const isUserAuth =
    typeof isAuthenticated === 'function' ? isAuthenticated() : Boolean(isAuthenticated || user);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    router.replace(`/tai-khoan?tab=${newTab}`, { scroll: false });
  };

  useEffect(() => {
    if (mounted && !isUserAuth) {
      router.push('/login');
    }
  }, [mounted, isUserAuth, router]);

  const addressState = useAccountAddresses(user);
  const profileState = useAccountProfile(user, setUser);

  const fetchUserOrders = async () => {
    try {
      const res = await orderService.getMyOrders({ limit: 50 });
      setOrders(Array.isArray(res?.data) ? res.data : []);
    } catch {
    }
  };

  useEffect(() => {
    if (mounted && isUserAuth) {
      addressState.fetchAddresses();
      addressState.ensureProvincesLoaded();
      fetchUserOrders();
    }
  }, [mounted, isUserAuth]);

  useEffect(() => {
    if (mounted && isUserAuth && (activeTab === 'addresses' || activeTab === 'overview')) {
      addressState.fetchAddresses();
    }
  }, [activeTab, mounted, isUserAuth]);

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
        <h2 className="text-sm font-bold text-slate-900 mb-1">Đang chuyển hướng...</h2>
        <p className="text-xs text-slate-500 mb-4">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
        <Link
          href="/login"
          className="px-4 py-2 bg-[#e30019] hover:bg-[#c40015] text-white font-semibold text-xs rounded-[6px] shadow-xs active:scale-[0.98] transition"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Khách hàng';
  const initial = displayName.charAt(0).toUpperCase();
  const defaultAddress = addressState.addresses.find((a) => a.isDefault) || addressState.addresses[0];

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
      <input
        type="file"
        ref={profileState.avatarInputRef}
        onChange={profileState.handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
          <Link href="/" className="hover:text-[#e30019] transition">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{tabTitles[activeTab] || 'Tài khoản'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AccountSidebar
              user={user}
              displayName={displayName}
              initial={initial}
              activeTab={activeTab}
              handleTabChange={handleTabChange}
              avatarUploading={profileState.avatarUploading}
              avatarInputRef={profileState.avatarInputRef}
              addressesCount={addressState.addresses.length}
              handleLogout={handleLogout}
            />
          </div>

          <div className="lg:col-span-3 space-y-5">
            {activeTab === 'overview' && (
              <AccountOverviewTab
                user={user}
                displayName={displayName}
                initial={initial}
                handleTabChange={handleTabChange}
                addresses={addressState.addresses}
                defaultAddress={defaultAddress}
                handleOpenAddAddress={addressState.handleOpenAddAddress}
                orders={orders}
              />
            )}

            {activeTab === 'orders' && (
              <AccountOrdersTab
                orderSearch={orderSearch}
                setOrderSearch={setOrderSearch}
                orderFilter={orderFilter}
                setOrderFilter={setOrderFilter}
                onOrdersUpdated={fetchUserOrders}
                allOrders={orders}
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
                isEditing={profileState.isEditing}
                setIsEditing={profileState.setIsEditing}
                handleCancelEdit={profileState.handleCancelEdit}
                profileForm={profileState.profileForm}
                setProfileForm={profileState.setProfileForm}
                profileLoading={profileState.profileLoading}
                profileMessage={profileState.profileMessage}
                handleUpdateProfile={profileState.handleUpdateProfile}
                avatarUploading={profileState.avatarUploading}
                avatarInputRef={profileState.avatarInputRef}
                handleDeleteAvatar={profileState.handleDeleteAvatar}
              />
            )}

            {activeTab === 'addresses' && (
              <AccountAddressesTab
                addresses={addressState.addresses}
                addressLoading={addressState.addressLoading}
                handleOpenAddAddress={addressState.handleOpenAddAddress}
                handleOpenEditAddress={addressState.handleOpenEditAddress}
                handleDeleteAddress={addressState.handleDeleteAddress}
                handleSetDefaultAddress={addressState.handleSetDefaultAddress}
              />
            )}

            {(activeTab === 'security' || activeTab === 'change-password') && (
              <AccountSecurityTab
                user={user}
                setUser={setUser}
                onRefreshProfile={async () => {
                  try {
                    const res = await authService.getProfile();
                    if (res?.data?.user) setUser(res.data.user);
                  } catch {}
                }}
              />
            )}
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={addressState.addressModalOpen}
        onClose={() => addressState.setAddressModalOpen(false)}
        editingAddressId={addressState.editingAddressId}
        addressForm={addressState.addressForm}
        setAddressForm={addressState.setAddressForm}
        provinces={addressState.provinces}
        districts={addressState.districts}
        wards={addressState.wards}
        loadingProvinces={addressState.loadingProvinces}
        loadingDistricts={addressState.loadingDistricts}
        loadingWards={addressState.loadingWards}
        handleProvinceSelect={addressState.handleProvinceSelect}
        handleDistrictSelect={addressState.handleDistrictSelect}
        handleWardSelect={addressState.handleWardSelect}
        handleSaveAddress={addressState.handleSaveAddress}
        addressSaving={addressState.addressSaving}
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
