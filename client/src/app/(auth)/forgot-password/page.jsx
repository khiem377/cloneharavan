'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { authService } from '../../../services/auth.service';
import { toast } from '../../../components/ui/toast';
import MascotSecurityAuth from '../../../components/mascot/MascotSecurityAuth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Vui lòng nhập địa chỉ email của bạn');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.success || res.status === 'success') {
        setSubmitted(true);
      } else {
        toast.error(res.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Không tìm thấy tài khoản hoặc hệ thống tạm thời bận. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[440px] p-6 sm:p-8 space-y-5 animate-fadeIn">
        {/* Mascot Security Header */}
        <div className="flex justify-center -mt-3 mb-2">
          <MascotSecurityAuth size={160} />
        </div>

        {submitted ? (
          /* ── Trạng thái đã gửi ── */
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[6px] bg-emerald-500 flex items-center justify-center shrink-0 text-white">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 font-mono">
                  Đã gửi
                </p>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Kiểm tra hộp thư</h1>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Hướng dẫn đặt lại mật khẩu đã được gửi đến{' '}
              <span className="font-semibold text-slate-900">{email}</span>.
            </p>

            <div className="divide-y divide-slate-100 border-y border-slate-100">
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-slate-500">Gửi đến</span>
                <span className="font-semibold text-slate-800 font-mono">{email}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-slate-500">Hiệu lực</span>
                <span className="font-semibold text-slate-700 font-mono">15 phút</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-slate-500">Trạng thái</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Đã gửi thành công
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-[6px] px-3.5 py-2.5 text-xs text-amber-800 leading-relaxed">
              Không thấy email? Hãy kiểm tra thư mục <strong>Spam</strong> hoặc <strong>Thư rác</strong>.
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                asChild
                className="w-full bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 shadow-xs active:scale-[0.98]"
              >
                <Link href="/login">
                  Quay lại đăng nhập
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full text-xs font-medium text-slate-700 rounded-[6px] h-9 active:scale-[0.98]"
              >
                Gửi lại email khác
              </Button>
            </div>
          </div>
        ) : (
          /* ── Form yêu cầu ── */
          <div className="space-y-4">
            <CardHeader className="p-0 pb-1">
              <CardTitle className="text-xl font-bold text-slate-900">Quên mật khẩu?</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Nhập email đã đăng ký để nhận liên kết thiết lập lại mật khẩu.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email">
                  Email tài khoản <span className="text-[#e30019]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="h-9 pl-9 text-xs rounded-[6px]"
                  />
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Email phải trùng khớp với email đăng ký tài khoản.
                </p>
              </div>

              <Button
                id="forgot-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Gửi yêu cầu khôi phục</span>
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
              Nhớ mật khẩu?{' '}
              <Link href="/login" className="font-semibold text-[#e30019] hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
