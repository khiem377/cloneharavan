'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { authService } from '../../../services/auth.service';
import useAuthStore from '../../../store/authStore';
import GoogleLoginButton from '../../../components/auth/GoogleLoginButton';
import TikTokLoginButton from '../../../components/auth/TikTokLoginButton';
import ZaloLoginButton from '../../../components/auth/ZaloLoginButton';

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
        window.location.href = '/';
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
        {/* Header */}
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-xl font-bold text-slate-900">
            Tạo tài khoản mới
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Trở thành thành viên để nhận ngay ưu đãi đặc quyền từ SHOP.
          </CardDescription>
        </CardHeader>

        {/* Error Alert */}
        {loi && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{loi}</AlertDescription>
          </Alert>
        )}

        <CardContent className="p-0 space-y-4">
          <form onSubmit={handleNopForm} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="regFullName">
                Họ và tên <span className="text-[#e30019]">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="regFullName"
                  type="text"
                  name="fullName"
                  required
                  value={duLieu.fullName}
                  onChange={handleThayDoi}
                  placeholder="Nguyễn Văn A"
                  className="pl-9 pr-3 h-10 text-xs rounded-[6px]"
                />
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Phone + Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="regPhone">
                  Số điện thoại <span className="text-[#e30019]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="regPhone"
                    type="tel"
                    name="phone"
                    required
                    value={duLieu.phone}
                    onChange={handleThayDoi}
                    placeholder="0912345678"
                    className="pl-9 pr-3 h-10 text-xs font-mono rounded-[6px]"
                  />
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="regGender">
                  Giới tính <span className="text-[#e30019]">*</span>
                </Label>
                <select
                  id="regGender"
                  name="gender"
                  value={duLieu.gender}
                  onChange={handleThayDoi}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-[6px] focus:outline-none focus:ring-1 focus:ring-[#e30019] focus:border-[#e30019] bg-white transition cursor-pointer"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="regEmail">
                Email đăng ký <span className="text-[#e30019]">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="regEmail"
                  type="email"
                  name="email"
                  required
                  value={duLieu.email}
                  onChange={handleThayDoi}
                  placeholder="example@gmail.com"
                  className="pl-9 pr-3 h-10 text-xs rounded-[6px]"
                />
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Password + Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="regPassword">
                  Mật khẩu <span className="text-[#e30019]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="regPassword"
                    type={hienMatKhau ? 'text' : 'password'}
                    name="password"
                    required
                    value={duLieu.password}
                    onChange={handleThayDoi}
                    placeholder="Tối thiểu 8 ký tự"
                    className={`pl-9 pr-9 h-10 text-xs rounded-[6px] ${
                      matKhauSai
                        ? 'border-red-400 focus:border-red-500'
                        : matKhauHopLe
                        ? 'border-emerald-400 focus:border-emerald-500'
                        : ''
                    }`}
                  />
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setHienMatKhau(!hienMatKhau)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {hienMatKhau ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {matKhauSai && (
                  <p className="text-[10px] text-red-600 font-medium">
                    Ít nhất 8 ký tự, 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="regConfirmPassword">
                  Xác nhận mật khẩu <span className="text-[#e30019]">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="regConfirmPassword"
                    type={hienXacNhan ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={duLieu.confirmPassword}
                    onChange={handleThayDoi}
                    placeholder="Nhập lại mật khẩu"
                    className={`pl-9 pr-9 h-10 text-xs rounded-[6px] ${
                      xacNhanSai
                        ? 'border-red-400 focus:border-red-500'
                        : daBatDauXacNhan && !xacNhanSai
                        ? 'border-emerald-400 focus:border-emerald-500'
                        : ''
                    }`}
                  />
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setHienXacNhan(!hienXacNhan)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {hienXacNhan ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {xacNhanSai && (
                  <p className="text-[10px] text-red-600 font-medium">
                    Mật khẩu xác nhận không khớp
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={dangGui}
              className="w-full h-10 bg-[#e30019] hover:bg-[#c40015] text-white font-bold text-xs rounded-[6px] shadow-xs active:scale-[0.98] transition disabled:opacity-50 mt-1"
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

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <Separator className="flex-1" />
            <span className="shrink-0 mx-3 text-xs text-slate-400 font-medium">
              Hoặc tiếp tục với
            </span>
            <Separator className="flex-1" />
          </div>

          <GoogleLoginButton text="signup_with" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <TikTokLoginButton text="TikTok" />
            <ZaloLoginButton text="Zalo" />
          </div>

          {/* Login Link */}
          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            Đã có tài khoản?{' '}
            <Link
              href="/login"
              className="font-bold text-[#e30019] hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
