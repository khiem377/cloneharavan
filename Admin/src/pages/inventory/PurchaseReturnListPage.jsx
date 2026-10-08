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
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DataTablePagination from '@/components/ui/DataTablePagination';

export default function PurchaseReturnListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    limit: pageSize,
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
    <div className="space-y-6 p-6 antialiased">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-destructive/10 text-destructive">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Danh sách phiếu trả hàng nhập
            </h1>
            <p className="text-xs text-muted-foreground">
              Quản lý xuất trả hàng hỏng/lỗi cho Nhà cung cấp & đối soát công nợ hoàn tiền
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-[6px] text-xs font-semibold"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Làm mới
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/purchase-returns/create')}
            className="rounded-[6px] text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Tạo phiếu trả
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="rounded-[6px] border border-border p-4 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Nhập mã phiếu (PR...), tên nhà cung cấp..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs rounded-[6px]"
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
      </Card>

      {/* Table */}
      <Card className="rounded-[6px] border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/60 text-[11px] font-bold text-foreground">
              <TableHead className="whitespace-nowrap">Mã phiếu</TableHead>
              <TableHead className="whitespace-nowrap">Ngày trả hàng</TableHead>
              <TableHead className="whitespace-nowrap">Nhà cung cấp</TableHead>
              <TableHead className="whitespace-nowrap">Kho xuất</TableHead>
              <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
              <TableHead className="text-right whitespace-nowrap">NCC phải trả</TableHead>
              <TableHead className="text-right whitespace-nowrap">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                    <span>Đang tải danh sách phiếu trả hàng nhập...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  Chưa có phiếu xuất trả nhà cung cấp nào được khởi tạo.
                </TableCell>
              </TableRow>
            ) : (
              returns.map((item) => (
                <TableRow key={item._id} className="hover:bg-muted/30 transition-colors align-middle">
                  <TableCell className="font-mono font-bold text-primary whitespace-nowrap text-xs">
                    {item.returnNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap font-mono tabular-nums text-xs">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="font-medium text-foreground whitespace-nowrap text-xs">
                    {item.supplierName}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    Kho Thành Phẩm SHOP
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-300 font-semibold text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Đã xuất trả
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-destructive whitespace-nowrap tabular-nums text-xs">
                    {(item.totalAmount || 0).toLocaleString('vi-VN')} đ
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenPreview(item)}
                      className="rounded-[6px] text-xs font-semibold h-7"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Preview Excel
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination && (
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        )}
      </Card>

      <ExcelPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        downloadUrl={previewUrl}
        title={previewTitle}
      />
    </div>
  );
}
