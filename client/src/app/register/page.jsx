'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '../../components/common/Icon';
import PALETTE from '../../constants/palette';
import { authService } from '../../services/auth.service';
import useAuthStore from '../../store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, anonymousId, getOrCreateAnonymousId } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: 'male',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isPasswordValid =
    formData.password.length >= 8 &&
    /[A-Z]/.test(formData.password) &&
    /[0-9]/.test(formData.password);

  const passwordStarted = formData.password.length > 0;
  const isPasswordInvalid = passwordStarted && !isPasswordValid;

  const confirmPasswordStarted = formData.confirmPassword.length > 0;
  const isConfirmInvalid =
    confirmPasswordStarted && formData.confirmPassword !== formData.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    if (!/^0\d{9}$/.test(formData.phone.trim())) {
      setError('Số điện thoại phải có 10 chữ số và bắt đầu bằng 0 (ví dụ: 0912345678)');
      return;
    }
    if (!isPasswordValid) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa và 1 chữ số');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const sessionId = anonymousId || getOrCreateAnonymousId();
      const res = await authService.register({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        email: formData.email.trim(),
        password: formData.password,
        sessionId,
      });

      if ((res.success || res.status === 'success') && res.data) {
        setAuth({
          user: res.data.user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });
        window.location.href = '/';
      } else {
        setError(res.message || 'Đăng ký không thành công');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(
        err.response?.data?.message ||
          'Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 bg-slate-50 z-40">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản mới</h1>
          <p className="text-sm text-slate-500">
            Trở thành thành viên để nhận ngay ưu đãi đặc quyền
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <div className="absolute left-3 top-3 text-slate-400">
                <Icon name="user" size={18} color={PALETTE.textMuted} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
                <div className="absolute left-3 top-3 text-slate-400">
                  <Icon name="phone" size={18} color={PALETTE.textMuted} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white transition"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <div className="absolute left-3 top-3 text-slate-400">
                <Icon name="mail" size={18} color={PALETTE.textMuted} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tối thiểu 8 ký tự"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-xl focus:outline-none transition ${
                    isPasswordInvalid
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-red-900 bg-red-50/20'
                      : isPasswordValid
                      ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
                <div className="absolute left-3 top-3 text-slate-400">
                  <Icon name="lock" size={18} color={isPasswordInvalid ? '#ef4444' : PALETTE.textMuted} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={PALETTE.textMuted}
                  />
                </button>
              </div>
              {isPasswordInvalid && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  Cần ít nhất 8 ký tự, 1 chữ hoa, 1 chữ số
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm border rounded-xl focus:outline-none transition ${
                    isConfirmInvalid
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-red-900 bg-red-50/20'
                      : confirmPasswordStarted && !isConfirmInvalid
                      ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
                <div className="absolute left-3 top-3 text-slate-400">
                  <Icon name="lock" size={18} color={isConfirmInvalid ? '#ef4444' : PALETTE.textMuted} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <Icon
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={PALETTE.textMuted}
                  />
                </button>
              </div>
              {isConfirmInvalid && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  Mật khẩu xác nhận không khớp
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-95 disabled:opacity-50 mt-2"
            style={{ backgroundColor: PALETTE.primary }}
          >
            {loading ? (
              <>
                <Icon name="spinner" size={18} color={PALETTE.white} />
                <span>Đang tạo tài khoản...</span>
              </>
            ) : (
              <span>Đăng ký</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: PALETTE.primary }}
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
