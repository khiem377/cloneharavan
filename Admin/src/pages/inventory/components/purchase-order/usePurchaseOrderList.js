import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePurchaseOrders, useUpdatePurchaseOrderStatus } from '@/hooks/useInventory';
import { inventoryService } from '@/services/inventory.service';
import { warehouseService } from '@/services/warehouse.service';
import { useModalSet } from '@/hooks/useModalSet';
import { toast } from '@/providers/ToastProvider';

export function usePurchaseOrderList() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadingId, setDownloadingId] = useState(null);

  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const modal = useModalSet(['detail', 'excelPreview', 'sendPO', 'confirm', 'payment']);

  useEffect(() => {
    const loadWh = async () => {
      try {
        const res = await warehouseService.getWarehouses();
        setWarehouses(res.data?.data?.data || []);
      } catch (e) {
        console.warn('Lỗi tải danh sách kho:', e);
      }
    };
    loadWh();
  }, []);

  const { data: res = {}, isLoading } = usePurchaseOrders({
    page,
    limit: pageSize,
    keyword,
    status: statusFilter,
    warehouseId: warehouseFilter || undefined,
  });

  const orders = res.data || [];
  const pagination = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const updateStatusMutation = useUpdatePurchaseOrderStatus();

  const [searchParams] = useSearchParams();
  const poIdFromUrl = searchParams.get('poId');

  useEffect(() => {
    if (poIdFromUrl && orders.length > 0) {
      const found = orders.find((o) => o._id === poIdFromUrl || o.poNumber === poIdFromUrl);
      if (found) modal.open('detail', found);
    }
  }, [poIdFromUrl, orders]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    return [...orders].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'supplierId') {
        valA = a.supplierId?.name || '';
        valB = b.supplierId?.name || '';
      } else if (sortField === 'itemCount') {
        valA = a.items?.length || 0;
        valB = b.items?.length || 0;
      }

      if (typeof valA === 'string') {
        const cmp = String(valA || '').localeCompare(String(valB || ''), 'vi', { sensitivity: 'base' });
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, sortField, sortOrder]);

  const handleDownloadExcel = async (order) => {
    try {
      setDownloadingId(order._id);
      const resp = await inventoryService.downloadPOExcel(order._id);
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Don_Dat_Hang_${order.poNumber}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Đã tải Đơn Đặt Hàng Excel mẫu thành công!');
    } catch (err) {
      toast.error('Lỗi tải file Excel Đơn Đặt Hàng: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreviewExcelOnWeb = (order) => {
    const url = `/purchase-orders/${order._id}/download-excel`;
    modal.open('excelPreview', { url, title: `Don Dat Hang Excel (${order.poNumber})` });
  };

  const doAdvanceStatus = async (id, status, poNumber) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success(`Đã chuyển đơn ${poNumber} sang trạng thái mới thành công!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleAdvanceStatus = (po, nextStatus) => {
    if (po.status === 'completed') {
      toast.error('Đơn hàng đã hoàn tất nhập kho, không thể thay đổi trạng thái!');
      return;
    }

    if (nextStatus === 'completed') {
      modal.open('confirm', {
        po,
        nextStatus: 'completed',
        title: `Xác Nhận Nghiệm Thu & Nhập Kho (${po.poNumber})`,
        message: `Xác nhận nghiệm thu đơn ${po.poNumber}? Hệ thống sẽ chính thức cộng số lượng vào tồn kho thực tế và lưu trữ chứng từ lên Đám Mây.`,
        confirmText: 'Xác Nhận Nhập Kho',
        variant: 'primary',
      });
      return;
    }

    doAdvanceStatus(po._id, nextStatus, po.poNumber);
  };

  return {
    queryClient,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    warehouseFilter,
    setWarehouseFilter,
    warehouses,
    page,
    setPage,
    pageSize,
    setPageSize,
    downloadingId,
    sortField,
    sortOrder,
    handleSort,
    sortedOrders,
    pagination,
    isLoading,
    modal,
    updateStatusMutation,
    handleDownloadExcel,
    handlePreviewExcelOnWeb,
    handleAdvanceStatus,
    doAdvanceStatus,
  };
}
