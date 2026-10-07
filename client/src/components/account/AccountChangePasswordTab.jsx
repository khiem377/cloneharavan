'use client';

import React from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ShieldCheck, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';

export default function AccountChangePasswordTab({
  passwordForm,
  setPasswordForm,
  showPassword,
  setShowPassword,
  passwordLoading,
  passwordMessage,
  handleChangePassword,
}) {
  const newPw = passwordForm.newPassword || '';
  const rules = [
    { label: 'Tối thiểu 8 ký tự', ok: newPw.length >= 8 },
    { label: 'Chữ in hoa (A-Z)', ok: /[A-Z]/.test(newPw) },
    { label: 'Chữ in thường (a-z)', ok: /[a-z]/.test(newPw) },
    { label: 'Chữ số (0-9)', ok: /[0-9]/.test(newPw) },
    { label: 'Ký tự đặc biệt (!@#$...)', ok: /[^A-Za-z0-9]/.test(newPw) },
  ];
  const isFormValid = rules.every((r) => r.ok) && newPw === passwordForm.confirmPassword && passwordForm.currentPassword;

  return (
    <Card className="animate-fadeIn">
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>
          Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
        </CardDescription>
      </CardHeader>
      <Separator className="mb-5" />

      <CardContent className="space-y-4">
        {passwordMessage && (
          <Alert variant={passwordMessage.type === 'success' ? 'success' : 'destructive'}>
            {passwordMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{passwordMessage.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">
              Mật khẩu hiện tại <span className="text-[#e30019]">*</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
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
                className="h-9 pr-10 rounded-[6px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  setShowPassword({
                    ...showPassword,
                    current: !showPassword.current,
                  })
                }
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 h-7 w-7"
              >
                {showPassword.current ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">
              Mật khẩu mới <span className="text-[#e30019]">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
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
                className="h-9 pr-10 rounded-[6px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  setShowPassword({
                    ...showPassword,
                    new: !showPassword.new,
                  })
                }
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 h-7 w-7"
              >
                {showPassword.new ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
            </div>
          </div>

          {/* Password Checklist */}
          <div className="rounded-[6px] border border-slate-200 bg-slate-50/50 p-3 space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Yêu cầu mật khẩu an toàn:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 text-[11px] ${
                    rule.ok ? 'text-emerald-600 font-medium' : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center shrink-0 ${
                      rule.ok
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {rule.ok && <Check size={10} />}
                  </div>
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">
              Xác nhận mật khẩu mới <span className="text-[#e30019]">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
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
                className="h-9 pr-10 rounded-[6px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  setShowPassword({
                    ...showPassword,
                    confirm: !showPassword.confirm,
                  })
                }
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 h-7 w-7"
              >
                {showPassword.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={passwordLoading}
              className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs rounded-[6px] h-9 px-6 shadow-xs active:scale-[0.98] disabled:opacity-50"
            >
              {passwordLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
