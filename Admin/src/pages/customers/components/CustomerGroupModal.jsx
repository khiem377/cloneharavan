import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, X, Sparkles, UserCheck } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { useCreateCustomerGroup, useUpdateCustomerGroup } from '@/hooks/useCustomerGroups';

const COLOR_OPTIONS = [
  { id: 'blue', label: 'Xanh dương', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { id: 'emerald', label: 'Xanh lục', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { id: 'amber', label: 'Vàng cam', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { id: 'purple', label: 'Tím', class: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  { id: 'rose', label: 'Đỏ hồng', class: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  { id: 'slate', label: 'Xám', class: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
];

const FIELD_OPTIONS = [
  { value: 'totalSpent', label: 'Tổng tiền chi tiêu (VNĐ)' },
  { value: 'orderCount', label: 'Số đơn hàng hoàn tất' },
  { value: 'createdAtDays', label: 'Số ngày từ lúc đăng ký' },
];

const OPERATOR_OPTIONS = [
  { value: 'gte', label: '>= (Lớn hơn hoặc bằng)' },
  { value: 'lte', label: '<= (Nhỏ hơn hoặc bằng)' },
  { value: 'eq', label: '= (Bằng)' },
];

export default function CustomerGroupModal({ isOpen, onClose, group = null }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('automatic');
  const [color, setColor] = useState('blue');
  const [conditionLogic, setConditionLogic] = useState('AND');
  const [conditions, setConditions] = useState([
    { field: 'totalSpent', operator: 'gte', value: 2000000 },
  ]);

  const createMut = useCreateCustomerGroup();
  const updateMut = useUpdateCustomerGroup();

  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setCode(group.code || '');
      setDescription(group.description || '');
      setType(group.type || 'manual');
      setColor(group.color || 'blue');
      setConditionLogic(group.conditionLogic || 'AND');
      setConditions(group.conditions?.length ? group.conditions : [{ field: 'totalSpent', operator: 'gte', value: 1000000 }]);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setType('automatic');
      setColor('blue');
      setConditionLogic('AND');
      setConditions([{ field: 'totalSpent', operator: 'gte', value: 2000000 }]);
    }
  }, [group, isOpen]);

  if (!isOpen) return null;

  const handleAddCondition = () => {
    setConditions((prev) => [...prev, { field: 'orderCount', operator: 'gte', value: 1 }]);
  };

  const handleRemoveCondition = (idx) => {
    setConditions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConditionChange = (idx, key, val) => {
    setConditions((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [key]: key === 'value' ? Number(val) || 0 : val } : c))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Vui lòng nhập tên nhóm khách hàng');
    if (!code.trim()) return toast.error('Vui lòng nhập mã nhóm');

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      type,
      color,
      conditionLogic,
      conditions: type === 'automatic' ? conditions : [],
    };

    try {
      if (group?._id) {
        await updateMut.mutateAsync({ id: group._id, data: payload });
        toast.success('Cập nhật nhóm khách hàng thành công');
      } else {
        await createMut.mutateAsync(payload);
        toast.success('Tạo nhóm khách hàng thành công');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi lưu nhóm khách hàng');
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="flex w-full max-w-xl flex-col overflow-hidden rounded-[6px] border border-border bg-card shadow-xl text-foreground">
        <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            {group ? 'Cập nhật nhóm khách hàng' : 'Thêm mới nhóm khách hàng'}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-[4px]" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
            {/* Tên và Mã */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Tên nhóm <span className="text-destructive">*</span></label>
                <Input
                  className="h-8 rounded-[6px] text-xs"
                  placeholder="VD: Khách hàng VIP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Mã nhóm <span className="text-destructive">*</span></label>
                <Input
                  className="h-8 rounded-[6px] text-xs font-mono uppercase"
                  placeholder="VD: VIP"
                  value={code}
                  disabled={!!group}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            {/* Cơ chế nhóm */}
            <div className="flex flex-col gap-2 p-3 rounded-[6px] border border-border bg-muted/20">
              <label className="text-xs font-medium">Cơ chế phân nhóm</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('automatic')}
                  className={`flex items-center gap-2 p-2 rounded-[6px] border text-left text-xs font-medium transition-all ${
                    type === 'automatic'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="size-4 shrink-0" />
                  <div>
                    <div>Tự động (Smart Rule)</div>
                    <div className="text-[10px] opacity-75 font-normal">Quét & gán theo chi tiêu, số đơn</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setType('manual')}
                  className={`flex items-center gap-2 p-2 rounded-[6px] border text-left text-xs font-medium transition-all ${
                    type === 'manual'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserCheck className="size-4 shrink-0" />
                  <div>
                    <div>Thủ công (Manual)</div>
                    <div className="text-[10px] opacity-75 font-normal">Tự gán khách hàng vào nhóm</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Điều kiện tự động */}
            {type === 'automatic' && (
              <div className="flex flex-col gap-3 p-3 rounded-[6px] border border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Điều kiện lọc thành viên
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground text-[11px]">Logic:</span>
                    <select
                      value={conditionLogic}
                      onChange={(e) => setConditionLogic(e.target.value)}
                      className="h-6 rounded-[4px] border border-input bg-background px-1.5 text-[11px] font-semibold"
                    >
                      <option value="AND">AND (Thỏa mãn tất cả)</option>
                      <option value="OR">OR (Thỏa mãn một trong)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={cond.field}
                        onChange={(e) => handleConditionChange(idx, 'field', e.target.value)}
                        className="h-8 flex-1 rounded-[6px] border border-input bg-background px-2 text-xs"
                      >
                        {FIELD_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <select
                        value={cond.operator}
                        onChange={(e) => handleConditionChange(idx, 'operator', e.target.value)}
                        className="h-8 w-32 rounded-[6px] border border-input bg-background px-2 text-xs"
                      >
                        {OPERATOR_OPTIONS.map((op) => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        min={0}
                        value={cond.value}
                        onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                        className="h-8 w-28 rounded-[6px] text-xs font-mono tabular-nums"
                      />
                      {conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCondition(idx)}
                          className="h-8 w-8 text-destructive rounded-[6px]"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCondition}
                  className="h-7 text-xs self-start gap-1 rounded-[6px]"
                >
                  <Plus className="size-3" />
                  Thêm điều kiện
                </Button>
              </div>
            )}

            {/* Màu huy hiệu */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Màu sắc hiển thị</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-medium border transition-all ${c.class} ${
                      color === c.id ? 'ring-2 ring-primary ring-offset-1 font-bold' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mô tả */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Mô tả nhóm</label>
              <textarea
                rows={2}
                className="w-full rounded-[6px] border border-input bg-background p-2 text-xs outline-none focus:border-ring resize-none"
                placeholder="Ghi chú về nhóm đối tượng này..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="p-3 border-t border-border flex justify-end gap-2 bg-muted/10">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 rounded-[6px]">
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="h-8 rounded-[6px]">
              {isPending ? 'Đang lưu...' : group ? 'Lưu thay đổi' : 'Tạo nhóm'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
