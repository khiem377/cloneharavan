import { useState } from 'react';
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';
import { cn } from '@/lib/utils';

export default function ChangePasswordTab() {
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passShow, setPassShow] = useState({ current: false, next: false, confirm: false });
  const [passLoading, setPassLoading] = useState(false);
  const [passErrors, setPassErrors] = useState({});

  const validateAdminPassword = (pw) => {
    if (!pw || pw.length < 8) return 'Mật khẩu mới phải có tối thiểu 8 ký tự';
    if (!/[A-Z]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z)';
    if (!/[a-z]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 chữ in thường (a-z)';
    if (!/[0-9]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9)';
    if (!/[^A-Za-z0-9]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)';
    return null;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passForm.currentPassword) errs.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    const pwError = validateAdminPassword(passForm.newPassword);
    if (pwError) errs.newPassword = pwError;
    if (passForm.newPassword !== passForm.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp';

    if (Object.keys(errs).length) {
      setPassErrors(errs);
      return;
    }
    setPassErrors({});
    setPassLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công. Vui lòng ghi nhớ mật khẩu mới!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setPassLoading(false);
    }
  };

  const hasTypedNew = Boolean(passForm.newPassword && passForm.newPassword.length > 0);
  const rules = [
    { label: 'Tối thiểu 8 ký tự', ok: passForm.newPassword.length >= 8 },
    { label: 'Chứa chữ in hoa (A-Z)', ok: /[A-Z]/.test(passForm.newPassword) },
    { label: 'Chứa chữ in thường (a-z)', ok: /[a-z]/.test(passForm.newPassword) },
    { label: 'Chứa chữ số (0-9)', ok: /[0-9]/.test(passForm.newPassword) },
    { label: 'Chứa ký tự đặc biệt (!@#$...)', ok: /[^A-Za-z0-9]/.test(passForm.newPassword) },
  ];
  const passedCount = rules.filter((r) => r.ok).length;

  return (
    <Card className="rounded-[6px] border border-border bg-card shadow-xs">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-bold text-foreground">Bảo mật & Đổi mật khẩu</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Để đảm bảo an toàn, vui lòng sử dụng mật khẩu mạnh có chữ hoa, số và ký tự đặc biệt.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {[
            {
              key: 'currentPassword',
              label: 'Mật khẩu hiện tại *',
              showKey: 'current',
              placeholder: 'Nhập mật khẩu hiện tại',
            },
            {
              key: 'newPassword',
              label: 'Mật khẩu mới *',
              showKey: 'next',
              placeholder: 'Tối thiểu 8 ký tự (hoa, thường, số, ký tự đặc biệt)',
            },
            {
              key: 'confirmPassword',
              label: 'Xác nhận lại mật khẩu mới *',
              showKey: 'confirm',
              placeholder: 'Nhập lại mật khẩu mới',
            },
          ].map(({ key, label, showKey, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">{label}</Label>
              <div className="relative">
                <Input
                  type={passShow[showKey] ? 'text' : 'password'}
                  value={passForm[key]}
                  onChange={(e) => {
                    setPassForm((p) => ({ ...p, [key]: e.target.value }));
                    setPassErrors((p) => ({ ...p, [key]: '' }));
                  }}
                  className={cn(
                    'h-9 rounded-[6px] text-xs pr-9',
                    passErrors[key] && 'border-destructive focus-visible:ring-destructive'
                  )}
                  placeholder={placeholder}
                  required
                />
                <button
                  type="button"
                  onClick={() => setPassShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {passShow[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {passErrors[key] && (
                <p className="text-[11px] font-medium text-destructive">{passErrors[key]}</p>
              )}
            </div>
          ))}

          <div className="rounded-[6px] border border-border bg-muted/20 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                Yêu cầu mật khẩu mới:
              </p>
              {hasTypedNew && (
                <span
                  className={cn(
                    'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] border',
                    passedCount === 5
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : passedCount >= 3
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  )}
                >
                  {passedCount}/5 đạt
                </span>
              )}
            </div>

            {hasTypedNew && (
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    passedCount === 5
                      ? 'bg-emerald-500 w-full'
                      : passedCount >= 3
                      ? 'bg-amber-500 w-3/5'
                      : 'bg-rose-500 w-1/5'
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {rules.map((rule, idx) => {
                const isPass = rule.ok;
                const isFail = hasTypedNew && !rule.ok;

                return (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center gap-1.5 text-[11px] transition-colors',
                      isPass
                        ? 'text-emerald-600 font-medium'
                        : isFail
                        ? 'text-rose-600 font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'size-3.5 rounded-[3px] border flex items-center justify-center shrink-0 transition-colors',
                        isPass
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isFail
                          ? 'bg-rose-50 border-rose-400 text-rose-600'
                          : 'border-border bg-background'
                      )}
                    >
                      {isPass ? (
                        <Check size={10} strokeWidth={3} />
                      ) : isFail ? (
                        <X size={10} strokeWidth={3} />
                      ) : null}
                    </div>
                    <span>{rule.label}</span>
                  </div>
                );
              })}
            </div>

            {passForm.confirmPassword && (
              <div
                className={cn(
                  'pt-1.5 border-t border-border flex items-center gap-1.5 text-[11px] font-medium',
                  passForm.newPassword === passForm.confirmPassword
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                )}
              >
                {passForm.newPassword === passForm.confirmPassword ? (
                  <>
                    <Check size={11} strokeWidth={3} className="text-emerald-500 shrink-0" />
                    <span>Mật khẩu xác nhận trùng khớp</span>
                  </>
                ) : (
                  <>
                    <X size={11} strokeWidth={3} className="text-rose-500 shrink-0" />
                    <span>Mật khẩu xác nhận chưa trùng khớp</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button
              type="submit"
              disabled={passLoading}
              className="h-9 px-5 rounded-[6px] text-xs font-semibold bg-[#e30019] hover:bg-[#c40015] text-white active:scale-[0.98] shadow-xs cursor-pointer"
            >
              {passLoading && <Loader2 size={13} className="animate-spin mr-1.5" />}
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
