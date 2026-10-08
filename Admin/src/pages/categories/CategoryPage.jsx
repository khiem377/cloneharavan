import { useState, useEffect } from 'react';
import { Loader2 } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useToggleCategoryStatus,
  useDeleteCategory,
  useDeleteBulkCategories,
} from '@/hooks/useCategories';
import { useAllBrands } from '@/hooks/useBrands';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { useSearchParams } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

import CategoryToolbar from './components/CategoryToolbar';
import CategoryTreeRow from './components/CategoryTreeRow';
import CategoryFormModal from './components/CategoryFormModal';

const DEFAULT_FORM = {
  name: '',
  description: '',
  order: 0,
  parentId: '',
  brandId: '',
  link: '',
  imageMediaId: '',
  imageUrl: '',
  iconMediaId: '',
  iconUrl: '',
  showOnMenu: true,
  isActive: true,
  metaTitle: '',
  metaDescription: '',
};

function flattenTree(nodes) {
  const result = [];
  const walk = (list) => {
    list.forEach((node) => {
      result.push(node);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(nodes);
  return result;
}

export default function CategoryPage() {
  const [selected, setSelected] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: categories = [], isLoading, refetch } = useCategories();
  const { data: brands = [] } = useAllBrands();

  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const toggleMut = useToggleCategoryStatus();
  const deleteMut = useDeleteCategory();
  const bulkDeleteMut = useDeleteBulkCategories();

  const flatCats = flattenTree(categories);

  const highlightId = searchParams.get('highlight');
  useEffect(() => {
    if (!highlightId || !categories.length) return;
    const found = flatCats.find((c) => c._id === highlightId);
    if (!found) return;
    setSelected((prev) => (prev.includes(highlightId) ? prev : [...prev, highlightId]));
    setSearchParams(
      (p) => {
        p.delete('highlight');
        return p;
      },
      { replace: true }
    );
  }, [highlightId, categories, setSearchParams]);

  const filteredCategories = categories.filter((c) => {
    if (!keyword) return true;
    const matchName = (node) =>
      node.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (node.children || []).some(matchName);
    return matchName(c);
  });

  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      order: cat.order || 0,
      parentId: cat.parentId?._id || cat.parentId || '',
      brandId: cat.brandId?._id || cat.brandId || '',
      link: cat.link || '',
      imageMediaId: cat.image?.mediaId || '',
      imageUrl: cat.image?.url || '',
      iconMediaId: cat.icon?.mediaId || '',
      iconUrl: cat.icon?.url || '',
      showOnMenu: cat.showOnMenu ?? true,
      isActive: cat.isActive,
      metaTitle: cat.metaTitle || '',
      metaDescription: cat.metaDescription || '',
    });
    setShowForm(true);
  };

  const handleToggle = (cat) => {
    toggleMut.mutate(
      { id: cat._id, isActive: !cat.isActive },
      {
        onSuccess: () => toast.success(`${cat.isActive ? 'Ẩn' : 'Hiện'} danh mục thành công`),
        onError: (e) => toast.error(e.response?.data?.message || 'Lỗi cập nhật'),
      }
    );
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên danh mục');
    const payload = {
      name: form.name.trim(),
      description: form.description,
      order: Number(form.order),
      parentId: form.parentId || null,
      brandId: form.brandId || null,
      link: form.link,
      showOnMenu: form.showOnMenu,
      isActive: form.isActive,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      ...(form.imageMediaId && { imageMediaId: form.imageMediaId }),
      ...(form.iconMediaId && { iconMediaId: form.iconMediaId }),
    };

    const opts = {
      onSuccess: () => {
        toast.success(editTarget ? 'Cập nhật danh mục thành công' : 'Tạo danh mục thành công');
        setShowForm(false);
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi thao tác'),
    };

    if (editTarget) updateMut.mutate({ id: editTarget._id, data: payload }, opts);
    else createMut.mutate(payload, opts);
  };

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden pb-12 antialiased">
      {/* 1. Header Toolbar */}
      <CategoryToolbar
        keyword={keyword}
        setKeyword={setKeyword}
        selectedCount={selected.length}
        onRefresh={() => refetch()}
        isLoading={isLoading}
        onCreate={openCreate}
        onBulkDelete={() => setBulkDeleteConfirm(true)}
      />

      {/* 2. Hierarchical Category Tree Table */}
      <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-muted-foreground gap-2">
            <Loader2 className="animate-spin size-6" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                <TableHead className="w-10 text-center"></TableHead>
                <TableHead>Tên danh mục</TableHead>
                <TableHead className="w-20">Cấp</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Menu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center w-16">Thứ tự</TableHead>
                <TableHead className="text-right w-28">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground font-mono">
                    Chưa có danh mục nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((cat) => (
                  <CategoryTreeRow
                    key={cat._id}
                    cat={cat}
                    level={0}
                    selected={selected}
                    onSelect={toggleSelect}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    onToggle={handleToggle}
                    highlightId={highlightId}
                  />
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 3. Pagination */}
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50]}
      />

      {/* 4. Form Modal */}
      {showForm && (
        <CategoryFormModal
          form={form}
          setForm={setForm}
          editTarget={editTarget}
          flatCats={flatCats}
          brands={brands}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          isMutating={createMut.isPending || updateMut.isPending}
        />
      )}

      {/* 5. Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          title="Xác nhận xóa danh mục"
          description={`Bạn có chắc chắn muốn xóa danh mục "${deleteTarget.name}"? Thao tác này sẽ ảnh hưởng đến các danh mục con và sản phẩm liên quan.`}
          confirmLabel="Xóa danh mục"
          danger
          onConfirm={() => {
            deleteMut.mutate(deleteTarget._id, {
              onSuccess: () => {
                toast.success('Đã xóa danh mục');
                setDeleteTarget(null);
              },
              onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
            });
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {bulkDeleteConfirm && (
        <ConfirmDialog
          open={bulkDeleteConfirm}
          title={`Xác nhận xóa ${selected.length} danh mục`}
          description="Hành động này sẽ xóa vĩnh viễn tất cả danh mục đã chọn và không thể khôi phục."
          confirmLabel={`Xóa ${selected.length} mục`}
          danger
          onConfirm={() => {
            bulkDeleteMut.mutate(selected, {
              onSuccess: () => {
                toast.success('Đã xóa danh mục');
                setSelected([]);
                setBulkDeleteConfirm(false);
              },
              onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
            });
          }}
          onClose={() => setBulkDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
