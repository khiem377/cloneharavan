'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { authService } from '../../../services/auth.service';
import { toast } from '../../../components/ui/toast';
import MascotSecurityAuth from '../../../components/mascot/MascotSecurityAuth';

// Quy tắc BE: tối thiểu 8 ký tự, 1 chữ hoa, 1 chữ số
const validatePassword = (pw) => {
  if (!pw || pw.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (!/[A-Z]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 chữ hoa';
  if (!/[0-9]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 chữ số';
  return null;
};

const QUY_TAC = [
  { id: 'len',   label: 'Ít nhất 8 ký tự',         test: (pw) => pw.length >= 8 },
  { id: 'upper', label: 'Ít nhất 1 chữ hoa (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'digit', label: 'Ít nhất 1 chữ số (0-9)',  test: (pw) => /[0-9]/.test(pw) },
];

function FormDatLaiMatKhau() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [matKhau, setMatKhau] = useState('');
  const [xacNhan, setXacNhan] = useState('');
  const [hienMK, setHienMK] = useState(false);
  const [hienXN, setHienXN] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [thanhCong, setThanhCong] = useState(false);
  const [loiMK, setLoiMK] = useState('');
  const [demNguoc, setDemNguoc] = useState(5);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) toast.error('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
  }, [token]);

  // Đếm ngược tự động sau khi thành công
  useEffect(() => {
    if (!thanhCong) return;
    setDemNguoc(5);
    timerRef.current = setInterval(() => {
      setDemNguoc((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [thanhCong, router]);

  const handleDoiMatKhau = (val) => {
    setMatKhau(val);
    setLoiMK(validatePassword(val) || '');
  };

  const handleNopForm = async (e) => {
    e.preventDefault();
    const loi = validatePassword(matKhau);
    if (loi) { setLoiMK(loi); return; }
    if (matKhau !== xacNhan) { toast.error('Mật khẩu xác nhận không khớp.'); return; }

    setDangGui(true);
    try {
      await authService.resetPassword({ password: matKhau, confirmPassword: xacNhan }, token);
      setThanhCong(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message;
      toast.error(msg || 'Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại.');
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-[440px] p-6 sm:p-8 space-y-5 animate-fadeIn">
        {/* Mascot Security Header */}
        <div className="flex justify-center -mt-3 mb-2">
          <MascotSecurityAuth size={160} />
        </div>

        {thanhCong ? (
          /* ── Trạng thái thành công ── */
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[6px] bg-emerald-500 flex items-center justify-center shrink-0 text-white">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 font-mono">
                  Thành công
                </p>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Mật khẩu đã được đặt lại</h1>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Mật khẩu mới của bạn đã có hiệu lực. Bạn có thể đăng nhập ngay bây giờ.
            </p>

            <div className="divide-y divide-slate-100 border-y border-slate-100">
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-slate-500">Trạng thái</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Đặt lại thành công
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-slate-500">Tự động chuyển trang</span>
                <span className="font-bold text-slate-900 font-mono">{demNguoc}s</span>
              </div>
            </div>

            {/* Thanh đếm ngược */}
            <div className="space-y-1.5">
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e30019] rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(demNguoc / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center font-mono">
                Tự động chuyển về trang đăng nhập sau {demNguoc} giây
              </p>
            </div>

            <Button
              asChild
              className="w-full bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 shadow-xs active:scale-[0.98]"
            >
              <Link href="/login">
                Đăng nhập ngay
              </Link>
            </Button>
          </div>
        ) : !token ? (
          /* ── Token không hợp lệ / Hết hạn ── */
          <div className="space-y-4 text-center">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Liên kết không hợp lệ hoặc đã hết hạn</h1>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Vì lý do an toàn bảo mật, liên kết khôi phục mật khẩu chỉ có hiệu lực một lần trong vòng 15 phút.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-[6px] px-3.5 py-2.5 text-xs text-amber-800 text-left leading-relaxed">
              Bạn có thể yêu cầu gửi lại email khôi phục mật khẩu mới bằng cách nhấn vào nút bên dưới.
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                asChild
                className="w-full bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 shadow-xs active:scale-[0.98]"
              >
                <Link href="/forgot-password">
                  Gửi lại yêu cầu khôi phục
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full text-xs font-medium text-slate-700 rounded-[6px] h-9 active:scale-[0.98]"
              >
                <Link href="/login">
                  Quay lại đăng nhập
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* ── Form đặt lại mật khẩu ── */
          <div className="space-y-4">
            <CardHeader className="p-0 pb-1">
              <CardTitle className="text-xl font-bold text-slate-900">Tạo mật khẩu mới</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Mật khẩu mới sẽ có hiệu lực ngay sau khi xác nhận.
              </CardDescription>
            </CardHeader>

            {/* Form */}
            <form onSubmit={handleNopForm} className="space-y-4">
              {/* Mật khẩu mới */}
              <div className="space-y-1.5">
                <Label htmlFor="mat-khau-moi">
                  Mật khẩu mới <span className="text-[#e30019]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="mat-khau-moi"
                    type={hienMK ? 'text' : 'password'}
                    value={matKhau}
                    onChange={(e) => handleDoiMatKhau(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    className={`h-9 pr-9 text-xs rounded-[6px] ${
                      loiMK ? 'border-red-300 focus-visible:ring-red-500' : ''
                    }`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setHienMK(!hienMK)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 h-7 w-7"
                  >
                    {hienMK ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                </div>
                {loiMK && <p className="text-[11px] text-red-600">{loiMK}</p>}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-1.5">
                <Label htmlFor="xac-nhan-mat-khau">
                  Xác nhận mật khẩu <span className="text-[#e30019]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="xac-nhan-mat-khau"
                    type={hienXN ? 'text' : 'password'}
                    value={xacNhan}
                    onChange={(e) => setXacNhan(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="h-9 pr-9 text-xs rounded-[6px]"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setHienXN(!hienXN)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 h-7 w-7"
                  >
                    {hienXN ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                </div>
                {xacNhan.length > 0 && (
                  <p className={`text-[11px] flex items-center gap-1 ${matKhau === xacNhan ? 'text-emerald-600' : 'text-red-500'}`}>
                    {matKhau === xacNhan ? (
                      <>
                        <Check size={12} />
                        Mật khẩu khớp
                      </>
                    ) : (
                      'Mật khẩu chưa khớp'
                    )}
                  </p>
                )}
              </div>

              {/* Yêu cầu mật khẩu */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Yêu cầu mật khẩu
                </p>
                {QUY_TAC.map((r) => {
                  const ok = matKhau && r.test(matKhau);
                  return (
                    <div key={r.id} className={`flex items-center gap-2 text-xs ${ok ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                      <div
                        className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center shrink-0 ${
                          ok ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                        }`}
                      >
                        {ok && <Check size={10} />}
                      </div>
                      <span>{r.label}</span>
                    </div>
                  );
                })}
              </div>

              <Button
                id="dat-lai-mat-khau-btn"
                type="submit"
                disabled={dangGui || !token}
                className="w-full bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                {dangGui ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  'Xác nhận đặt lại mật khẩu'
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

export default function TrangDatLaiMatKhau() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#e30019]" />
      </div>
    }>
      <FormDatLaiMatKhau />
    </Suspense>
  );
}
