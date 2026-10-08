import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, Gift, X, Search } from '@/components/ui/Icons';
import PriceInput from '@/components/ui/PriceInput';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { toast } from '@/providers/ToastProvider';
import {
  useGiftPrograms,
  useCreateGiftProgram,
  useUpdateGiftProgram,
  useToggleGiftProgramStatus,
  useDeleteGiftProgram,
  useDeleteBulkGiftPrograms,
} from '@/hooks/useGiftPrograms';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
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

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function TagPicker({ tags, onRemove, placeholder, allItems, searchFn, labelKey = 'name', thumbKey = null, onAdd }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const results = searchFn ? searchFn(search) : allItems?.filter((i) => !search || i[labelKey].toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <div className="flex flex-col gap-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1.5 rounded-[6px] bg-muted border border-border px-2.5 py-1 text-xs font-medium text-foreground">
              {t.label}
              <button type="button" className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer" onClick={() => onRemove(t.id)}>
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
        {open && results.filter((r) => !tags.some((t) => t.id === r._id)).length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-[6px] border border-border bg-popover shadow-sm overflow-hidden max-h-44 overflow-y-auto">
            {results.filter((r) => !tags.some((t) => t.id === r._id)).map((r) => (
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

function GiftProductList({ selected, onAdd, onRemove, onQtyChange, allProducts }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const results = allProducts?.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-col gap-2">
          {selected.map((g) => (
            <div key={g.productId} className="flex items-center gap-3 rounded-[6px] border border-border bg-background px-3 py-2">
              <span className="flex-1 text-sm text-foreground truncate">{g.name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-muted-foreground">SL:</span>
                <Input
                  type="number"
                  min={1}
                  className="h-7 w-14 rounded-[4px] font-mono text-xs text-center"
                  value={g.qty}
                  onChange={(e) => onQtyChange(g.productId, e.target.value)}
                />
              </div>
              <button type="button" className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer" onClick={() => onRemove(g.productId)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="relative">
        <Input
          className="h-9 w-full rounded-[6px]"
          placeholder="Tìm sản phẩm tặng để thêm..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {open && results.filter((p) => !selected.some((s) => s.productId === p._id)).length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-[6px] border border-border bg-popover shadow-sm overflow-hidden max-h-44 overflow-y-auto">
            {results.filter((p) => !selected.some((s) => s.productId === p._id)).map((p) => (
              <button
                key={p._id}
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-foreground hover:bg-muted transition-colors cursor-pointer"
                onMouseDown={() => { onAdd(p); setSearch(''); setOpen(false); }}
              >
                {(() => {
                  const thumbSrc = typeof p.thumbnail === 'string' ? p.thumbnail : p.thumbnail?.url;
                  return thumbSrc ? <img src={thumbSrc} alt="" className="size-7 rounded-[4px] object-cover border border-border bg-muted shrink-0" /> : null;
                })()}
                <span className="truncate">{p.name}</span>
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
  giftType: 'same_product',
  scopeType: 'all',
  scopeProducts: [],
  scopeCategories: [],
  triggerQty: 3,
  giftQty: 1,
  giftProducts: [],
  giftLimit: '',
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  isActive: true,
};

export default function GiftProgramPage() {
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

  const params = { keyword, isActive: filterStatus || undefined, giftType: filterType || undefined, page, limit };
  const res = useGiftPrograms(params);
  const programs = res.data?.data ?? [];
  const pagination = res.data?.pagination;
  const isLoading = res.isLoading;

  const { data: productsData } = useProducts({ limit: 200 });
  const allProducts = productsData?.data ?? [];

  const categoriesData = useCategories({});
  const allCategories = categoriesData.data ?? [];

  const createMut = useCreateGiftProgram();
  const updateMut = useUpdateGiftProgram();
  const toggleMut = useToggleGiftProgramStatus();
  const deleteMut = useDeleteGiftProgram();
  const bulkDeleteMut = useDeleteBulkGiftPrograms();

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
      giftType: item.giftType,
      scopeType: item.scope?.type ?? 'all',
      scopeProducts: (item.scope?.productIds ?? []).map((p) =>
        typeof p === 'object' ? { id: p._id, label: p.name } : { id: p, label: p }
      ),
      scopeCategories: (item.scope?.categoryIds ?? []).map((c) =>
        typeof c === 'object' ? { id: c._id, label: c.name } : { id: c, label: c }
      ),
      triggerQty: item.triggerQty,
      giftQty: item.giftQty ?? 1,
      giftProducts: (item.giftProducts ?? []).map((g) => ({
        productId: g.productId?._id || g.productId,
        name: g.productId?.name || 'Sản phẩm',
        qty: g.qty,
      })),
      giftLimit: item.giftLimit ?? '',
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
    if (!form.triggerQty || Number(form.triggerQty) < 1) return toast.error('Số lượng mua phải lớn hơn 0');
    if (form.giftType === 'same_product' && (!form.giftQty || Number(form.giftQty) < 1))
      return toast.error('Vui lòng nhập số lượng tặng');
    if (form.giftType === 'different_product' && !form.giftProducts.length)
      return toast.error('Vui lòng chọn ít nhất 1 sản phẩm tặng');
    if (form.scopeType === 'products' && !form.scopeProducts.length)
      return toast.error('Vui lòng chọn ít nhất 1 sản phẩm kích hoạt');
    if (form.scopeType === 'categories' && !form.scopeCategories.length)
      return toast.error('Vui lòng chọn ít nhất 1 danh mục kích hoạt');
    if (new Date(form.endDate) <= new Date(form.startDate))
      return toast.error('Ngày kết thúc phải sau ngày bắt đầu');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      giftType: form.giftType,
      scope: {
        type: form.scopeType,
        ...(form.scopeType === 'products' && { productIds: form.scopeProducts.map((p) => p.id) }),
        ...(form.scopeType === 'categories' && { categoryIds: form.scopeCategories.map((c) => c.id) }),
      },
      triggerQty: Number(form.triggerQty),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      isActive: form.isActive,
      giftLimit: form.giftLimit !== '' ? Number(form.giftLimit) : null,
      ...(form.giftType === 'same_product' && { giftQty: Number(form.giftQty) }),
      ...(form.giftType === 'different_product' && {
        giftProducts: form.giftProducts.map((g) => ({ productId: g.productId, qty: g.qty })),
      }),
    };

    const opts = {
      onSuccess: () => { toast.success(editTarget ? 'Cập nhật thành công' : 'Tạo chương trình tặng kèm thành công'); setShowForm(false); },
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
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === programs.length ? [] : programs.map((p) => p._id));

  const isMutating = createMut.isPending || updateMut.isPending;

  const scopeLabel = (item) => {
    if (item.scope?.type === 'all') return 'Tất cả SP';
    if (item.scope?.type === 'products') return `${item.scope.productIds?.length ?? 0} sản phẩm`;
    if (item.scope?.type === 'categories') return `${item.scope.categoryIds?.length ?? 0} danh mục`;
    return '—';
  };

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Gift className="size-5 text-primary" />
            Chương trình tặng kèm
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Tạo và quản lý các chương trình tặng sản phẩm kèm theo đơn hàng</p>
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
              <option value="same_product">Tặng cùng sản phẩm</option>
              <option value="different_product">Tặng khác sản phẩm</option>
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
        ) : programs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground gap-2">
            <Gift className="size-10 text-muted-foreground/40" />
            <p className="text-sm">Chưa có chương trình tặng kèm nào</p>
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
                      checked={programs.length > 0 && selectedIds.length === programs.length}
                      ref={(el) => { if (el) el.indeterminate = selectedIds.length > 0 && selectedIds.length < programs.length; }}
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="px-4">Tên chương trình</TableHead>
                  <TableHead className="px-4">Loại tặng</TableHead>
                  <TableHead className="px-4">SP kích hoạt</TableHead>
                  <TableHead className="px-4">Điều kiện</TableHead>
                  <TableHead className="px-4">Quà tặng</TableHead>
                  <TableHead className="px-4">Thời gian</TableHead>
                  <TableHead className="px-4">Trạng thái</TableHead>
                  <TableHead className="px-4 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {programs.map((item) => {
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
                        <Badge
                          variant="outline"
                          className={`rounded-[6px] text-xs font-medium ${item.giftType === 'same_product' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'}`}
                        >
                          {item.giftType === 'same_product' ? 'Cùng sản phẩm' : 'Khác sản phẩm'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle text-xs text-muted-foreground">
                        {scopeLabel(item)}
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle text-xs text-foreground font-mono tabular-nums">
                        Mua từ {item.triggerQty} SP
                      </TableCell>
                      <TableCell className="px-4 py-3 align-middle text-xs text-foreground font-mono tabular-nums">
                        {item.giftType === 'same_product'
                          ? <span>Tặng {item.giftQty} SP cùng loại</span>
                          : <span>{item.giftProducts?.length || 0} sản phẩm tặng</span>
                        }
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
              {editTarget ? 'Cập nhật chương trình' : 'Tạo chương trình tặng kèm'}
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
                  placeholder="VD: Mua 3 tặng 1 cùng loại"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Mô tả</label>
                <textarea
                  className="w-full rounded-[6px] border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-ring resize-none placeholder:text-muted-foreground"
                  rows={2}
                  placeholder="Mô tả ngắn về chương trình..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            {/* Cấu hình tặng kèm */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cấu hình tặng kèm</h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Loại tặng kèm <span className="text-destructive">*</span></label>
                <select
                  disabled={!!editTarget}
                  className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring cursor-pointer disabled:opacity-60"
                  value={form.giftType}
                  onChange={(e) => setForm((f) => ({ ...f, giftType: e.target.value, giftProducts: [], scopeProducts: [], scopeCategories: [], scopeType: 'all' }))}
                >
                  <option value="same_product">Tặng cùng loại sản phẩm</option>
                  <option value="different_product">Tặng khác loại sản phẩm</option>
                </select>
              </div>

              {/* Sản phẩm kích hoạt (mua) */}
              <div className="flex flex-col gap-2 rounded-[6px] border border-dashed border-border p-3 bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">1</span>
                  <label className="text-xs font-semibold text-foreground">
                    Sản phẩm kích hoạt (sản phẩm mua)
                  </label>
                </div>
                <select
                  className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring cursor-pointer"
                  value={form.scopeType}
                  onChange={(e) => setForm((f) => ({ ...f, scopeType: e.target.value, scopeProducts: [], scopeCategories: [] }))}
                >
                  <option value="all">Tất cả sản phẩm trong giỏ</option>
                  <option value="categories">Danh mục cụ thể</option>
                  <option value="products">Sản phẩm cụ thể</option>
                </select>
                {form.scopeType === 'products' && (
                  <TagPicker
                    tags={form.scopeProducts}
                    onAdd={(p) => setForm((f) => ({ ...f, scopeProducts: [...f.scopeProducts, p] }))}
                    onRemove={(id) => setForm((f) => ({ ...f, scopeProducts: f.scopeProducts.filter((p) => p.id !== id) }))}
                    placeholder="Tìm sản phẩm kích hoạt..."
                    allItems={allProducts}
                    thumbKey="thumbnail"
                  />
                )}
                {form.scopeType === 'categories' && (
                  <TagPicker
                    tags={form.scopeCategories}
                    onAdd={(c) => setForm((f) => ({ ...f, scopeCategories: [...f.scopeCategories, c] }))}
                    onRemove={(id) => setForm((f) => ({ ...f, scopeCategories: f.scopeCategories.filter((c) => c.id !== id) }))}
                    placeholder="Tìm danh mục kích hoạt..."
                    allItems={allCategories}
                  />
                )}
                <p className="text-[11px] text-muted-foreground">
                  {form.scopeType === 'all'
                    ? 'Bất kỳ sản phẩm nào trong giỏ đều tính vào điều kiện mua.'
                    : form.scopeType === 'products'
                    ? 'Chỉ các sản phẩm được chọn mới tính vào điều kiện.'
                    : 'Chỉ sản phẩm thuộc danh mục được chọn mới tính vào điều kiện.'}
                </p>
              </div>

              {/* Điều kiện số lượng */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Số lượng mua tối thiểu <span className="text-destructive">*</span></label>
                  <Input
                    type="number"
                    min={1}
                    className="h-9 rounded-[6px] font-mono"
                    placeholder="VD: 3"
                    value={form.triggerQty}
                    onChange={(e) => setForm((f) => ({ ...f, triggerQty: e.target.value }))}
                  />
                </div>
                {form.giftType === 'same_product' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Số lượng tặng <span className="text-destructive">*</span></label>
                    <Input
                      type="number"
                      min={1}
                      className="h-9 rounded-[6px] font-mono"
                      placeholder="VD: 1"
                      value={form.giftQty}
                      onChange={(e) => setForm((f) => ({ ...f, giftQty: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Sản phẩm được tặng — chỉ cho different_product */}
              {form.giftType === 'different_product' && (
                <div className="flex flex-col gap-2 rounded-[6px] border border-dashed border-border p-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">2</span>
                    <label className="text-xs font-semibold text-foreground">Sản phẩm được tặng <span className="text-destructive">*</span></label>
                  </div>
                  <GiftProductList
                    selected={form.giftProducts}
                    allProducts={allProducts}
                    onAdd={(p) => setForm((f) => ({ ...f, giftProducts: [...f.giftProducts, { productId: p._id, name: p.name, qty: 1 }] }))}
                    onRemove={(id) => setForm((f) => ({ ...f, giftProducts: f.giftProducts.filter((g) => g.productId !== id) }))}
                    onQtyChange={(id, qty) => setForm((f) => ({ ...f, giftProducts: f.giftProducts.map((g) => g.productId === id ? { ...g, qty: Number(qty) } : g) }))}
                  />
                  <p className="text-[11px] text-muted-foreground">Các sản phẩm này sẽ được thêm miễn phí vào đơn hàng khi điều kiện được thỏa mãn.</p>
                </div>
              )}

              {/* Note cho same_product */}
              {form.giftType === 'same_product' && (
                <p className="text-xs text-muted-foreground bg-blue-500/5 border border-blue-500/20 rounded-[6px] px-3 py-2">
                  Sản phẩm tặng = sản phẩm mua (cùng loại). Hệ thống tự động thêm <strong>số lượng tặng</strong> của chính sản phẩm đó vào đơn.
                </p>
              )}
            </div>

            {/* Giới hạn & Thời gian */}
            <div className="flex flex-col gap-3 rounded-[6px] border border-border p-4 bg-card">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Giới hạn &amp; Thời gian</h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Giới hạn số lần tặng <span className="text-muted-foreground font-normal">(Để trống = không giới hạn)</span></label>
                <Input
                  type="number"
                  min={1}
                  className="h-9 rounded-[6px] font-mono"
                  placeholder="Không giới hạn"
                  value={form.giftLimit}
                  onChange={(e) => setForm((f) => ({ ...f, giftLimit: e.target.value }))}
                />
              </div>
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
                  id="giftIsActive"
                  className="size-4 rounded-[4px] border-input cursor-pointer"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <label htmlFor="giftIsActive" className="text-xs font-medium text-foreground cursor-pointer select-none">
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

      <ConfirmDialog open={!!deleteTarget} title="Xóa chương trình tặng kèm" description={`Bạn có chắc muốn xóa "${deleteTarget?.name}" không? Hành động này không thể hoàn tác.`} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} loading={deleteMut.isPending} />
      <ConfirmDialog open={bulkDeleteConfirm} title={`Xóa ${selectedIds.length} chương trình`} description="Hành động này không thể hoàn tác." onConfirm={confirmBulkDelete} onCancel={() => setBulkDeleteConfirm(false)} loading={bulkDeleteMut.isPending} />
    </div>
  );
}
