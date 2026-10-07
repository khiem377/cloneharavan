'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, AlertCircle, Loader2, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import authService from '@/services/auth.service';
import { useToast } from '../ui/toast';

export default function PasswordModal({
  open,
  onOpenChange,
  isSetPassword = false,
  onSuccess,
}) {
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

  // Reset form khi mở modal
  useEffect(() => {
    if (open) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLogoutOtherDevices(true);
      setErrorMsg(null);
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open]);

  // Các tiêu chí an toàn mật khẩu
  const rules = [
    { label: 'Tối thiểu 8 ký tự', ok: newPassword.length >= 8 },
    { label: 'Chữ in hoa (A-Z)', ok: /[A-Z]/.test(newPassword) },
    { label: 'Chữ in thường (a-z)', ok: /[a-z]/.test(newPassword) },
    { label: 'Chữ số (0-9)', ok: /[0-9]/.test(newPassword) },
    { label: 'Ký tự đặc biệt (!@#$...)', ok: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const passedRulesCount = rules.filter((r) => r.ok).length;

  // Thanh đo độ mạnh tối giản (1 - 4 vạch)
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
      onOpenChange(false);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={() => !loading && onOpenChange(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-[6px] border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-slate-900">
              {isSetPassword ? 'Tạo mật khẩu' : 'Đổi mật khẩu'}
            </h3>
            <p className="text-xs text-slate-500">
              {isSetPassword
                ? 'Thiết lập mật khẩu riêng để đăng nhập bằng email hoặc số điện thoại'
                : 'Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-7 h-7 rounded-[4px] border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition active:scale-[0.98]"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <Alert variant="destructive" className="py-2 px-3 text-xs rounded-[6px]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Mật khẩu hiện tại (chỉ khi đổi mật khẩu) */}
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
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer transition"
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Mật khẩu mới */}
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
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer transition"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Thanh đo độ mạnh mật khẩu */}
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

          {/* Xác nhận mật khẩu */}
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
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer transition"
              >
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {confirmPassword && !isMatch && (
              <p className="text-[11px] text-rose-500 font-medium">
                Mật khẩu nhập lại chưa khớp.
              </p>
            )}
          </div>

          {/* Tiêu chí mật khẩu */}
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
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      rule.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {rule.ok ? (
                      <Check size={9} strokeWidth={3} />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                    )}
                  </div>
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkbox đăng xuất thiết bị khác */}
          {!isSetPassword && (
            <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={logoutOtherDevices}
                onChange={(e) => setLogoutOtherDevices(e.target.checked)}
                className="mt-0.5 rounded-[3px] border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-snug">
                Đăng xuất khỏi tất cả các thiết bị khác sau khi hoàn tất
              </span>
            </label>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-8 px-4 text-xs rounded-[6px] border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-[0.98]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !isFormValid}
              className="h-8 px-4 text-xs rounded-[6px] bg-slate-900 hover:bg-slate-800 text-white font-semibold active:scale-[0.98] transition-transform"
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
      </div>
    </div>
  );
}
