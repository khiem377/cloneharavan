'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '../../components/common/Icon';
import PALETTE from '../../constants/palette';
import { authService } from '../../services/auth.service';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, anonymousId, getOrCreateAnonymousId } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const sessionId = anonymousId || getOrCreateAnonymousId();
      const res = await authService.login({
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
        setError(res.message || 'Đăng nhập không thành công');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
          'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 bg-slate-50 z-40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900">Đăng nhập tài khoản</h1>
          <p className="text-sm text-slate-500">
            Nhập email và mật khẩu để tiếp tục mua sắm
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium hover:underline"
                style={{ color: PALETTE.primary }}
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <div className="absolute left-3 top-3 text-slate-400">
                <Icon name="lock" size={18} color={PALETTE.textMuted} />
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-95 disabled:opacity-50"
            style={{ backgroundColor: PALETTE.primary }}
          >
            {loading ? (
              <>
                <Icon name="spinner" size={18} color={PALETTE.white} />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: PALETTE.primary }}
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
