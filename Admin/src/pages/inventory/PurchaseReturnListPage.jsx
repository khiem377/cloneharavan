import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw, Plus, SearchIcon as Search, FileSpreadsheet, Download,
  Building2, Calendar, Package, RefreshCw, CheckCircle2, Trash2, Eye,
} from '@/components/ui/Icons';
import { usePurchaseReturns, useCreatePurchaseReturn } from '@/hooks/useInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProducts } from '@/hooks/useProducts';
import ExcelPreviewModal from '@/components/common/ExcelPreviewModal';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { toast } from '@/providers/ToastProvider';

export default function PurchaseReturnListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Excel Preview state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [note, setNote] = useState('');
  const [returnItems, setReturnItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  const { data: returnsData, isLoading, refetch } = usePurchaseReturns({
    search,
    status: statusFilter,
    page,
    limit: 10,
  });

  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const { data: productsData } = useProducts({ search: productSearch, limit: 10 });
  const createMutation = useCreatePurchaseReturn();

  const handleOpenPreview = (item) => {
    const downloadUrl = `/purchase-returns/${item._id}/download-excel`;
    setPreviewUrl(downloadUrl);
    setPreviewTitle(`Phieu Tra Hang Nhap Excel (${item.returnNumber})`);
    setPreviewModalOpen(true);
  };

  const handleAddItem = (prod) => {
    if (returnItems.some((i) => i.productId === prod._id)) {
      toast.info('Sản phẩm đã có trong danh sách xuất trả');
      return;
    }
    setReturnItems([
      ...returnItems,
      {
        productId: prod._id,
        sku: prod.productCode || 'SKU-UNKNOWN',
        productName: prod.name,
        unit: 'Cái',
        quantity: 1,
        returnPrice: prod.price || 0,
        reason: 'Hàng lỗi / Không đạt chất lượng',
      },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...returnItems];
    updated[index][field] = value;
    setReturnItems(updated);
  };

  const handleRemoveItem = (index) => {
    setReturnItems(returnItems.filter((_, i) => i !== index));
  };

  const handleSubmitCreate = (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      toast.error('Vui lòng chọn Nhà cung cấp');
      return;
    }
    if (returnItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm xuất trả');
      return;
    }

    createMutation.mutate(
      {
        supplierId: selectedSupplierId,
        note,
        items: returnItems,
      },
      {
        onSuccess: () => {
          toast.success('Tạo phiếu xuất trả nhà cung cấp thành công!');
          setIsModalOpen(false);
          setReturnItems([]);
          setNote('');
          setSelectedSupplierId('');
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu trả');
        },
      }
    );
  };

  const returns = returnsData?.data || returnsData?.returns || [];
  const pagination = returnsData?.pagination;
  const suppliers = suppliersData?.data || suppliersData?.suppliers || [];
  const products = productsData?.products || productsData?.data || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-sm">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Danh sách phiếu trả hàng nhập
            </h1>
            <p className="text-xs text-muted-foreground">
              Quản lý xuất trả hàng hỏng/lỗi cho Nhà cung cấp & đối soát công nợ hoàn tiền
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <RefreshCw className="h-4 w-4" /> Làm mới
          </button>
          <button
            onClick={() => navigate('/purchase-returns/create')}
            className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-md"
          >
            <Plus className="h-4 w-4" /> Tạo phiếu trả
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Nhập mã phiếu (PR...), tên nhà cung cấp..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-3 w-48">
          <SearchableSelect
            options={[
              { label: 'Tất cả trạng thái', value: '' },
              { label: 'Đã xuất trả', value: 'completed' },
              { label: 'Bản nháp', value: 'draft' },
            ]}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            creatable={false}
            placeholder="Tất cả trạng thái"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <th className="px-4 py-3.5 whitespace-nowrap">Mã phiếu</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Ngày trả hàng</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Nhà cung cấp</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Kho xuất</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Trạng thái</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">NCC phải trả</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span>Đang tải danh sách phiếu trả hàng nhập...</span>
                    </div>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Chưa có phiếu xuất trả nhà cung cấp nào được khởi tạo.
                  </td>
                </tr>
              ) : (
                returns.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/30 transition-colors align-middle">
                    <td className="px-4 py-3 font-mono font-bold text-primary whitespace-nowrap">
                      {item.returnNumber}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {item.supplierName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      Kho Thành Phẩm EGA
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Đã xuất trả
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-destructive whitespace-nowrap">
                      {(item.totalAmount || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenPreview(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Preview Excel
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Trang {pagination.page} / {pagination.totalPages} ({pagination.total} bản ghi)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-input px-3 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                Trước
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-input px-3 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tạo Phiếu Trả Hàng Nhập */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Tạo Phiếu Trả Hàng Nhập Cho NCC</h3>
                  <p className="text-xs text-muted-foreground">
                    Xuất trả sản phẩm lỗi & tự động trừ số lượng tồn kho
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="flex-1 overflow-auto p-6 space-y-5">
              {/* Chọn NCC & Ghi chú */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Nhà Cung Cấp Trả Hàng <span className="text-destructive">*</span>
                  </label>
                  <SearchableSelect
                    options={suppliers.map((s) => ({
                      label: `${s.name} (${s.code || 'NCC'})`,
                      value: s._id,
                    }))}
                    value={selectedSupplierId}
                    onChange={(val) => setSelectedSupplierId(val)}
                    creatable={false}
                    placeholder="-- Chọn Nhà Cung Cấp --"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Ghi Chú Đợt Trả Hàng</label>
                  <input
                    type="text"
                    placeholder="Lý do xuất trả NCC (VD: Hàng trầy xước...)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Tìm & Thêm Sản Phẩm */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Tìm Sản Phẩm Xuất Trả
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Gõ tên hoặc mã SKU sản phẩm..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* List gợi ý tìm kiếm */}
                {productSearch && products.length > 0 && (
                  <div className="mt-2 rounded-xl border border-border bg-card p-2 shadow-lg max-h-48 overflow-auto space-y-1">
                    {products.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => {
                          handleAddItem(p);
                          setProductSearch('');
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer text-xs"
                      >
                        <div>
                          <span className="font-semibold text-foreground">{p.name}</span>
                          <span className="ml-2 text-muted-foreground font-mono">({p.productCode || 'No SKU'})</span>
                        </div>
                        <span className="text-xs text-primary font-bold">Tồn: {p.stock || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bảng sản phẩm trả */}
              <div>
                <h4 className="text-xs font-bold text-foreground mb-2">Danh sách sản phẩm hoàn trả:</h4>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/40 font-semibold border-b border-border">
                      <tr>
                        <th className="p-2.5">Sản phẩm</th>
                        <th className="p-2.5 w-20">SL Trả</th>
                        <th className="p-2.5 w-28">Đơn giá trả</th>
                        <th className="p-2.5 w-32">Lý do lỗi</th>
                        <th className="p-2.5 w-12 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {returnItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-muted-foreground">
                            Chưa chọn sản phẩm nào để xuất trả.
                          </td>
                        </tr>
                      ) : (
                        returnItems.map((item, idx) => (
                          <tr key={item.productId}>
                            <td className="p-2.5 font-medium">{item.productName}</td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(idx, 'quantity', Number(e.target.value))
                                }
                                className="w-full rounded border border-input px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min="0"
                                value={item.returnPrice}
                                onChange={(e) =>
                                  handleItemChange(idx, 'returnPrice', Number(e.target.value))
                                }
                                className="w-full rounded border border-input px-2 py-1 text-xs font-mono"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={item.reason}
                                onChange={(e) => handleItemChange(idx, 'reason', e.target.value)}
                                className="w-full rounded border border-input px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-destructive hover:opacity-80"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-xl bg-destructive px-5 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Đang tạo...' : 'Xác Nhận Xuất Trả NCC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Web Preview Modal */}
      <ExcelPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewTitle}
        downloadUrl={previewUrl}
      />
    </div>
  );
}
