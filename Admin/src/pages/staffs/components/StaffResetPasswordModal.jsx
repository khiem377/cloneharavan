import { KeyRound } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const validateStaffPassword = (pw) => {
  if (!pw || pw.length < 8) return false;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return hasUpper && hasLower && hasDigit && hasSpecial;
};

/**
 * Modal to Reset Password for Staff
 */
export default function StaffResetPasswordModal({
  user,
  onClose,
  newPassword,
  setNewPassword,
  onSubmit,
  isPending,
}) {
  return (
    <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md rounded-[6px] border border-border p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <KeyRound size={18} className="text-primary" /> Đặt Lại Mật Khẩu Nhân Viên
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="p-3 rounded-[6px] border border-amber-500/20 bg-amber-500/5 text-xs text-amber-700 dark:text-amber-400">
            Lưu ý: Sau khi đổi mật khẩu, toàn bộ phiên đăng nhập hiện tại của nhân viên trên mọi thiết bị sẽ bị hủy ngay lập tức qua SSE.
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Tài khoản:</span>
            <span className="font-semibold text-foreground font-mono">
              {user?.fullName} ({user?.email})
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Mật khẩu mới (tối thiểu 8 ký tự, gồm hoa, thường, số, ký tự đặc biệt):
            </label>
            <Input
              type="password"
              required
              minLength={8}
              placeholder="Nhập mật khẩu mới..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-9 rounded-[6px] text-xs font-sans"
            />
            {newPassword && !validateStaffPassword(newPassword) && (
              <p className="text-[10px] text-destructive font-medium">
                Tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
              </p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2 bg-transparent">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-[6px] text-xs cursor-pointer"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !validateStaffPassword(newPassword)}
              className="h-8 rounded-[6px] text-xs active:scale-[0.98] transition-transform cursor-pointer"
            >
              {isPending ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
