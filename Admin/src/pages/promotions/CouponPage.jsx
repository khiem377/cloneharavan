import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, Copy, Check, TicketPercent } from '@/components/ui/Icons';
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
import DateTimePicker from '@/components/ui/DateTimePicker';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { useSearchParams } from 'react-router-dom';

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
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [keyword, setKeyword] = useState(initialSearch);
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
      maxDiscount: coupon.maxDiscount || '',
      minOrderValue: coupon.minOrderValue || 0,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : '',
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit || '',
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
        onSuccess: () => toast.success('Đã cập nhật trạng thái'),
        onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
      }
    );
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên chương trình');
    if (!form.code.trim()) return toast.error('Vui lòng nhập mã code');
    if (Number(form.value) <= 0) return toast.error('Giá trị giảm phải lớn hơn 0');
    if (form.type === 'percent' && Number(form.value) > 100)
      return toast.error('Giảm theo phần trăm không được vượt quá 100%');

    const payload = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      value: Number(form.value),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      minOrderValue: Number(form.minOrderValue || 0),
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
    };

    if (editTarget) {
      updateMut.mutate(
        { id: editTarget._id, data: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật mã giảm giá thành công');
            setShowForm(false);
          },
          onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
        }
      );
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          toast.success('Tạo mã giảm giá thành công');
          setShowForm(false);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
      });
    }
  };

  const confirmDelete = () => {
    deleteMut.mutate(deleteTarget._id, {
      onSuccess: () => {
        toast.success('Đã xóa mã giảm giá');
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
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TicketPercent className="size-5 text-primary" />
            Mã giảm giá (Coupons)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý và thiết lập các mã voucher giảm giá cho khách hàng
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
        >
          <Plus size={15} className="mr-1" /> Thêm mã giảm giá
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[6px] border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <Input
            className="h-8 w-full sm:w-64 rounded-[6px] text-xs"
            placeholder="Tìm theo tên hoặc mã code..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="h-8 rounded-[6px] border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
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
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteConfirm(true)}
            className="h-8 px-3 rounded-[6px] text-xs font-semibold"
          >
            <Trash2 size={13} className="mr-1" /> Xóa {selectedIds.length} mã
          </Button>
        )}
      </div>

      {/* Data Table */}
      <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="text-xs">Đang tải danh sách mã...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground gap-2">
            <TicketPercent className="size-8 text-muted-foreground/40" />
            <p className="text-xs font-mono">Chưa có mã giảm giá nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="px-3 py-2 w-10 text-center">
                    <input
                      type="checkbox"
                      className="size-3.5 rounded-[3px] border-input cursor-pointer"
                      checked={coupons.length > 0 && selectedIds.length === coupons.length}
                      ref={(el) => {
                        if (el) el.indeterminate = selectedIds.length > 0 && selectedIds.length < coupons.length;
                      }}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold py-2">Tên Voucher</TableHead>
                  <TableHead className="text-xs font-semibold py-2">Mã Code</TableHead>
                  <TableHead className="text-xs font-semibold py-2">Giá Trị Giảm</TableHead>
                  <TableHead className="text-xs font-semibold py-2">Đơn Tối Thiểu</TableHead>
                  <TableHead className="text-xs font-semibold py-2">Lượt Dùng</TableHead>
                  <TableHead className="text-xs font-semibold py-2">Thời Hạn</TableHead>
                  <TableHead className="text-xs font-semibold py-2 text-center">Trạng Thái</TableHead>
                  <TableHead className="text-right py-2 w-28"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((item) => {
                  const now = new Date();
                  const isExpired = new Date(item.endDate) < now;
                  const isNotStarted = new Date(item.startDate) > now;

                  return (
                    <TableRow
                      key={item._id}
                      className={`hover:bg-muted/30 transition-colors ${selectedIds.includes(item._id) ? 'bg-muted/50' : ''}`}
                    >
                      <TableCell className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          className="size-3.5 rounded-[3px] border-input cursor-pointer"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => toggleSelect(item._id)}
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground">{item.name}</span>
                          {item.description && (
                            <span className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="inline-flex items-center gap-1.5 rounded-[4px] bg-muted px-2 py-0.5 border border-border/60 font-mono text-xs font-bold text-foreground">
                          {item.code}
                          <button
                            type="button"
                            onClick={() => handleCopyCode(item.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Sao chép"
                          >
                            {copiedCode === item.code ? (
                              <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                            {item.type === 'percent' ? `Giảm ${item.value}%` : `Giảm ${formatCurrency(item.value)}`}
                          </span>
                          {item.type === 'percent' && item.maxDiscount && (
                            <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                              Tối đa: {formatCurrency(item.maxDiscount)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-2 font-mono text-xs tabular-nums text-foreground">
                        {item.minOrderValue > 0 ? formatCurrency(item.minOrderValue) : '0đ'}
                      </TableCell>

                      <TableCell className="py-2">
                        <span className="text-xs font-mono tabular-nums text-foreground">
                          {item.usedCount} {item.usageLimit ? `/ ${item.usageLimit}` : '(∞)'}
                        </span>
                      </TableCell>

                      <TableCell className="py-2 text-[11px] text-muted-foreground font-mono tabular-nums whitespace-nowrap">
                        <div>{formatDate(item.startDate)}</div>
                        <div>đến {formatDate(item.endDate)}</div>
                      </TableCell>

                      <TableCell className="py-2 text-center">
                        {isExpired ? (
                          <span className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                            Hết hạn
                          </span>
                        ) : isNotStarted ? (
                          <span className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Chưa bắt đầu
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[10px] font-semibold border ${
                              item.isActive
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {item.isActive ? 'Hoạt động' : 'Tắt'}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                            title="Sửa"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                            title={item.isActive ? 'Tắt' : 'Bật'}
                            onClick={() => handleToggle(item)}
                          >
                            {item.isActive ? (
                              <ToggleRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ToggleLeft size={14} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-[4px] text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            title="Xóa"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <DataTablePagination
          page={page}
          pageSize={limit}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 1}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          className="px-4 py-2 border-t border-border"
        />
      </Card>

      {/* Modal Create / Edit Form */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowForm(false)}
        >
          <Card
            className="flex w-full max-w-xl flex-col overflow-hidden rounded-[6px] border border-border bg-card shadow-xl text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold text-foreground">
                {editTarget ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-[4px]"
                onClick={() => setShowForm(false)}
              >
                ×
              </Button>
            </CardHeader>

            <CardContent className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
              {/* Thông tin cơ bản */}
              <div className="flex flex-col gap-3 rounded-[6px] border border-border p-3.5 bg-muted/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Tên chương trình / mã <span className="text-destructive">*</span>
                  </label>
                  <Input
                    className="h-8 rounded-[6px] text-xs"
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
                    <Input
                      disabled={!!editTarget}
                      className="h-8 flex-1 rounded-[6px] font-mono text-xs font-bold uppercase disabled:opacity-60"
                      placeholder="VD: GIAM15K"
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    />
                    {!editTarget && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setForm((f) => ({ ...f, code: generateRandomCode() }))}
                        className="h-8 rounded-[6px] text-xs font-medium"
                      >
                        Tạo mã
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Mô tả</label>
                  <textarea
                    className="w-full rounded-[6px] border border-input bg-background p-2.5 text-xs outline-none focus:border-ring resize-none"
                    rows={2}
                    placeholder="Mô tả ngắn gọn về ưu đãi..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* Cấu hình khuyến mãi */}
              <div className="flex flex-col gap-3 rounded-[6px] border border-border p-3.5 bg-muted/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cấu hình khuyến mãi</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Loại giảm giá</label>
                    <select
                      className="h-8 w-full rounded-[6px] border border-input bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
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
                    <Input
                      type="number"
                      min={1}
                      max={form.type === 'percent' ? 100 : undefined}
                      className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                      value={form.value}
                      onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    />
                  </div>
                </div>

                {form.type === 'percent' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Giới hạn giảm tối đa (VNĐ) <span className="text-muted-foreground font-normal">(Để trống = không giới hạn)</span>
                    </label>
                    <Input
                      type="number"
                      className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                      placeholder="VD: 150000"
                      value={form.maxDiscount}
                      onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Điều kiện & Giới hạn */}
              <div className="flex flex-col gap-3 rounded-[6px] border border-border p-3.5 bg-muted/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Điều kiện & Giới hạn</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Đơn tối thiểu (VNĐ)</label>
                    <Input
                      type="number"
                      min={0}
                      className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                      placeholder="0đ"
                      value={form.minOrderValue}
                      onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">
                      Tổng số lượt sử dụng <span className="text-muted-foreground font-normal">(Trống = vô hạn)</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                      placeholder="Không giới hạn"
                      value={form.usageLimit}
                      onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Thời gian & Trạng thái */}
              <div className="flex flex-col gap-3 rounded-[6px] border border-border p-3.5 bg-muted/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thời gian & Trạng thái</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Ngày bắt đầu <span className="text-destructive">*</span></label>
                    <DateTimePicker
                      value={form.startDate}
                      onChange={(val) => setForm((f) => ({ ...f, startDate: val }))}
                      placeholder="Chọn ngày bắt đầu..."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Ngày kết thúc <span className="text-destructive">*</span></label>
                    <DateTimePicker
                      value={form.endDate}
                      onChange={(val) => setForm((f) => ({ ...f, endDate: val }))}
                      placeholder="Chọn ngày kết thúc..."
                      align="right"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    className="size-3.5 rounded-[3px] border-input text-primary focus:ring-ring"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <span>Kích hoạt mã ngay sau khi tạo</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-[6px] text-xs"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={createMut.isPending || updateMut.isPending}
                  onClick={handleSubmit}
                  className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
                >
                  {(createMut.isPending || updateMut.isPending) && <Loader2 size={13} className="animate-spin mr-1" />}
                  {editTarget ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa mã giảm giá"
        description={`Bạn có chắc muốn xóa mã "${deleteTarget?.code}" không? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa mã"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMut.isPending}
      />

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Xóa ${selectedIds.length} mã giảm giá`}
        description={`Bạn có chắc muốn xóa ${selectedIds.length} mã giảm giá đã chọn không? Hành động này không thể hoàn tác.`}
        confirmLabel={`Xóa ${selectedIds.length} mã`}
        danger
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        loading={bulkDeleteMut.isPending}
      />
    </div>
  );
}
