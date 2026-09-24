'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '../../components/common/Icon';
import PALETTE from '../../constants/palette';
import { authService } from '../../services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email của bạn');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.success || res.status === 'success') {
        setSubmitted(true);
      } else {
        setError(res.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(
        err.response?.data?.message ||
          'Không tìm thấy tài khoản hoặc hệ thống tạm thời bận. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 bg-slate-50 z-40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-900">Quên mật khẩu?</h1>
          <p className="text-sm text-slate-500">
            Nhập email đã đăng ký để nhận liên kết thiết lập lại mật khẩu
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
              <Icon name="check" size={32} color={PALETTE.success} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900">
                Đã gửi email khôi phục!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{' '}
                <strong className="text-slate-700">{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-xl font-medium text-white transition text-sm shadow cursor-pointer hover:opacity-95"
              style={{ backgroundColor: PALETTE.primary }}
            >
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email tài khoản <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
                <div className="absolute left-3 top-3 text-slate-400">
                  <Icon name="mail" size={18} color={PALETTE.textMuted} />
                </div>
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
                  <span>Đang gửi...</span>
                </>
              ) : (
                <span>Gửi yêu cầu khôi phục</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Nhớ mật khẩu?{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: PALETTE.primary }}
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
