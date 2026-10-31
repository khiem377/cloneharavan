'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import authService from '@/services/auth.service';
import { useToast } from '@/components/ui/toast';

export default function PasswordModal({
  open,
  isOpen,
  onOpenChange,
  onClose,
  isSetPassword = false,
  onSuccess,
}) {
  const isModalOpen = Boolean(isOpen !== undefined ? isOpen : open);
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(true);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isModalOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLogoutOtherDevices(true);
      setErrorMsg(null);
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isModalOpen]);

  const rules = [
    { label: 'Tối thiểu 8 ký tự', ok: newPassword.length >= 8 },
    { label: 'Chữ in hoa (A-Z)', ok: /[A-Z]/.test(newPassword) },
    { label: 'Chữ in thường (a-z)', ok: /[a-z]/.test(newPassword) },
    { label: 'Chữ số (0-9)', ok: /[0-9]/.test(newPassword) },
    { label: 'Ký tự đặc biệt (!@#$...)', ok: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const passedRulesCount = rules.filter((r) => r.ok).length;

  const getStrengthData = () => {
    if (!newPassword) return { bars: 0, text: 'Chưa nhập', color: 'bg-slate-200', textColor: 'text-slate-400' };
    if (passedRulesCount <= 2) {
      return { bars: 1, text: 'Yếu', color: 'bg-rose-500', textColor: 'text-rose-600' };
    }
    if (passedRulesCount === 3) {
      return { bars: 2, text: 'Trung bình', color: 'bg-amber-500', textColor: 'text-amber-600' };
    }
    if (passedRulesCount === 4) {
      return { bars: 3, text: 'Khá', color: 'bg-blue-500', textColor: 'text-blue-600' };
    }
    return { bars: 4, text: 'Mạnh', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
  };

  const strength = getStrengthData();
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isFormValid =
    newPassword.length >= 8 &&
    isMatch &&
    (isSetPassword || currentPassword.length > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    if (!isSetPassword && !currentPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    setLoading(true);
    try {
      if (isSetPassword) {
        const res = await authService.setPassword({
          newPassword,
          confirmPassword,
        });
        toast.success(res?.message || 'Tạo mật khẩu thành công!');
      } else {
        const res = await authService.changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
          logoutOtherDevices,
        });
        toast.success(res?.message || 'Đổi mật khẩu thành công!');
      }

      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Có lỗi xảy ra khi thực hiện. Vui lòng kiểm tra lại thông tin!';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(val) => !val && !loading && handleClose()}>
      <DialogContent className="max-w-md p-0 rounded-[6px] overflow-hidden">
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-100 bg-white">
          <DialogTitle className="text-sm font-bold text-slate-900">
            {isSetPassword ? 'Tạo mật khẩu' : 'Đổi mật khẩu'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isSetPassword
              ? 'Thiết lập mật khẩu riêng để đăng nhập bằng email hoặc số điện thoại'
              : 'Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {errorMsg && (
            <Alert variant="destructive" className="py-2 px-3 text-xs rounded-[6px]">
              <AlertCircle className="size-4 shrink-0" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {!isSetPassword && (
            <div className="space-y-1">
              <Label htmlFor="curr-pass" className="text-xs font-medium text-slate-700">
                Mật khẩu hiện tại
              </Label>
              <div className="relative">
                <Input
                  id="curr-pass"
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="h-9 pr-9 rounded-[6px] text-xs bg-white border-slate-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="new-pass" className="text-xs font-medium text-slate-700">
              Mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="new-pass"
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                className="h-9 pr-9 rounded-[6px] text-xs bg-white border-slate-200"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
            </div>

            {newPassword && (
              <div className="pt-1.5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Độ mạnh:</span>
                  <span className={`font-medium ${strength.textColor}`}>{strength.text}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1 w-full">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-colors ${
                        step <= strength.bars ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm-pass" className="text-xs font-medium text-slate-700">
              Nhập lại mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="confirm-pass"
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className={`h-9 pr-9 rounded-[6px] text-xs bg-white border-slate-200 ${
                  confirmPassword && !isMatch ? 'border-rose-400' : ''
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
            </div>
            {confirmPassword && !isMatch && (
              <p className="text-[11px] text-rose-500 font-medium">
                Mật khẩu nhập lại chưa khớp.
              </p>
            )}
          </div>

          <div className="rounded-[6px] border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Yêu cầu mật khẩu:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 ${
                    rule.ok ? 'text-emerald-700 font-medium' : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`size-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      rule.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {rule.ok ? (
                      <Check size={9} strokeWidth={3} />
                    ) : (
                      <span className="size-1 rounded-full bg-slate-400" />
                    )}
                  </div>
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>

          {!isSetPassword && (
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="logout-other-devices"
                checked={logoutOtherDevices}
                onCheckedChange={setLogoutOtherDevices}
              />
              <Label
                htmlFor="logout-other-devices"
                className="text-xs text-slate-600 font-normal leading-none cursor-pointer"
              >
                Đăng xuất khỏi tất cả các thiết bị khác sau khi hoàn tất
              </Label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="h-8 px-4 text-xs rounded-[6px] border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !isFormValid}
              className="h-8 px-4 text-xs rounded-[6px] bg-slate-900 hover:bg-slate-800 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin mr-1.5" />
                  Đang lưu...
                </>
              ) : isSetPassword ? (
                'Tạo mật khẩu'
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
