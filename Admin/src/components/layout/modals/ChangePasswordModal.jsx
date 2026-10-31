import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, X, Lock } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (form.newPassword.length < 6) e.newPassword = 'Tối thiểu 6 ký tự';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[6px] border border-border bg-card p-6 shadow-lg animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Lock size={15} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Đổi mật khẩu quản trị</h3>
          </div>
          <button
            onClick={onClose}
            className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {[
            { key: 'currentPassword', showKey: 'current', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu đang dùng' },
            { key: 'newPassword', showKey: 'next', label: 'Mật khẩu mới', placeholder: 'Tối thiểu 6 ký tự' },
            { key: 'confirmPassword', showKey: 'confirm', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
          ].map(({ key, showKey, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold text-foreground">{label}</label>
              <div className="relative">
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  className="h-9 w-full rounded-[6px] border border-border bg-background px-3 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
                >
                  {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors[key] && <span className="text-[11px] font-medium text-destructive">{errors[key]}</span>}
            </div>
          ))}

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-[6px] text-xs font-semibold"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="h-8 px-3.5 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
              disabled={loading}
            >
              {loading && <Loader2 size={13} className="animate-spin mr-1.5" />}
              <span>Lưu mật khẩu</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
