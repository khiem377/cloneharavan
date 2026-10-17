import { useState } from 'react';
import { X, Tag as TagIcon, UserCog } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useUpdateSupplier, useSupplierStaffOptions } from '@/hooks/useSuppliers';
import { toast } from '@/providers/ToastProvider';

const MAX_TAGS = 20;

/**
 * Nhân viên phụ trách + Tag của NCC. Lưu ngay khi thay đổi.
 * onSaved(supplier) trả NCC mới nhất để modal cập nhật dữ liệu hiển thị.
 */
export default function SupplierAssignmentCard({ supplier, onSaved }) {
  const canManage = useAuthStore((s) => s.hasPermission)('supplier.manage');
  const updateMut = useUpdateSupplier();
  const { data: staff = [], isLoading: staffLoading } = useSupplierStaffOptions();
  const [tagInput, setTagInput] = useState('');

  const tags = supplier.tags || [];
  const staffId = supplier.assignedStaffId?._id || supplier.assignedStaffId || '';

  const save = async (patch, successMsg) => {
    try {
      const res = await updateMut.mutateAsync({ id: supplier._id, data: patch });
      const saved = res.data?.data;
      if (saved) onSaved?.(saved);
      toast.success(successMsg);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật nhà cung cấp');
    }
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setTagInput('');
      return;
    }
    if (tags.length >= MAX_TAGS) {
      toast.error(`Tối đa ${MAX_TAGS} tag`);
      return;
    }
    setTagInput('');
    save({ tags: [...tags, value] }, 'Đã thêm tag');
  };

  const removeTag = (tag) => save({ tags: tags.filter((t) => t !== tag) }, 'Đã xóa tag');

  const changeStaff = (e) => save({ assignedStaffId: e.target.value || null }, 'Đã cập nhật nhân viên phụ trách');

  return (
    <div className="flex flex-col text-xs divide-y divide-border border-t border-border">
      <div className="py-3 space-y-2">
        <h3 className="font-bold text-foreground flex items-center gap-1.5">
          <UserCog size={14} className="text-primary" /> Nhân viên phụ trách
        </h3>
        <select
          value={staffId}
          onChange={changeStaff}
          disabled={!canManage || updateMut.isPending || staffLoading}
          className="w-full h-8 rounded-[6px] border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
        >
          <option value="">Chưa phân công</option>
          {staff.map((s) => (
            <option key={s._id} value={s._id}>
              {s.fullName || s.email}
            </option>
          ))}
        </select>
      </div>

      <div className="py-3 space-y-2">
        <h3 className="font-bold text-foreground flex items-center gap-1.5">
          <TagIcon size={14} className="text-primary" /> Tag
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {tags.length === 0 && <span className="text-muted-foreground italic">Chưa có tag</span>}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 h-6 rounded-[4px] border border-border bg-muted/50 px-2 text-[11px] text-foreground"
            >
              {tag}
              {canManage && (
                <button
                  type="button"
                  aria-label={`Xóa tag ${tag}`}
                  disabled={updateMut.isPending}
                  onClick={() => removeTag(tag)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))}
        </div>
        {canManage && (
          <input
            type="text"
            value={tagInput}
            maxLength={40}
            disabled={updateMut.isPending}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Nhập tag, nhấn Enter để thêm"
            className="w-full h-8 rounded-[6px] border border-border bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )}
      </div>
    </div>
  );
}
