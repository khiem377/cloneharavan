import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useTogglePromotionStatus,
  useDeletePromotion,
  useDeleteBulkPromotions,
} from '@/hooks/usePromotions';
import { useAllProductsSelect } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PromotionHeader from './components/promotion/PromotionHeader';
import PromotionFilterBar from './components/promotion/PromotionFilterBar';
import PromotionTable from './components/promotion/PromotionTable';
import PromotionFormModal from './components/promotion/PromotionFormModal';

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
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const res = usePromotions({ keyword, type: filterType || undefined, isActive: filterStatus || undefined, page, limit });
  const promotions = res.data?.data ?? [];
  const pagination = res.data?.pagination;
  const isLoading = res.isLoading;

  const { data: allProducts = [] } = useAllProductsSelect();
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
      scopeProducts: (item.scope?.productIds ?? []).map((p) => {
        if (p && typeof p === 'object' && p._id) return { id: p._id, label: p.name, thumbnail: p.thumbnail };
        const found = allProducts.find((prod) => prod._id === p);
        return { id: p, label: found ? found.name : p, thumbnail: found ? found.thumbnail : null };
      }),
      scopeCategories: (item.scope?.categoryIds ?? []).map((c) => {
        if (c && typeof c === 'object' && c._id) return { id: c._id, label: c.name };
        const found = allCategories.find((cat) => cat._id === c);
        return { id: c, label: found ? found.name : c };
      }),
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
    if (new Date(form.endDate) <= new Date(form.startDate)) return toast.error('Ngày kết thúc phải sau ngày bắt đầu');
    if (form.type === 'percent_discount' && (!form.discountValue || Number(form.discountValue) > 100)) return toast.error('Giá trị % phải từ 1 đến 100');
    if (form.type === 'fixed_discount' && (!form.discountValue || Number(form.discountValue) <= 0)) return toast.error('Giá trị giảm phải lớn hơn 0');
    if (form.type === 'buy_x_pay_y') {
      if (!form.triggerQty || !form.payQty) return toast.error('Vui lòng nhập số lượng mua và số lượng trả');
      if (Number(form.payQty) >= Number(form.triggerQty)) return toast.error('Số lượng trả phải nhỏ hơn số lượng mua');
    }
    if (form.type === 'quantity_discount' && !form.triggerQty) return toast.error('Vui lòng nhập số lượng tối thiểu');
    if (form.scopeType === 'products' && !form.scopeProducts.length) return toast.error('Vui lòng chọn ít nhất 1 sản phẩm áp dụng');
    if (form.scopeType === 'categories' && !form.scopeCategories.length) return toast.error('Vui lòng chọn ít nhất 1 danh mục áp dụng');

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
      ...(form.type === 'buy_x_pay_y' && { triggerQty: Number(form.triggerQty), payQty: Number(form.payQty) }),
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

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      <PromotionHeader openCreate={openCreate} />

      <PromotionFilterBar
        keyword={keyword}
        setKeyword={setKeyword}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        setPage={setPage}
        selectedIds={selectedIds}
        setBulkDeleteConfirm={setBulkDeleteConfirm}
      />

      <PromotionTable
        promotions={promotions}
        isLoading={isLoading}
        selectedIds={selectedIds}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        openEdit={openEdit}
        handleToggle={handleToggle}
        setDeleteTarget={setDeleteTarget}
        allProducts={allProducts}
        allCategories={allCategories}
        page={page}
        limit={limit}
        pagination={pagination}
        setPage={setPage}
        setLimit={setLimit}
      />

      <PromotionFormModal
        showForm={showForm}
        setShowForm={setShowForm}
        editTarget={editTarget}
        form={form}
        setForm={setForm}
        allProducts={allProducts}
        allCategories={allCategories}
        handleSubmit={handleSubmit}
        isMutating={createMut.isPending || updateMut.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa chương trình khuyến mãi"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}" không? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMut.isPending}
      />
      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Xóa ${selectedIds.length} chương trình`}
        description="Hành động này không thể hoàn tác."
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        loading={bulkDeleteMut.isPending}
      />
    </div>
  );
}
