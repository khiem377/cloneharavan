import { ShieldCheck } from '@/components/ui/Icons';
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
 * Modal to Create New Staff / Admin Member
 */
export default function StaffCreateModal({
  open,
  onOpenChange,
  createForm,
  setCreateForm,
  onSubmit,
  isPending,
  roles = [],
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[6px] border border-border p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" /> Thêm Nhân Viên / Quản Trị Mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Họ và tên *</label>
            <Input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              className="h-9 rounded-[6px] text-xs font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Email đăng nhập *</label>
              <Input
                type="email"
                required
                placeholder="staff@company.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="h-9 rounded-[6px] text-xs font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Số điện thoại</label>
              <Input
                type="tel"
                placeholder="0912345678"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                className="h-9 rounded-[6px] text-xs font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Mật khẩu ban đầu *</label>
              <Input
                type="password"
                required
                minLength={8}
                placeholder="Tối thiểu 8 ký tự (hoa, thường, số, ký tự đặc biệt)"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="h-9 rounded-[6px] text-xs font-sans"
              />
              {createForm.password && !validateStaffPassword(createForm.password) && (
                <p className="text-[10px] text-destructive font-medium">
                  Ít nhất 8 ký tự, 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Vai trò phân quyền *</label>
              <select
                value={createForm.roleId}
                onChange={(e) => setCreateForm({ ...createForm, roleId: e.target.value })}
                className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs outline-none focus:border-ring transition-colors cursor-pointer"
              >
                <option value="">-- Mặc định: Nhân viên vận hành --</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2 bg-transparent">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-[6px] text-xs cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-8 rounded-[6px] text-xs active:scale-[0.98] transition-transform cursor-pointer"
            >
              {isPending ? 'Đang tạo...' : 'Tạo Nhân Viên'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
