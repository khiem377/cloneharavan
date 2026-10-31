'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import AuthSocialButtons from '@/components/auth/AuthSocialButtons';
import RegisterFormFields from '@/components/auth/RegisterFormFields';

export default function TrangDangKy() {
  const router = useRouter();
  const { setAuth, anonymousId, getOrCreateAnonymousId } = useAuthStore();

  const [duLieu, setDuLieu] = useState({
    fullName: '',
    phone: '',
    gender: 'male',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [hienXacNhan, setHienXacNhan] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');

  useEffect(() => {
    const handleReset = () => setDangGui(false);
    window.addEventListener('pageshow', handleReset);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') handleReset();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleReset);
    return () => {
      window.removeEventListener('pageshow', handleReset);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleReset);
    };
  }, []);

  const matKhauHopLe =
    duLieu.password.length >= 8 &&
    /[A-Z]/.test(duLieu.password) &&
    /[a-z]/.test(duLieu.password) &&
    /[0-9]/.test(duLieu.password) &&
    /[^A-Za-z0-9]/.test(duLieu.password);

  const daBatDauMatKhau = duLieu.password.length > 0;
  const matKhauSai = daBatDauMatKhau && !matKhauHopLe;

  const daBatDauXacNhan = duLieu.confirmPassword.length > 0;
  const xacNhanSai = daBatDauXacNhan && duLieu.confirmPassword !== duLieu.password;

  const handleThayDoi = (e) => {
    const { name, value } = e.target;
    setDuLieu((prev) => ({ ...prev, [name]: value }));
    if (loi) setLoi('');
  };

  const handleNopForm = async (e) => {
    e.preventDefault();

    if (!duLieu.fullName.trim()) {
      setLoi('Vui lòng nhập họ và tên');
      return;
    }
    if (!/^0\d{9}$/.test(duLieu.phone.trim())) {
      setLoi('Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0912345678)');
      return;
    }
    if (!matKhauHopLe) {
      setLoi('Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt');
      return;
    }
    if (duLieu.password !== duLieu.confirmPassword) {
      setLoi('Mật khẩu xác nhận không khớp');
      return;
    }

    setDangGui(true);
    setLoi('');

    try {
      const sessionId = anonymousId || getOrCreateAnonymousId();
      const res = await authService.register({
        fullName: duLieu.fullName.trim(),
        phone: duLieu.phone.trim(),
        gender: duLieu.gender,
        email: duLieu.email.trim(),
        password: duLieu.password,
        sessionId,
      });

      if ((res.success || res.status === 'success') && res.data) {
        setAuth({
          user: res.data.user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });
        useCartStore.getState().fetchCart();
        router.replace('/');
      } else {
        setLoi(res.message || 'Đăng ký không thành công');
      }
    } catch (err) {
      setLoi(
        err.response?.data?.message ||
        'Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[480px] p-6 sm:p-8 space-y-5 animate-fadeIn">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-xl font-bold text-slate-900">
            Tạo tài khoản mới
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Trở thành thành viên để nhận ngay ưu đãi đặc quyền từ SHOP.
          </CardDescription>
        </CardHeader>

        {loi && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{loi}</AlertDescription>
          </Alert>
        )}

        <CardContent className="p-0 space-y-4">
          <form onSubmit={handleNopForm} method="POST" className="space-y-4">
            <RegisterFormFields
              duLieu={duLieu}
              handleThayDoi={handleThayDoi}
              hienMatKhau={hienMatKhau}
              setHienMatKhau={setHienMatKhau}
              hienXacNhan={hienXacNhan}
              setHienXacNhan={setHienXacNhan}
              matKhauSai={matKhauSai}
              matKhauHopLe={matKhauHopLe}
              xacNhanSai={xacNhanSai}
              daBatDauXacNhan={daBatDauXacNhan}
            />

            <Button
              type="submit"
              disabled={dangGui}
              className="w-full h-10 bg-brand hover:bg-brand-hover text-white font-bold text-xs rounded-[6px] shadow-xs active:scale-[0.98] transition cursor-pointer disabled:opacity-50 mt-1"
            >
              {dangGui ? (
                <>
                  <Loader2 size={15} className="animate-spin mr-2" />
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <span>Đăng ký tài khoản</span>
              )}
            </Button>
          </form>

          <AuthSocialButtons googleText="signup_with" />

          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            Đã có tài khoản?{' '}
            <Link
              href="/login"
              className="font-bold text-brand hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
