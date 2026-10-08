import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, Tag, X, Search, Filter } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useTogglePromotionStatus,
  useDeletePromotion,
  useDeleteBulkPromotions,
} from '@/hooks/usePromotions';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import DateTimePicker from '@/components/ui/DateTimePicker';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
import PriceInput from '@/components/ui/PriceInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const TYPE_LABELS = {
  percent_discount: 'Giảm theo %',
  fixed_discount: 'Giảm cố định',
  buy_x_pay_y: 'Mua X trả Y',
  quantity_discount: 'Giảm theo SL',
};

const TYPE_VARIANTS = {
  percent_discount: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10',
  fixed_discount: 'border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/10',
  buy_x_pay_y: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10',
  quantity_discount: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
};

function formatCurrency(n) {
  if (!n && n !== 0) return '0đ';
  return n.toLocaleString('vi-VN') + 'đ';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function describePromotion(item) {
  if (item.type === 'percent_discount') {
    const cap = item.maxDiscountValue ? ` (tối đa ${formatCurrency(item.maxDiscountValue)})` : '';
    return `Giảm ${item.discountValue}%${cap}`;
  }
  if (item.type === 'fixed_discount') return `Giảm ${formatCurrency(item.discountValue)}`;
  if (item.type === 'buy_x_pay_y') return `Mua ${item.triggerQty} trả ${item.payQty}`;
  if (item.type === 'quantity_discount') {
    const val = item.discountType === 'percent'
      ? `${item.discountValue}%`
      : formatCurrency(item.discountValue);
    return `Mua từ ${item.triggerQty} SP → giảm ${val}`;
  }
  return '—';
}

function ItemSearchInput({ items, onAdd, onRemove, placeholder, searchFn, labelKey = 'name', thumbKey = null }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const results = searchFn(search);

  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) => (
            <span key={it.id} className="inline-flex items-center gap-1.5 rounded-[6px] bg-muted border border-border px-2.5 py-1 text-xs font-medium text-foreground">
              {it.label}
              <button type="button" className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer" onClick={() => onRemove(it.id)}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Input
          className="h-9 w-full rounded-[6px]"
          placeholder={placeholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-[6px] border border-border bg-popover shadow-sm overflow-hidden max-h-44 overflow-y-auto">
            {results.filter((r) => !items.some((it) => it.id === r._id)).map((r) => (
              <button
                key={r._id}
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-foreground hover:bg-muted transition-colors cursor-pointer"
                onMouseDown={() => { onAdd({ id: r._id, label: r[labelKey] }); setSearch(''); setOpen(false); }}
              >
                {thumbKey && r[thumbKey]?.url && (
                  <img src={r[thumbKey].url} alt="" className="size-7 rounded-[4px] object-cover border border-border bg-muted shrink-0" />
                )}
                <span className="truncate">{r[labelKey]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const DEFAULT_FORM = {
  name: '',
  description: '',
  type: 'percent_discount',
  discountValue: 10,
  maxDiscountValue: '',
  discountType: 'percent',
  triggerQty: '',
  payQty: '',
  scopeType: 'all',
  scopeProducts: [],
  scopeCategories: [],
  minOrderValue: '',
  usageLimit: '',
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  isActive: true,
};

export default function PromotionPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [keyword, setKeyword] = useState(initialSearch);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const [productSearch, setProductSearch] = useState('');

  const params = { keyword, isActive: filterStatus || undefined, type: filterType || undefined, page, limit };
  const res = usePromotions(params);
  const promotions = res.data?.data ?? [];
  const pagination = res.data?.pagination;
  const isLoading = res.isLoading;

  const { data: productsData } = useProducts({ keyword: productSearch, limit: 20 });
  const allProducts = productsData?.data ?? [];

  const allCategoriesData = useCategories({});
  const allCategories = allCategoriesData.data ?? [];

  const createMut = useCreatePromotion();
  const updateMut = useUpdatePromotion();
  const toggleMut = useTogglePromotionStatus();
  const deleteMut = useDeletePromotion();
  const bulkDeleteMut = useDeleteBulkPromotions();

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...DEFAULT_FORM, startDate: new Date().toISOString().slice(0, 16) });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setForm({
      name: item.name,
      description: item.description || '',
      type: item.type,
      discountValue: item.discountValue ?? 10,
      maxDiscountValue: item.maxDiscountValue ?? '',
      discountType: item.discountType ?? 'percent',
      triggerQty: item.triggerQty ?? '',
      payQty: item.payQty ?? '',
      scopeType: item.scope?.type ?? 'all',
      scopeProducts: (item.scope?.productIds ?? []).map((p) =>
        typeof p === 'object' ? { id: p._id, label: p.name } : { id: p, label: p }
      ),
      scopeCategories: (item.scope?.categoryIds ?? []).map((c) =>
        typeof c === 'object' ? { id: c._id, label: c.name } : { id: c, label: c }
      ),
      minOrderValue: item.minOrderValue ?? '',
      usageLimit: item.usageLimit ?? '',
      startDate: new Date(item.startDate).toISOString().slice(0, 16),
      endDate: new Date(item.endDate).toISOString().slice(0, 16),
      isActive: item.isActive,
    });
    setShowForm(true);
  };

  const handleToggle = (item) => {
    toggleMut.mutate({ id: item._id, isActive: !item.isActive }, {
      onSuccess: () => toast.success('Cập nhật trạng thái thành công'),
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên chương trình');
    if (new Date(form.endDate) <= new Date(form.startDate))
      return toast.error('Ngày kết thúc phải sau ngày bắt đầu');
    if (form.type === 'percent_discount' && (!form.discountValue || Number(form.discountValue) > 100))
      return toast.error('Giá trị % phải từ 1 đến 100');
    if (form.type === 'fixed_discount' && (!form.discountValue || Number(form.discountValue) <= 0))
      return toast.error('Giá trị giảm phải lớn hơn 0');
    if (form.type === 'buy_x_pay_y') {
      if (!form.triggerQty || !form.payQty) return toast.error('Vui lòng nhập số lượng mua và số lượng trả');
      if (Number(form.payQty) >= Number(form.triggerQty)) return toast.error('Số lượng trả phải nhỏ hơn số lượng mua');
    }
    if (form.type === 'quantity_discount' && !form.triggerQty)
      return toast.error('Vui lòng nhập số lượng tối thiểu');
    if (form.scopeType === 'products' && !form.scopeProducts.length)
      return toast.error('Vui lòng chọn ít nhất 1 sản phẩm áp dụng');
    if (form.scopeType === 'categories' && !form.scopeCategories.length)
      return toast.error('Vui lòng chọn ít nhất 1 danh mục áp dụng');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      scope: {
        type: form.scopeType,
        ...(form.scopeType === 'products' && { productIds: form.scopeProducts.map((p) => p.id) }),
        ...(form.scopeType === 'categories' && { categoryIds: form.scopeCategories.map((c) => c.id) }),
      },
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      isActive: form.isActive,
      minOrderValue: form.minOrderValue !== '' ? Number(form.minOrderValue) : null,
      usageLimit: form.usageLimit !== '' ? Number(form.usageLimit) : null,
      ...(form.type === 'percent_discount' && {
        discountValue: Number(form.discountValue),
        maxDiscountValue: form.maxDiscountValue !== '' ? Number(form.maxDiscountValue) : null,
      }),
      ...(form.type === 'fixed_discount' && { discountValue: Number(form.discountValue) }),
      ...(form.type === 'buy_x_pay_y' && {
        triggerQty: Number(form.triggerQty),
        payQty: Number(form.payQty),
      }),
      ...(form.type === 'quantity_discount' && {
        triggerQty: Number(form.triggerQty),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscountValue: form.maxDiscountValue !== '' ? Number(form.maxDiscountValue) : null,
      }),
    };

    const opts = {
      onSuccess: () => { toast.success(editTarget ? 'Cập nhật thành công' : 'Tạo chương trình thành công'); setShowForm(false); },
      onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
    };

    if (editTarget) updateMut.mutate({ id: editTarget._id, data: payload }, opts);
    else createMut.mutate(payload, opts);
  };

  const confirmDelete = () => {
    deleteMut.mutate(deleteTarget._id, {
      onSuccess: () => { toast.success('Đã xóa chương trình'); setSelectedIds((p) => p.filter((x) => x !== deleteTarget._id)); setDeleteTarget(null); },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const confirmBulkDelete = () => {
    bulkDeleteMut.mutate(selectedIds, {
      onSuccess: () => { toast.success(`Đã xóa ${selectedIds.length} chương trình`); setSelectedIds([]); setBulkDeleteConfirm(false); },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    });
  };

  const toggleSelect = (id) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === promotions.length ? [] : promotions.map((p) => p._id));

  const isMutating = createMut.isPending || updateMut.isPending;

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="size-5 text-primary" />
            Chương trình khuyến mãi
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Tạo và quản lý các chương trình giảm giá tự động</p>
        </div>
        <Button onClick={openCreate} className="h-9 px-4 rounded-[6px] active:scale-[0.98] transition-transform">
          <Plus size={16} className="mr-1.5" /> Thêm chương trình
        </Button>
      </div>

      <Card className="rounded-[6px] border border-border shadow-none">
        <CardContent className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="h-9 pl-8 rounded-[6px]"
                placeholder="Tìm theo tên..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="h-9 rounded-[6px] border border-input bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả loại</option>
              <option value="percent_discount">Giảm theo %</option>
              <option value="fixed_discount">Giảm cố định</option>
              <option value="buy_x_pay_y">Mua X trả Y</option>
              <option value="quantity_discount">Giảm theo SL</option>
            </select>
            <select
              className="h-9 rounded-[6px] border border-input bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
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
              className="h-9 rounded-[6px] active:scale-[0.98] transition-transform"
            >
              <Trash2 size={14} className="mr-1.5" /> Xóa {selectedIds.length} mục
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="size-5 animate-spin text-primary" /> Đang tải dữ liệu...
          </div>
        ) : promotions.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground gap-2">
            <Tag className="size-10 text-muted-foreground/40" />
            <p className="text-sm">Chưa có chương trình khuyến mãi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-b border-border">
                  <TableHead className="w-10 px-3">
                    <input
                      type="checkbox"
                      className="size-4 rounded-[4px] border-input cursor-pointer"
                      checked={promotions.length > 0 && selectedIds.length === promotions.length}
                      ref={(el) => { if (el) el.indeterminate = selectedIds.length > 0 && selectedIds.length < promotions.length; }}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="px-4">Tên chương trình</TableHead>
                  <TableHead className="px-4">Loại</TableHead>
                  <TableHead className="px-4">Giá trị KM</TableHead>
                  <TableHead className="px-4">Điều kiện</TableHead>
                  <TableHead className="px-4">Phạm vi</TableHead>
                  <TableHead className="px-4">Thời gian</TableHead>
                  <TableHead className="px-4">Trạng thái</TableHead>
                  <TableHead className="px-4 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {promotions.map((item) => {
                  const now = new Date();
                  const isExpired = new Date(item.endDate) < now;
                  const isNotStarted = new Date(item.startDate) > now;
                  return (
                    <TableRow key={item._id} className={selectedIds.includes(item._id) ? 'bg-muted/60' : ''}>
                      <TableCell className="px-3 py-3 align-middle">
                        <input
                          type="checkbox"
                          className="size-4 rounded-[4px] border-input cursor-pointer"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => toggleSelect(item._id)}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm">{item.name}</span>
                          {item.description && <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle">
                        <Badge variant="outline" className={`rounded-[6px] text-xs font-medium ${TYPE_VARIANTS[item.type] || ''}`}>
                          {TYPE_LABELS[item.type] || item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle font-mono font-medium text-foreground text-xs tabular-nums">
                        {describePromotion(item)}
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle text-xs text-muted-foreground font-mono tabular-nums">
                        {item.minOrderValue ? (
                          <span>Đơn tối thiểu {formatCurrency(item.minOrderValue)}</span>
                        ) : (
                          <span>—</span>
                        )}
                        {item.usageLimit && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">{item.usedCount ?? 0}/{item.usageLimit} lần dùng</div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle text-xs text-muted-foreground">
                        {item.scope?.type === 'all' ? 'Tất cả' : item.scope?.type === 'products' ? `${item.scope.productIds?.length ?? 0} SP` : `${item.scope.categoryIds?.length ?? 0} DM`}
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle text-xs text-muted-foreground font-mono tabular-nums whitespace-nowrap">
                        <div>{formatDate(item.startDate)}</div>
                        <div className="text-[11px] text-muted-foreground/80">đến {formatDate(item.endDate)}</div>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle">
                        {isExpired ? (
                          <Badge variant="destructive" className="rounded-[6px] text-xs font-normal">Hết hạn</Badge>
                        ) : isNotStarted ? (
                          <Badge variant="outline" className="rounded-[6px] text-xs font-normal border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">Chưa diễn ra</Badge>
                        ) : (
                          <Badge variant="outline" className={`rounded-[6px] text-xs font-normal ${item.isActive ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'border-border text-muted-foreground bg-muted'}`}>
                            {item.isActive ? 'Hoạt động' : 'Tắt'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8 rounded-[6px]" onClick={() => openEdit(item)}>
                            <Pencil size={15} />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 rounded-[6px]" onClick={() => handleToggle(item)}>
                            {item.isActive ? <ToggleRight size={16} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={16} />}
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8 rounded-[6px] text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(item)}>
                            <Trash2 size={15} />
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
        <DataTablePagination page={page} pageSize={limit} total={pagination?.total ?? 0} totalPages={pagination?.totalPages ?? 1} onPageChange={setPage} onPageSizeChange={setLimit} />
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-[6px] border border-border">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">
              {editTarget ? 'Cập nhật chương trình' : 'Tạo chương trình khuyến mãi'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Thông tin cơ bản */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Tên chương trình <span className="text-destructive">*</span></label>
                <Input
                  className="h-9 rounded-[6px]"
                  placeholder="VD: Giảm 10% toàn bộ sản phẩm"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Mô tả</label>
                <textarea
                  className="w-full rounded-[6px] border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors"
                  rows={2}
                  placeholder="Mô tả ngắn về chương trình..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            {/* Cấu hình khuyến mãi */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cấu hình khuyến mãi</h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Loại chương trình <span className="text-destructive">*</span></label>
                <select
                  disabled={!!editTarget}
                  className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring cursor-pointer disabled:opacity-60"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="percent_discount">Giảm theo phần trăm (%)</option>
                  <option value="fixed_discount">Giảm số tiền cố định (đ)</option>
                  <option value="buy_x_pay_y">Mua X trả tiền Y</option>
                  <option value="quantity_discount">Giảm theo số lượng</option>
                </select>
              </div>

              {form.type === 'percent_discount' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Giá trị giảm (%) <span className="text-destructive">*</span></label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      className="h-9 rounded-[6px] font-mono"
                      value={form.discountValue}
                      onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Giới hạn giảm tối đa (VNĐ)</label>
                    <PriceInput value={form.maxDiscountValue} onChange={(v) => setForm((f) => ({ ...f, maxDiscountValue: v }))} className="rounded-[6px]" />
                  </div>
                </div>
              )}

              {form.type === 'fixed_discount' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Giá trị giảm (VNĐ) <span className="text-destructive">*</span></label>
                  <PriceInput value={form.discountValue} onChange={(v) => setForm((f) => ({ ...f, discountValue: v }))} placeholder="VD: 50,000" className="rounded-[6px]" />
                </div>
              )}

              {form.type === 'buy_x_pay_y' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Số lượng mua (X) <span className="text-destructive">*</span></label>
                    <Input
                      type="number"
                      min={2}
                      className="h-9 rounded-[6px] font-mono"
                      placeholder="VD: 3"
                      value={form.triggerQty}
                      onChange={(e) => setForm((f) => ({ ...f, triggerQty: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Số lượng trả (Y) <span className="text-destructive">*</span></label>
                    <Input
                      type="number"
                      min={1}
                      className="h-9 rounded-[6px] font-mono"
                      placeholder="VD: 2"
                      value={form.payQty}
                      onChange={(e) => setForm((f) => ({ ...f, payQty: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {form.type === 'quantity_discount' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Số lượng tối thiểu <span className="text-destructive">*</span></label>
                    <Input
                      type="number"
                      min={1}
                      className="h-9 rounded-[6px] font-mono"
                      placeholder="VD: 5"
                      value={form.triggerQty}
                      onChange={(e) => setForm((f) => ({ ...f, triggerQty: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground">Loại giảm</label>
                      <select
                        className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring cursor-pointer"
                        value={form.discountType}
                        onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                      >
                        <option value="percent">Phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định (đ)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground">Giá trị giảm <span className="text-destructive">*</span></label>
                      <Input
                        type="number"
                        min={1}
                        className="h-9 rounded-[6px] font-mono"
                        value={form.discountValue}
                        onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                      />
                    </div>
                  </div>
                  {form.discountType === 'percent' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground">Giới hạn giảm tối đa (VNĐ)</label>
                      <PriceInput value={form.maxDiscountValue} onChange={(v) => setForm((f) => ({ ...f, maxDiscountValue: v }))} className="rounded-[6px]" />
                    </div>
                  )}
                </div>
              )}

              {/* Phạm vi áp dụng */}
              <div className="flex flex-col gap-2 pt-1 border-t border-border">
                <label className="text-xs font-medium text-foreground">Phạm vi áp dụng</label>
                <select
                  className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring cursor-pointer"
                  value={form.scopeType}
                  onChange={(e) => setForm((f) => ({ ...f, scopeType: e.target.value, scopeProducts: [], scopeCategories: [] }))}
                >
                  <option value="all">Tất cả sản phẩm</option>
                  <option value="categories">Danh mục cụ thể</option>
                  <option value="products">Sản phẩm cụ thể</option>
                </select>

                {form.scopeType === 'products' && (
                  <ItemSearchInput
                    items={form.scopeProducts}
                    onAdd={(p) => setForm((f) => ({ ...f, scopeProducts: [...f.scopeProducts, p] }))}
                    onRemove={(id) => setForm((f) => ({ ...f, scopeProducts: f.scopeProducts.filter((p) => p.id !== id) }))}
                    placeholder="Tìm sản phẩm để thêm..."
                    searchFn={() => allProducts}
                    thumbKey="thumbnail"
                  />
                )}

                {form.scopeType === 'categories' && (
                  <ItemSearchInput
                    items={form.scopeCategories}
                    onAdd={(c) => setForm((f) => ({ ...f, scopeCategories: [...f.scopeCategories, c] }))}
                    onRemove={(id) => setForm((f) => ({ ...f, scopeCategories: f.scopeCategories.filter((c) => c.id !== id) }))}
                    placeholder="Tìm danh mục để thêm..."
                    searchFn={(s) => allCategories.filter((c) => !s || c.name.toLowerCase().includes(s.toLowerCase()))}
                  />
                )}
              </div>
            </div>

            {/* Điều kiện & Giới hạn */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Điều kiện &amp; Giới hạn</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Giá trị đơn hàng tối thiểu (VNĐ)</label>
                  <PriceInput value={form.minOrderValue} onChange={(v) => setForm((f) => ({ ...f, minOrderValue: v }))} className="rounded-[6px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Giới hạn số lần sử dụng</label>
                  <Input
                    type="number"
                    min={1}
                    className="h-9 rounded-[6px] font-mono"
                    placeholder="Không giới hạn"
                    value={form.usageLimit}
                    onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Thời gian & Trạng thái */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thời gian &amp; Trạng thái</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promotionIsActive"
                  className="size-4 rounded-[4px] border-input cursor-pointer"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <label htmlFor="promotionIsActive" className="text-xs font-medium text-foreground cursor-pointer select-none">
                  Kích hoạt ngay sau khi tạo
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4 bg-muted/20 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" className="h-9 rounded-[6px]" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
            <Button size="sm" disabled={isMutating} onClick={handleSubmit} className="h-9 rounded-[6px] active:scale-[0.98] transition-transform">
              {isMutating && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              {editTarget ? 'Lưu thay đổi' : 'Tạo chương trình'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} title="Xóa chương trình khuyến mãi" description={`Bạn có chắc muốn xóa "${deleteTarget?.name}" không? Hành động này không thể hoàn tác.`} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} loading={deleteMut.isPending} />
      <ConfirmDialog open={bulkDeleteConfirm} title={`Xóa ${selectedIds.length} chương trình`} description="Hành động này không thể hoàn tác." onConfirm={confirmBulkDelete} onCancel={() => setBulkDeleteConfirm(false)} loading={bulkDeleteMut.isPending} />
    </div>
  );
}
