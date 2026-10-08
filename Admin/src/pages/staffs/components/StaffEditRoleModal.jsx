import React from 'react';
import { Shield } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

/**
 * Modal to change Staff Role
 */
export default function StaffEditRoleModal({
  user,
  onClose,
  roles = [],
  selectedRoleId,
  setSelectedRoleId,
  onSave,
  isPending,
}) {
  return (
    <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md rounded-[6px] border border-border p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Shield size={18} className="text-primary" /> Thay Đổi Vai Trò
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-xs">
            <p className="text-muted-foreground mb-1">
              Nhân viên: <strong className="text-foreground">{user?.fullName || user?.email}</strong>
            </p>
            <p className="text-muted-foreground font-mono">
              Email: <span className="text-foreground">{user?.email}</span>
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Chọn vai trò hệ thống mới:</label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs outline-none focus:border-ring transition-colors cursor-pointer"
            >
              <option value="">-- Chọn vai trò --</option>
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2 bg-transparent">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-[6px] text-xs cursor-pointer"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isPending}
            className="h-8 rounded-[6px] text-xs active:scale-[0.98] transition-transform cursor-pointer"
          >
            {isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
