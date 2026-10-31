import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';
import {
  useGiftPrograms,
  useCreateGiftProgram,
  useUpdateGiftProgram,
  useToggleGiftProgramStatus,
  useDeleteGiftProgram,
  useDeleteBulkGiftPrograms,
} from '@/hooks/useGiftPrograms';
import { useAllProductsSelect } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import GiftProgramHeader from './components/gift-program/GiftProgramHeader';
import GiftProgramFilterBar from './components/gift-program/GiftProgramFilterBar';
import GiftProgramTable from './components/gift-program/GiftProgramTable';
import GiftProgramFormModal from './components/gift-program/GiftProgramFormModal';

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
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');
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

  const res = useGiftPrograms({ keyword, isActive: filterStatus || undefined, giftType: filterType || undefined, page, limit });
  const programs = res.data?.data ?? [];
  const pagination = res.data?.pagination;
  const isLoading = res.isLoading;

  const { data: allProducts = [] } = useAllProductsSelect();
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
      triggerQty: item.triggerQty,
      giftQty: item.giftQty ?? 1,
      giftProducts: (item.giftProducts ?? []).map((g) => {
        const prodObj = (g.productId && typeof g.productId === 'object') ? g.productId : allProducts.find((p) => p._id === g.productId);
        return {
          productId: (g.productId && typeof g.productId === 'object') ? g.productId._id : g.productId,
          name: prodObj?.name || 'Sản phẩm',
          thumbnail: prodObj?.thumbnail,
          qty: g.qty,
        };
      }),
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

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      <GiftProgramHeader openCreate={openCreate} />

      <GiftProgramFilterBar
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

      <GiftProgramTable
        programs={programs}
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

      <GiftProgramFormModal
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
        title="Xóa chương trình tặng kèm"
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
