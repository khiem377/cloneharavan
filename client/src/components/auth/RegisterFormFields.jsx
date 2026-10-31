import React from 'react';
import { User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterFormFields({
  duLieu,
  handleThayDoi,
  hienMatKhau,
  setHienMatKhau,
  hienXacNhan,
  setHienXacNhan,
  matKhauSai,
  matKhauHopLe,
  xacNhanSai,
  daBatDauXacNhan,
}) {
  return (
    <>
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
              className={`pl-9 pr-9 h-10 text-xs rounded-[6px] ${matKhauSai
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
              className={`pl-9 pr-9 h-10 text-xs rounded-[6px] ${xacNhanSai
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
    </>
  );
}
