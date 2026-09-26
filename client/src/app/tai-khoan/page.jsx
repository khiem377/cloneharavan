'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  User,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import userService from '../../services/user.service';
import {
  IconOverview,
  IconOrders,
  IconWarranty,
  IconProfile,
  IconChangePassword,
  IconLogout,
  IconEditPen,
} from '../../components/account/AccountIcons';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Edit Mode state
  const [isEditing, setIsEditing] = useState(false);

  // Sync tab with URL search param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Protect page
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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

  // Load user data into form
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

  // Cancel edit mode and reset form
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

  // Update Profile Submit
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
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Không thể cập nhật thông tin. Vui lòng thử lại!',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Change Password Submit
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

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({
        type: 'error',
        text: 'Mật khẩu mới phải có tối thiểu 8 ký tự!',
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
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user && !isAuthenticated()) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
          <User size={24} />
        </div>
        <h2 className="text-base font-bold text-gray-800 mb-1">Đang chuyển hướng...</h2>
        <p className="text-xs text-gray-500 mb-4">
          Vui lòng đăng nhập để xem thông tin tài khoản.
        </p>
        <Link
          href="/login"
          className="px-5 py-2 bg-[#e30019] hover:bg-[#c40015] text-white font-medium text-xs rounded-md transition"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Khách hàng';
  const initial = displayName.charAt(0).toUpperCase();

  const tabTitles = {
    overview: 'Tổng quan',
    orders: 'Đơn hàng của tôi',
    warranty: 'Bảo hành',
    profile: 'Thông tin cá nhân',
    'change-password': 'Đổi mật khẩu',
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[85vh] py-4 sm:py-6 text-gray-800">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#e30019] transition">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">
            {tabTitles[activeTab] || 'Tài khoản'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* ================= LEFT SIDEBAR ================= */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200/80 p-4 shadow-2xs space-y-4">
              {/* User Profile Mini Block */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#e30019] text-white font-bold text-lg flex items-center justify-center uppercase shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">
                    {displayName}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 truncate mt-0.5">
                    <span>
                      {user?.phone
                        ? `${user.phone.slice(0, 3)}****${user.phone.slice(-3)}`
                        : user?.email || 'Tài khoản'}
                    </span>
                    <Eye size={12} className="text-gray-400 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Nav Menu with Creative Custom Icons */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition cursor-pointer text-left ${
                    activeTab === 'overview'
                      ? 'bg-[#fff1f2] text-[#e30019] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconOverview size={17} active={activeTab === 'overview'} />
                  <span>Tổng quan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition cursor-pointer text-left ${
                    activeTab === 'orders'
                      ? 'bg-[#fff1f2] text-[#e30019] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconOrders size={17} active={activeTab === 'orders'} />
                  <span>Đơn hàng của tôi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('warranty')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition cursor-pointer text-left ${
                    activeTab === 'warranty'
                      ? 'bg-[#fff1f2] text-[#e30019] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconWarranty size={17} active={activeTab === 'warranty'} />
                  <span>Bảo hành</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition cursor-pointer text-left ${
                    activeTab === 'profile'
                      ? 'bg-[#fff1f2] text-[#e30019] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconProfile size={17} active={activeTab === 'profile'} />
                  <span>Thông tin cá nhân</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('change-password')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition cursor-pointer text-left ${
                    activeTab === 'change-password'
                      ? 'bg-[#fff1f2] text-[#e30019] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <IconChangePassword size={17} active={activeTab === 'change-password'} />
                  <span>Đổi mật khẩu</span>
                </button>

                <div className="border-t border-gray-100 my-1.5" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium text-gray-700 hover:text-[#e30019] hover:bg-red-50/70 transition cursor-pointer text-left"
                >
                  <IconLogout size={17} className="text-gray-400" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT MAIN CONTENT ================= */}
          <div className="lg:col-span-3">
            {/* TAB 1: TỔNG QUAN */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Đơn hàng gần đây Card */}
                <div className="bg-white rounded-lg border border-gray-200/80 p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-sm">Đơn hàng gần đây</h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-medium text-[#e30019] hover:underline cursor-pointer"
                    >
                      Xem tất cả &gt;
                    </button>
                  </div>

                  <div className="py-10 text-center border border-dashed border-gray-200 rounded-md bg-gray-50/50">
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                      <IconOrders size={22} active={false} />
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      Bạn chưa có đơn hàng nào phát sinh gần đây
                    </div>
                    <Link
                      href="/"
                      className="inline-block px-4 py-2 bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-md shadow-xs transition"
                    >
                      Tiếp tục mua sắm
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ĐƠN HÀNG CỦA TÔI */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg border border-gray-200/80 p-5 sm:p-6 shadow-2xs space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Đơn hàng của tôi</h3>
                    <span className="text-xs text-gray-400">0 đơn hàng</span>
                  </div>

                  {/* Search box */}
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Tìm theo tên đơn, mã đơn hoặc tên sản phẩm"
                      className="w-full text-xs pl-3 pr-8 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-[#e30019] transition"
                    />
                    <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-gray-200 pt-2 text-xs">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'processing', label: 'Đang xử lý' },
                    { id: 'shipping', label: 'Đang giao' },
                    { id: 'completed', label: 'Hoàn tất' },
                    { id: 'cancelled', label: 'Đã hủy' },
                    { id: 'returned', label: 'Trả hàng' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setOrderFilter(tab.id)}
                      className={`pb-2.5 whitespace-nowrap transition cursor-pointer border-b-2 font-medium ${
                        orderFilter === tab.id
                          ? 'border-[#e30019] text-[#e30019]'
                          : 'border-transparent text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Empty State */}
                <div className="py-14 text-center">
                  <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                    <IconOrders size={26} active={false} />
                  </div>
                  <div className="font-semibold text-gray-800 text-sm mb-1">
                    Chưa có đơn hàng nào
                  </div>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Tính năng tra cứu đơn hàng trực tuyến đang được hoàn thiện. Vui lòng liên hệ hotline khi cần hỗ trợ gấp.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: BẢO HÀNH */}
            {activeTab === 'warranty' && (
              <div className="bg-white rounded-lg border border-gray-200/80 p-6 sm:p-8 shadow-2xs min-h-[380px] animate-fadeIn">
                <h3 className="text-base font-bold text-gray-900 mb-8">Yêu cầu bảo hành</h3>

                <div className="py-10 text-center max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <IconWarranty size={28} active={false} />
                  </div>
                  <div className="font-bold text-gray-800 text-sm mb-1">
                    Bạn chưa có yêu cầu bảo hành nào
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Khi bạn gửi yêu cầu bảo hành tại hệ thống, thông tin xử lý sẽ hiển thị tại đây.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: THÔNG TIN CÁ NHÂN */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">Thông tin cá nhân</h3>
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 cursor-pointer transition font-normal"
                    >
                      <X size={14} /> Hủy
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 text-xs text-[#e30019] hover:underline cursor-pointer transition font-semibold"
                    >
                      <IconEditPen size={13} className="text-[#e30019]" /> Chỉnh sửa
                    </button>
                  )}
                </div>

                {profileMessage && (
                  <div
                    className={`p-3 rounded-md flex items-center gap-2 text-xs font-medium ${
                      profileMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {profileMessage.type === 'success' ? (
                      <CheckCircle2 size={15} className="shrink-0" />
                    ) : (
                      <AlertCircle size={15} className="shrink-0" />
                    )}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!isEditing}
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, fullName: e.target.value })
                        }
                        placeholder="Nhập họ và tên"
                        className={`w-full text-xs px-3.5 py-2.5 rounded-md border transition ${
                          isEditing
                            ? 'bg-white text-gray-800 border-gray-300 focus:outline-none focus:border-[#e30019]'
                            : 'bg-[#f5f5f5] text-gray-500 border-gray-200 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        disabled={!isEditing}
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        placeholder="0919615474"
                        className={`w-full text-xs px-3.5 py-2.5 rounded-md border transition ${
                          isEditing
                            ? 'bg-white text-gray-800 border-gray-300 focus:outline-none focus:border-[#e30019]'
                            : 'bg-[#f5f5f5] text-gray-500 border-gray-200 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    {/* Email (Always disabled/locked) */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        disabled
                        value={profileForm.email}
                        className="w-full text-xs px-3.5 py-2.5 rounded-md border border-gray-200 bg-[#f5f5f5] text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        disabled={!isEditing}
                        value={profileForm.dateOfBirth}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, dateOfBirth: e.target.value })
                        }
                        className={`w-full text-xs px-3.5 py-2.5 rounded-md border transition ${
                          isEditing
                            ? 'bg-white text-gray-800 border-gray-300 focus:outline-none focus:border-[#e30019]'
                            : 'bg-[#f5f5f5] text-gray-500 border-gray-200 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={!isEditing || profileLoading}
                      className={`w-full sm:w-auto px-12 py-2.5 font-semibold text-xs rounded-md shadow-xs transition ${
                        isEditing
                          ? 'bg-[#e30019] hover:bg-[#c40015] text-white cursor-pointer'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {profileLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 5: ĐỔI MẬT KHẨU */}
            {activeTab === 'change-password' && (
              <div className="bg-white rounded-lg border border-gray-200/80 p-6 sm:p-8 shadow-2xs space-y-6 animate-fadeIn">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">Đổi mật khẩu</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
                  </p>
                </div>

                {passwordMessage && (
                  <div
                    className={`p-3 rounded-md flex items-center gap-2 text-xs font-medium ${
                      passwordMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {passwordMessage.type === 'success' ? (
                      <CheckCircle2 size={15} className="shrink-0" />
                    ) : (
                      <AlertCircle size={15} className="shrink-0" />
                    )}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                      Mật khẩu hiện tại <span className="text-[#e30019]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Nhập mật khẩu hiện tại"
                        className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-md border border-gray-200 focus:outline-none focus:border-[#e30019] transition bg-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            current: !showPassword.current,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.current ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                      Mật khẩu mới <span className="text-[#e30019]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Nhập mật khẩu mới"
                        className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-md border border-gray-200 focus:outline-none focus:border-[#e30019] transition bg-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            new: !showPassword.new,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.new ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <span className="block text-[11px] text-gray-400 mt-1">
                      Mật khẩu tối thiểu 8 ký tự, ít nhất 1 chữ in hoa và 1 chữ số.
                    </span>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                      Xác nhận mật khẩu mới <span className="text-[#e30019]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-md border border-gray-200 focus:outline-none focus:border-[#e30019] transition bg-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            confirm: !showPassword.confirm,
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-10 py-2.5 bg-[#e30019] hover:bg-[#c40015] disabled:opacity-50 text-white font-semibold text-xs rounded-md shadow-xs transition cursor-pointer"
                    >
                      {passwordLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#e30019] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
