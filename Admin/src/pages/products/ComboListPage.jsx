import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Package,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Percent,
  Truck,
} from 'lucide-react';
import { useCombos, useToggleComboStatus, useDeleteCombo } from '@/hooks/useCombos';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DataTablePagination from '@/components/ui/DataTablePagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';
import ComboFormModal from './ComboFormModal';

const COMBO_COLUMNS = [
  { id: 'code', label: 'Mã tùy chỉnh / ID', defaultVisible: true, alwaysVisible: true },
  { id: 'name', label: 'Tên combo', defaultVisible: true, alwaysVisible: true },
  { id: 'items', label: 'Sản phẩm thành phần', defaultVisible: true },
  { id: 'virtualStock', label: 'Tồn kho khả dụng', defaultVisible: true },
  { id: 'comboType', label: 'Loại combo', defaultVisible: true },
  { id: 'freeShipping', label: 'Miễn phí vận chuyển', defaultVisible: false },
  { id: 'comboPrice', label: 'Giá bán combo', defaultVisible: true },
  { id: 'savingsPercent', label: 'Phần trăm giảm', defaultVisible: true },
  { id: 'savingsAmount', label: 'Tiết kiệm', defaultVisible: true },
  { id: 'time', label: 'Thời gian áp dụng', defaultVisible: true },
  { id: 'createdAt', label: 'Tạo lúc', defaultVisible: false },
  { id: 'updatedAt', label: 'Cập nhật lúc', defaultVisible: false },
  { id: 'status', label: 'Trạng thái', defaultVisible: true },
  { id: 'actions', label: 'Thao tác', defaultVisible: true, alwaysVisible: true },
];

