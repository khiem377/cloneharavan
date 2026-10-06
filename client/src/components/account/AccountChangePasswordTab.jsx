'use client';

import React from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
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
            <p className="text-[11px] text-slate-400">
              Mật khẩu tối thiểu 8 ký tự, khuyến khích có chữ in hoa và chữ số.
            </p>
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
