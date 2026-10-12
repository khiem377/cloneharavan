import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  CreditCard,
  Tag,
  Package,
  Layers,
  ArrowUpDown,
  Download,
  Upload,
} from 'lucide-react';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '@/hooks/useSuppliers';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { toast } from '@/providers/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SupplierFormModal from './components/SupplierFormModal';

const SUPPLIER_COLUMNS = [
  { id: 'name', label: 'Tên Nhà Cung Cấp', defaultVisible: true, alwaysVisible: true },
  { id: 'code', label: 'Mã NCC', defaultVisible: true },
  { id: 'supplierType', label: 'Loại NCC', defaultVisible: true },
  { id: 'phone', label: 'Số Điện Thoại', defaultVisible: true },
  { id: 'debt', label: 'Nợ Cần Trả Hiện Tại', defaultVisible: true },
  { id: 'totalPurchase', label: 'Tổng Mua', defaultVisible: true },
  { id: 'address', label: 'Địa Chỉ', defaultVisible: true },
  { id: 'bank', label: 'Tài Khoản Ngân Hàng', defaultVisible: true },
  { id: 'status', label: 'Trạng Thái', defaultVisible: true },
  { id: 'actions', label: 'Thao Tác', defaultVisible: true, alwaysVisible: true },
];

export default function SupplierListPage() {
  const [keyword, setKeyword] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'active' | 'inactive'
  const [supplierTypeFilter, setSupplierTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Delete target state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columnVisibility = useColumnVisibility('admin_suppliers_columns', SUPPLIER_COLUMNS);
  const { isColumnVisible } = columnVisibility;

  const { data: res = {}, isLoading, refetch } = useSuppliers({
    page,
    limit: pageSize,
    keyword,
    status: statusTab !== 'all' ? statusTab : undefined,
    supplierType: supplierTypeFilter !== 'all' ? supplierTypeFilter : undefined,
  });

  const suppliers = res.data || [];
  const pagination = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const counts = res.counts || { all: 0, active: 0, inactive: 0 };
  const totalDebt = res.totalDebt || 0;

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingSupplier) {
        await updateMutation.mutateAsync({ id: editingSupplier._id, data: formData });
        toast.success(`Cập nhật nhà cung cấp "${formData.name}" thành công!`);
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(`Thêm mới nhà cung cấp "${formData.name}" thành công!`);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhà cung cấp');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(`Đã xóa nhà cung cấp "${deleteTarget.name}"`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa nhà cung cấp');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4 antialiased">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="size-5 text-primary" /> Nhà Cung Cấp
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý đối tác cung ứng, phân loại nguyên phụ liệu, địa chỉ bưu chính và tài khoản ngân hàng
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="rounded-[6px] text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform font-semibold gap-1.5"
          >
            <Plus size={14} /> Thêm nhà cung cấp
          </Button>
        </div>
      </div>

      {/* Pancake-style Status Tabs */}
      <div className="flex items-center gap-1 border-b border-border text-xs">
        <button
          type="button"
          onClick={() => {
            setStatusTab('all');
            setPage(1);
          }}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            statusTab === 'all'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Tất cả</span>
          <span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[10px] tabular-nums font-bold">
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusTab('active');
            setPage(1);
          }}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            statusTab === 'active'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="size-2 rounded-full bg-emerald-500 inline-block" />
          <span>Đang hoạt động</span>
          <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 font-mono text-[10px] tabular-nums font-bold">
            {counts.active}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusTab('inactive');
            setPage(1);
          }}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            statusTab === 'inactive'
              ? 'border-destructive text-destructive font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className="size-2 rounded-full bg-destructive inline-block" />
          <span>Không hoạt động</span>
          <span className="rounded-full bg-destructive/10 text-destructive px-1.5 py-0.2 font-mono text-[10px] tabular-nums font-bold">
            {counts.inactive}
          </span>
        </button>
      </div>

      {/* Toolbar / Filter Bar */}
      <Card className="rounded-[6px] border border-border p-3 shadow-xs bg-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo tên nhà cung cấp, mã NCC, SĐT, email..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-8 rounded-[6px] text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter by supplierType */}
            <select
              value={supplierTypeFilter}
              onChange={(e) => {
                setSupplierTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 px-2.5 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer w-full sm:w-48"
            >
              <option value="all">Tất cả loại NCC</option>
              <option value="Sản phẩm / Nguyên vật liệu">Sản phẩm / Nguyên vật liệu</option>
              <option value="Sản phẩm">Sản phẩm</option>
              <option value="Nguyên phụ liệu">Nguyên phụ liệu</option>
            </select>

            <ColumnToggleDropdown columnVisibility={columnVisibility} />
          </div>
        </div>
      </Card>

      {/* Table Data */}
      <Card className="rounded-[6px] border border-border overflow-hidden shadow-xs bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 font-bold text-muted-foreground uppercase text-[11px]">
                {isColumnVisible('name') && <th className="py-3 px-3.5 whitespace-nowrap">Tên Nhà Cung Cấp</th>}
                {isColumnVisible('code') && <th className="py-3 px-3.5 whitespace-nowrap">Mã NCC</th>}
                {isColumnVisible('supplierType') && <th className="py-3 px-3.5 whitespace-nowrap">Loại NCC</th>}
                {isColumnVisible('phone') && <th className="py-3 px-3.5 whitespace-nowrap">Số Điện Thoại</th>}
                {isColumnVisible('debt') && <th className="py-3 px-3.5 whitespace-nowrap text-right">Nợ Cần Trả Hiện Tại</th>}
                {isColumnVisible('totalPurchase') && <th className="py-3 px-3.5 whitespace-nowrap text-right">Tổng Mua</th>}
                {isColumnVisible('address') && <th className="py-3 px-3.5 whitespace-nowrap">Địa Chỉ</th>}
                {isColumnVisible('bank') && <th className="py-3 px-3.5 whitespace-nowrap">Tài Khoản Ngân Hàng</th>}
                {isColumnVisible('status') && <th className="py-3 px-3.5 whitespace-nowrap text-center">Trạng Thái</th>}
                {isColumnVisible('actions') && <th className="py-3 px-3.5 text-right whitespace-nowrap">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={columnVisibility.visibleCount} className="py-12 text-center text-xs text-muted-foreground">
                    Đang tải danh sách nhà cung cấp...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={columnVisibility.visibleCount} className="py-12 text-center text-xs text-muted-foreground">
                    <Building2 className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                    Không tìm thấy nhà cung cấp nào. Nhấn "Thêm nhà cung cấp" để bắt đầu.
                  </td>
                </tr>
              ) : (
                suppliers.map((sup) => {
                  const bInfo = sup.bankInfo || {};
                  return (
                    <tr key={sup._id} className="hover:bg-muted/30 transition-colors align-middle">
                      {/* Tên NCC & Avatar & Tags */}
                      {isColumnVisible('name') && (
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            {sup.image ? (
                              <img
                                src={sup.image}
                                alt={sup.name}
                                className="size-8 rounded-[4px] object-cover border border-border shrink-0 bg-muted"
                              />
                            ) : (
                              <div className="size-8 rounded-[4px] bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                                {sup.name?.charAt(0)?.toUpperCase() || 'N'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-foreground text-xs hover:text-primary transition-colors cursor-pointer" onClick={() => handleOpenEdit(sup)}>
                                {sup.name}
                              </p>
                              {sup.email && (
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {sup.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Mã NCC */}
                      {isColumnVisible('code') && (
                        <td className="py-3 px-3.5 font-mono text-xs font-bold text-primary whitespace-nowrap">
                          <span className="rounded-[4px] bg-primary/10 border border-primary/20 px-2 py-0.5">
                            {sup.code}
                          </span>
                        </td>
                      )}

                      {/* Loại NCC */}
                      {isColumnVisible('supplierType') && (
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <Badge variant="outline" className="rounded-[4px] px-2 py-0.5 text-[11px] font-medium bg-muted/60">
                            {sup.supplierType || 'Sản phẩm'}
                          </Badge>
                        </td>
                      )}

                      {/* Số điện thoại */}
                      {isColumnVisible('phone') && (
                        <td className="py-3 px-3.5 font-mono tabular-nums text-xs whitespace-nowrap">
                          {sup.phone ? (
                            <span className="text-foreground">{sup.phone}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      )}

                      {/* Nợ cần trả hiện tại */}
                      {isColumnVisible('debt') && (
                        <td className="py-3 px-3.5 text-right font-mono tabular-nums text-xs whitespace-nowrap">
                          <span className={sup.debt > 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                            {(sup.debt || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </td>
                      )}

                      {/* Tổng mua */}
                      {isColumnVisible('totalPurchase') && (
                        <td className="py-3 px-3.5 text-right font-mono tabular-nums text-xs whitespace-nowrap text-foreground">
                          {(sup.totalPurchase || 0).toLocaleString('vi-VN')} đ
                        </td>
                      )}

                      {/* Địa chỉ */}
                      {isColumnVisible('address') && (
                        <td className="py-3 px-3.5 text-xs text-muted-foreground max-w-xs truncate" title={sup.address}>
                          {sup.address || '-'}
                        </td>
                      )}

                      {/* Tài khoản ngân hàng VietQR */}
                      {isColumnVisible('bank') && (
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {bInfo.accountNumber ? (
                            <div className="flex items-center gap-2">
                              {bInfo.bankLogo && (
                                <img
                                  src={bInfo.bankLogo}
                                  alt={bInfo.bankShortName}
                                  className="h-4 max-w-[40px] object-contain rounded-[2px] bg-white border border-border p-0.5 shrink-0"
                                />
                              )}
                              <div className="text-[11px]">
                                <div className="font-mono tabular-nums font-bold text-foreground">
                                  {bInfo.accountNumber}
                                  <span className="ml-1 text-muted-foreground font-normal">
                                    ({bInfo.bankShortName || bInfo.bankCode || 'NH'})
                                  </span>
                                </div>
                                {bInfo.accountHolder && (
                                  <div className="text-[10px] text-muted-foreground font-mono uppercase">
                                    {bInfo.accountHolder}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>
                      )}

                      {/* Trạng thái */}
                      {isColumnVisible('status') && (
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              sup.isActive !== false && sup.status !== 'inactive'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-muted text-muted-foreground border border-border'
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                sup.isActive !== false && sup.status !== 'inactive'
                                  ? 'bg-emerald-500'
                                  : 'bg-muted-foreground/60'
                              }`}
                            />
                            {sup.isActive !== false && sup.status !== 'inactive'
                              ? 'Đang hoạt động'
                              : 'Không hoạt động'}
                          </span>
                        </td>
                      )}

                      {/* Thao tác */}
                      {isColumnVisible('actions') && (
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(sup)}
                              className="size-7 rounded-[4px] flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-transform cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(sup)}
                              className="size-7 rounded-[4px] flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] transition-transform cursor-pointer"
                              title="Xóa nhà cung cấp"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Bar: Total Debt and Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border px-4 py-2.5 gap-2 bg-muted/20">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>Tổng công nợ cần trả:</span>
            <span className="font-mono tabular-nums font-bold text-destructive text-sm">
              {totalDebt.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            totalItems={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* Modal Create / Edit with Dual Address and VietQR */}
      {modalOpen && (
        <SupplierFormModal
          isOpen={modalOpen}
          supplier={editingSupplier}
          onClose={() => {
            setModalOpen(false);
            setEditingSupplier(null);
          }}
          onSubmit={handleFormSubmit}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Xác nhận xóa Nhà cung cấp"
          message={`Bạn có chắc chắn muốn xóa Nhà cung cấp "${deleteTarget?.name}"? Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa Nhà Cung Cấp"
          cancelLabel="Hủy"
          variant="destructive"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
