import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, Copy, Check, TicketPercent } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useToggleCouponStatus,
  useDeleteCoupon,
  useDeleteBulkCoupons,
} from '@/hooks/useCoupons';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
import CurrencyInput from '@/components/ui/CurrencyInput';

function formatCurrency(n) {
  if (!n && n !== 0) return '0đ';
  return n.toLocaleString('vi-VN') + 'đ';
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'GIAM';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const DEFAULT_FORM = {
  name: '',
  code: '',
  description: '',
  type: 'percent',
  value: 10,
  maxDiscount: '',
  minOrderValue: 0,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  isActive: true,
  usageLimit: '',
};

export default function CouponPage() {
  const [keyword, setKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const params = {
    keyword,
    isActive: filterStatus || undefined,
    page,
    limit,
  };

  const res = useCoupons(params);
  const couponData = res.data;
  const coupons = couponData?.data ?? [];
  const pagination = couponData?.pagination;
  const isLoading = res.isLoading;

  const createMut = useCreateCoupon();
  const updateMut = useUpdateCoupon();
  const toggleMut = useToggleCouponStatus();
  const deleteMut = useDeleteCoupon();
  const bulkDeleteMut = useDeleteBulkCoupons();

  const openCreate = () => {
    setEditTarget(null);
    setForm({
      ...DEFAULT_FORM,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    });
    setShowForm(true);
  };

  const openEdit = (coupon) => {
    setEditTarget(coupon);
    setForm({
      name: coupon.name,
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount ?? '',
      minOrderValue: coupon.minOrderValue ?? 0,
      startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
      endDate: new Date(coupon.endDate).toISOString().slice(0, 16),
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit ?? '',
    });
    setShowForm(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggle = (coupon) => {
    toggleMut.mutate(
      { id: coupon._id, isActive: !coupon.isActive },
      {
        onSuccess: () => toast.success('Cập nhật trạng thái thành công'),
        onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
      }
    );
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên mã giảm giá');
    if (!editTarget && !form.code.trim()) return toast.error('Vui lòng nhập mã code');
    if (!form.value || Number(form.value) <= 0) return toast.error('Giá trị giảm phải lớn hơn 0');
    if (form.type === 'percent' && Number(form.value) > 100) return toast.error('Phần trăm giảm tối đa 100%');
    if (new Date(form.endDate) <= new Date(form.startDate)) return toast.error('Ngày kết thúc phải sau ngày bắt đầu');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      value: Number(form.value),
      maxDiscount: form.type === 'percent' && form.maxDiscount !== '' ? Number(form.maxDiscount) : null,
      minOrderValue: Number(form.minOrderValue || 0),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      isActive: form.isActive,
      usageLimit: form.usageLimit !== '' ? Number(form.usageLimit) : null,
    };

    if (!editTarget) {
      payload.code = form.code.trim().toUpperCase();
      createMut.mutate(payload, {
        onSuccess: () => {
          toast.success('Tạo mã giảm giá thành công');
          setShowForm(false);
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Không thể tạo mã giảm giá'),
      });
    } else {
      updateMut.mutate(
        { id: editTarget._id, data: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật mã giảm giá thành công');
            setShowForm(false);
          },
          onError: (e) => toast.error(e.response?.data?.message || 'Không thể cập nhật'),
        }
      );
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget._id, {
      onSuccess: () => {
        toast.success('Đã xóa mã giảm giá');
        setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget._id));
        setDeleteTarget(null);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Không thể xóa'),
    });
  };

  const confirmBulkDelete = () => {
    bulkDeleteMut.mutate(selectedIds, {
      onSuccess: () => {
        toast.success(`Đã xóa ${selectedIds.length} mã giảm giá`);
        setSelectedIds([]);
        setBulkDeleteConfirm(false);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Không thể xóa'),
    });
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === coupons.length ? [] : coupons.map((c) => c._id));

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TicketPercent className="size-6 text-primary" />
            Mã giảm giá
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý và tạo mới các mã voucher giảm giá cho khách hàng
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Thêm mã giảm giá
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            className="h-9 w-full sm:w-72 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
            placeholder="Tìm theo tên hoặc mã code..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-ring cursor-pointer"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Tắt</option>
          </select>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={() => setBulkDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 h-9 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            Xóa {selectedIds.length} mã
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span>Đang tải danh sách mã...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground gap-2">
            <TicketPercent className="size-10 text-muted-foreground/40" />
            <p className="text-sm">Chưa có mã giảm giá nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input cursor-pointer"
                      checked={coupons.length > 0 && selectedIds.length === coupons.length}
                      ref={(el) => {
                        if (el) el.indeterminate = selectedIds.length > 0 && selectedIds.length < coupons.length;
                      }}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3">TÊN VOUCHER</th>
                  <th className="px-4 py-3">MÃ CODE</th>
                  <th className="px-4 py-3">GIÁ TRỊ GIẢM</th>
                  <th className="px-4 py-3">ĐƠN TỐI THIỂU</th>
                  <th className="px-4 py-3">LƯỢT SỬ DỤNG</th>
                  <th className="px-4 py-3">THỜI HẠN</th>
                  <th className="px-4 py-3">TRẠNG THÁI</th>
                  <th className="px-4 py-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {coupons.map((item) => {
                  const now = new Date();
                  const isExpired = new Date(item.endDate) < now;
                  const isNotStarted = new Date(item.startDate) > now;

                  return (
                    <tr
                      key={item._id}
                      className={`transition-colors hover:bg-muted/40 ${selectedIds.includes(item._id) ? 'bg-muted/60' : ''}`}
                    >
                      <td className="px-3 py-3 align-middle">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input cursor-pointer"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => toggleSelect(item._id)}
                        />
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{item.name}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 border border-border/60 font-mono text-xs font-bold text-foreground">
                          {item.code}
                          <button
                            onClick={() => handleCopyCode(item.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Sao chép"
                          >
                            {copiedCode === item.code ? (
                              <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.type === 'percent' ? `Giảm ${item.value}%` : `Giảm ${formatCurrency(item.value)}`}
                          </span>
                          {item.type === 'percent' && item.maxDiscount && (
                            <span className="text-[11px] text-muted-foreground">
                              Tối đa: {formatCurrency(item.maxDiscount)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-middle font-medium text-foreground">
                        {item.minOrderValue > 0 ? formatCurrency(item.minOrderValue) : '0đ (Tất cả)'}
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <span className="text-xs font-medium text-foreground">
                          {item.usedCount} {item.usageLimit ? `/ ${item.usageLimit}` : '(Không giới hạn)'}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle text-xs text-muted-foreground whitespace-nowrap">
                        <div>{formatDate(item.startDate)}</div>
                        <div>đến {formatDate(item.endDate)}</div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        {isExpired ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                            Hết hạn
                          </span>
                        ) : isNotStarted ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Chưa diễn ra
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                              item.isActive
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {item.isActive ? 'Đang hoạt động' : 'Tắt'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                            title="Sửa"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                            title={item.isActive ? 'Tắt' : 'Bật'}
                            onClick={() => handleToggle(item)}
                          >
                            {item.isActive ? (
                              <ToggleRight size={15} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ToggleLeft size={15} />
                            )}
                          </button>
                          <button
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                            title="Xóa"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <DataTablePagination
          page={page}
          pageSize={limit}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 1}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
        />
      </div>

      {/* Modal Create / Edit Form */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4 font-semibold text-foreground">
              <h2 className="text-base font-semibold text-foreground">
                {editTarget ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá'}
              </h2>
              <button
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-lg font-bold"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-5 p-5 overflow-y-auto max-h-[80vh]">
              {/* Thông tin cơ bản */}
              <div className="flex flex-col gap-3 rounded-lg border border-border p-4 bg-muted/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Tên chương trình / mã <span className="text-destructive">*</span>
                  </label>
                  <input
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                    placeholder="VD: Giảm 15% mừng khai trương"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Mã Code <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      disabled={!!editTarget}
                      className="h-9 flex-1 rounded-md border border-input bg-background px-3 font-mono text-sm font-bold uppercase text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors disabled:opacity-60"
                      placeholder="VD: GIAM15K"
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    />
                    {!editTarget && (
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, code: generateRandomCode() }))}
                        className="h-9 rounded-md border border-input bg-muted px-3 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
                      >
                        Tạo mã
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Mô tả</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                    rows={2}
                    placeholder="Mô tả ngắn gọn về ưu đãi..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* Cấu hình khuyến mãi */}
              <div className="flex flex-col gap-3 rounded-lg border border-border p-4 bg-muted/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cấu hình khuyến mãi</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Loại giảm giá</label>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring cursor-pointer"
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    >
                      <option value="percent">Giảm theo phần trăm (%)</option>
                      <option value="fixed">Giảm số tiền cố định (đ)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Giá trị giảm ({form.type === 'percent' ? '%' : 'VNĐ'}) <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={form.type === 'percent' ? 100 : undefined}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring transition-colors"
                      value={form.value}
                      onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    />
                  </div>
                </div>

                {form.type === 'percent' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Giới hạn giảm tối đa (VNĐ) <span className="text-muted-foreground font-normal">(Để trống nếu không giới hạn)</span>
                    </label>
                    <input
                      type="number"
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring transition-colors"
                      placeholder="VD: 150000"
                      value={form.maxDiscount}
                      onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Điều kiện & Giới hạn */}
              <div className="flex flex-col gap-3 rounded-lg border border-border p-4 bg-muted/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Điều kiện & Giới hạn</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Giá trị đơn tối thiểu (VNĐ)</label>
                    <input
                      type="number"
                      min={0}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring transition-colors"
                      placeholder="0đ"
                      value={form.minOrderValue}
                      onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Tổng số lượt sử dụng <span className="text-muted-foreground font-normal">(Để trống = không giới hạn)</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring transition-colors"
                      placeholder="Không giới hạn"
                      value={form.usageLimit}
                      onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Thời gian & Trạng thái */}
              <div className="flex flex-col gap-3 rounded-lg border border-border p-4 bg-muted/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thời gian & Trạng thái</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Ngày bắt đầu <span className="text-destructive">*</span></label>
                    <input
                      type="datetime-local"
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring transition-colors cursor-pointer"
                      value={form.startDate}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Ngày kết thúc <span className="text-destructive">*</span></label>
                    <input
                      type="datetime-local"
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring transition-colors cursor-pointer"
                      value={form.endDate}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="couponIsActive"
                    className="size-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <label htmlFor="couponIsActive" className="text-xs font-medium text-foreground cursor-pointer select-none">
                    Kích hoạt mã ngay sau khi tạo
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4 bg-muted/30">
              <button
                type="button"
                className="h-9 rounded-md border border-input bg-background px-4 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
                onClick={() => setShowForm(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={createMut.isPending || updateMut.isPending}
                onClick={handleSubmit}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {(createMut.isPending || updateMut.isPending) && <Loader2 size={14} className="animate-spin" />}
                {editTarget ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa mã giảm giá"
        description={`Bạn có chắc muốn xóa mã "${deleteTarget?.code}" không? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMut.isPending}
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Xóa ${selectedIds.length} mã giảm giá`}
        description={`Bạn có chắc muốn xóa ${selectedIds.length} mã giảm giá đã chọn không? Hành động này không thể hoàn tác.`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        loading={bulkDeleteMut.isPending}
      />
    </div>
  );
}
