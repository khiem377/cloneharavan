import React, { useState } from 'react';
import { X, Loader2, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function InviteMemberModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Vui lòng nhập địa chỉ email người được mời.');
      return;
    }

    // Basic email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Địa chỉ email không đúng định dạng.');
      return;
    }

    try {
      setLoading(true);
      // Giả lập gửi email mời hoặc gọi API backend
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success(`Đã gửi lời mời tham gia workspace tới ${email.trim()}`);
      setEmail('');
      onSuccess?.();
      onClose?.();
    } catch {
      toast.error('Không thể gửi lời mời. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[6px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Mời thành viên
            </h3>
            <p className="text-xs text-slate-500">
              Người được mời sẽ nhận email kèm liên kết để vào workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 inline-flex items-center justify-center rounded-[6px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Field: Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Email
            </label>
            <input
              type="text"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email người được mời"
              className="h-10 w-full rounded-[6px] border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-colors"
            />
            <span className="text-[11px] text-slate-400">
              Gõ xong bấm Enter để thêm. Dán được cả danh sách.
            </span>
          </div>

          {/* Field: Vai trò */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Vai trò
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 w-full appearance-none rounded-[6px] border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-colors cursor-pointer"
              >
                <option value="member">Thành viên</option>
                <option value="admin">Quản trị viên</option>
                <option value="inventory">Nhân viên kho vận</option>
                <option value="accountant">Kế toán viên</option>
                <option value="cskh">Chăm sóc khách hàng</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 mt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-[6px] px-4 h-9 text-xs font-medium cursor-pointer"
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={loading}
              className="rounded-[6px] px-5 h-9 text-xs font-medium cursor-pointer"
            >
              Gửi lời mời
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