export default function ComboListPage() {
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);

  // Delete target state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columnVisibility = useColumnVisibility('admin_combos_columns', COMBO_COLUMNS);
  const { isColumnVisible } = columnVisibility;

  const { data: res = {}, isLoading, refetch } = useCombos({
    page,
    limit: pageSize,
    keyword,
    status: statusFilter,
  });

  const combos = res.data || [];
  const pagination = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const toggleStatusMut = useToggleComboStatus();
  const deleteMut = useDeleteCombo();

  const handleToggleStatus = async (combo) => {
    try {
      await toggleStatusMut.mutateAsync(combo._id);
      toast.success(`Đã ${combo.isActive ? 'tạm dừng' : 'kích hoạt'} combo ${combo.name}`);
    } catch (err) {
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget._id);
      toast.success('Đã xóa combo sản phẩm thành công');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa combo thất bại');
    }
  };

  return (
    <div className="space-y-4 antialiased">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="size-5 text-primary" /> Quản lý Combo Sản Phẩm
          </h1>
          <p className="text-xs text-muted-foreground">
            Thiết lập gói sản phẩm bán kèm, tính tồn kho động tự động theo sản phẩm con
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingCombo(null);
            setModalOpen(true);
          }}
          className="rounded-[6px] text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform font-semibold self-start sm:self-auto gap-1.5"
        >
          <Plus size={14} /> Tạo combo mới
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="rounded-[6px] border border-border p-3 shadow-xs bg-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo tên hoặc mã tùy chỉnh combo..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-8 rounded-[6px] text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 px-2.5 text-xs rounded-[6px] border border-input bg-background font-semibold cursor-pointer w-full sm:w-40"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang áp dụng</option>
              <option value="inactive">Đang tạm dừng</option>
              <option value="expired">Đã hết hạn</option>
            </select>

            <ColumnToggleDropdown columnVisibility={columnVisibility} />
          </div>
        </div>
      </Card>

      {/* Table Data */}
      <Card className="rounded-[6px] border border-border overflow-hidden shadow-xs bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
              <tr>
                {isColumnVisible('code') && <th className="py-3 px-3.5 whitespace-nowrap">Mã tùy chỉnh / ID</th>}
                {isColumnVisible('name') && <th className="py-3 px-3.5 whitespace-nowrap">Tên Combo & Ưu đãi</th>}
                {isColumnVisible('items') && <th className="py-3 px-3.5 whitespace-nowrap">Sản phẩm thành phần</th>}
                {isColumnVisible('virtualStock') && <th className="py-3 px-3.5 whitespace-nowrap text-center">Tồn kho khả dụng</th>}
                {isColumnVisible('comboType') && <th className="py-3 px-3.5 whitespace-nowrap">Loại combo</th>}
                {isColumnVisible('freeShipping') && <th className="py-3 px-3.5 whitespace-nowrap text-center">Miễn phí VC</th>}
                {isColumnVisible('comboPrice') && <th className="py-3 px-3.5 whitespace-nowrap text-right">Giá bán combo</th>}
                {isColumnVisible('savingsPercent') && <th className="py-3 px-3.5 whitespace-nowrap text-right">% Giảm</th>}
                {isColumnVisible('savingsAmount') && <th className="py-3 px-3.5 whitespace-nowrap text-right">Tiết kiệm</th>}
                {isColumnVisible('time') && <th className="py-3 px-3.5 whitespace-nowrap">Thời gian</th>}
                {isColumnVisible('createdAt') && <th className="py-3 px-3.5 whitespace-nowrap">Tạo lúc</th>}
                {isColumnVisible('updatedAt') && <th className="py-3 px-3.5 whitespace-nowrap">Cập nhật lúc</th>}
                {isColumnVisible('status') && <th className="py-3 px-3.5 whitespace-nowrap text-center">Kích hoạt</th>}
                {isColumnVisible('actions') && <th className="py-3 px-3.5 whitespace-nowrap text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={columnVisibility.visibleCount} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="mx-auto size-6 animate-spin text-primary mb-2" />
                    Đang tải dữ liệu combo...
                  </td>
                </tr>
              ) : combos.length === 0 ? (
                <tr>
                  <td colSpan={columnVisibility.visibleCount} className="py-12 text-center text-muted-foreground">
                    <Package className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                    Chưa có combo sản phẩm nào. Bấm "Tạo combo mới" để bắt đầu.
                  </td>
                </tr>
              ) : (
                combos.map((combo) => {
                  const now = new Date();
                  const isExpired = combo.endDate && new Date(combo.endDate) < now;
                  const savings = Math.max(0, (combo.totalOriginalPrice || 0) - (combo.comboPrice || 0));

                  return (
                    <tr key={combo._id} className="hover:bg-muted/30 transition-colors align-middle">
                      {/* Mã Combo / Mã tùy chỉnh */}
                      {isColumnVisible('code') && (
                        <td className="py-3 px-3.5 font-mono text-xs font-bold text-primary whitespace-nowrap">
                          <span className="rounded-[4px] bg-primary/10 border border-primary/20 px-2 py-0.5">
                            {combo.code}
                          </span>
                        </td>
                      )}

                      {/* Tên Combo & Mô tả */}
                      {isColumnVisible('name') && (
                        <td className="py-3 px-3.5 max-w-xs">
                          <p className="font-bold text-foreground text-xs">{combo.name}</p>
                          {combo.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {combo.description}
                            </p>
                          )}
                        </td>
                      )}

                      {/* Sản phẩm thành phần */}
                      {isColumnVisible('items') && (
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {combo.items?.map((it, idx) => {
                              const p = it.productId;
                              const thumb =
                                (typeof p?.thumbnail === 'string' ? p?.thumbnail : p?.thumbnail?.url) ||
                                'https://placehold.co/32x32/1e293b/fff?text=?';
                              return (
                                <div
                                  key={idx}
                                  className="relative group inline-flex items-center"
                                  title={`${p?.name || 'Sản phẩm'} (SL: ${it.quantity})`}
                                >
                                  <img
                                    src={thumb}
                                    alt={p?.name}
                                    className="size-7 rounded-[4px] border border-border object-cover bg-muted"
                                  />
                                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground font-mono text-[9px] font-bold size-4 rounded-full flex items-center justify-center border border-background">
                                    {it.quantity}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      )}

                      {/* Tồn kho khả dụng */}
                      {isColumnVisible('virtualStock') && (
                        <td className="py-3 px-3.5 text-center font-mono tabular-nums whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`rounded-[4px] px-2 py-0.5 font-mono font-bold text-xs ${
                              combo.virtualStock > 0
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}
                          >
                            {combo.virtualStock} bộ
                          </Badge>
                        </td>
                      )}

                      {/* Loại combo */}
                      {isColumnVisible('comboType') && (
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <Badge variant="outline" className="rounded-[4px] px-2 py-0.5 text-[11px] font-medium bg-muted/60">
                            Combo cố định
                          </Badge>
                        </td>
                      )}

                      {/* Miễn phí vận chuyển */}
                      {isColumnVisible('freeShipping') && (
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          {combo.freeShipping ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                              <CheckCircle2 size={13} /> Có
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Không</span>
                          )}
                        </td>
                      )}

                      {/* Giá bán combo */}
                      {isColumnVisible('comboPrice') && (
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="font-mono font-bold text-sm text-foreground tabular-nums">
                            {combo.comboPrice?.toLocaleString('vi-VN')} đ
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground line-through tabular-nums mt-0.5">
                            {combo.totalOriginalPrice?.toLocaleString('vi-VN')} đ
                          </div>
                        </td>
                      )}

                      {/* Phần trăm giảm */}
                      {isColumnVisible('savingsPercent') && (
                        <td className="py-3 px-3.5 text-right font-mono tabular-nums text-xs whitespace-nowrap">
                          {combo.savingsPercent > 0 ? (
                            <span className="rounded-[4px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 font-bold border border-emerald-500/20">
                              -{combo.savingsPercent}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0%</span>
                          )}
                        </td>
                      )}

                      {/* Tiết kiệm */}
                      {isColumnVisible('savingsAmount') && (
                        <td className="py-3 px-3.5 text-right font-mono tabular-nums text-xs whitespace-nowrap text-emerald-600 dark:text-emerald-400 font-bold">
                          {savings > 0 ? `${savings.toLocaleString('vi-VN')} đ` : '-'}
                        </td>
                      )}

                      {/* Thời gian */}
                      {isColumnVisible('time') && (
                        <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-muted-foreground font-mono">
                          {isExpired ? (
                            <span className="text-destructive font-semibold flex items-center gap-1">
                              <Clock size={11} /> Đã hết hạn
                            </span>
                          ) : combo.endDate ? (
                            <span>
                              {new Date(combo.startDate).toLocaleDateString('vi-VN')} →{' '}
                              {new Date(combo.endDate).toLocaleDateString('vi-VN')}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Vô thời hạn
                            </span>
                          )}
                        </td>
                      )}

                      {/* Tạo lúc */}
                      {isColumnVisible('createdAt') && (
                        <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-muted-foreground font-mono tabular-nums">
                          {combo.createdAt ? new Date(combo.createdAt).toLocaleString('vi-VN') : '-'}
                        </td>
                      )}

                      {/* Cập nhật lúc */}
                      {isColumnVisible('updatedAt') && (
                        <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-muted-foreground font-mono tabular-nums">
                          {combo.updatedAt ? new Date(combo.updatedAt).toLocaleString('vi-VN') : '-'}
                        </td>
                      )}

                      {/* Kích hoạt (Toggle) */}
                      {isColumnVisible('status') && (
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(combo)}
                            className="cursor-pointer text-muted-foreground hover:text-foreground transition-transform active:scale-[0.98]"
                            title={combo.isActive ? 'Đang bật - Bấm để tắt' : 'Đang tắt - Bấm để bật'}
                          >
                            {combo.isActive ? (
                              <ToggleRight className="size-6 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ToggleLeft className="size-6 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Thao tác */}
                      {isColumnVisible('actions') && (
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingCombo(combo);
                                setModalOpen(true);
                              }}
                              className="size-7 rounded-[4px] flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-transform cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(combo)}
                              className="size-7 rounded-[4px] flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] transition-transform cursor-pointer"
                              title="Xóa combo"
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

        {/* Pagination */}
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
      </Card>

      {/* Modal Create/Edit Combo */}
      {modalOpen && (
        <ComboFormModal
          isOpen={modalOpen}
          initialData={editingCombo}
          onClose={() => {
            setModalOpen(false);
            setEditingCombo(null);
          }}
          onSuccess={() => refetch()}
        />
      )}

      {/* Confirm Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Xác nhận xóa combo"
          message={`Bạn có chắc chắn muốn xóa combo "${deleteTarget.name}" không? Hành động này không thể hoàn tác.`}
          confirmLabel="Xóa combo"
          cancelLabel="Hủy"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          variant="destructive"
        />
      )}
    </div>
  );
}
