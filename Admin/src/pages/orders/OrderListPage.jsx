import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import DataTablePagination from '@/components/ui/DataTablePagination';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import { toast } from '@/providers/ToastProvider';
import shipmentService from '@/services/shipment.service';

import OrderStatsGrid from './components/OrderStatsGrid';
import OrderToolbar from './components/OrderToolbar';
import OrderTable from './components/OrderTable';
import OrderDetailModal from './components/OrderDetailModal';
import OrderStatusModal from './components/OrderStatusModal';
import OrderCancelModal from './components/OrderCancelModal';
import CreateShipmentModal from '@/pages/shipments/components/CreateShipmentModal';

const ORDER_COLUMNS = [
  { id: 'orderCode', label: 'Mã đơn hàng', defaultVisible: true, alwaysVisible: true },
  { id: 'createdAt', label: 'Thời gian đặt', defaultVisible: true },
  { id: 'customer', label: 'Khách hàng', defaultVisible: true },
  { id: 'itemsSummary', label: 'Sản phẩm', defaultVisible: true },
  { id: 'address', label: 'Địa chỉ nhận hàng', defaultVisible: true },
  { id: 'totalAmount', label: 'Tổng tiền', defaultVisible: true },
  { id: 'payment', label: 'Trạng thái thanh toán', defaultVisible: true },
  { id: 'status', label: 'Trạng thái xử lý', defaultVisible: true },
  { id: 'shipping', label: 'Dịch vụ vận chuyển', defaultVisible: true },
  { id: 'actions', label: 'Thao tác', defaultVisible: true, alwaysVisible: true },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialPayment = searchParams.get('paymentStatus') || 'ALL';

  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState(initialPayment);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [shipmentsMap, setShipmentsMap] = useState({});

  // Modals state
  const [viewOrder, setViewOrder] = useState(null);
  const [statusModalState, setStatusModalState] = useState({ isOpen: false, order: null, nextStatus: null });
  const [cancelModalState, setCancelModalState] = useState({ isOpen: false, order: null });
  const [createShipmentOrder, setCreateShipmentOrder] = useState(null);

  const columnVisibility = useColumnVisibility('admin_orders_columns_v1', ORDER_COLUMNS);
  const { isColumnVisible } = columnVisibility;

  // Sync khi query param search thay đổi từ URL
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== search) {
      setSearch(q);
      setPage(1);
    }
  }, [searchParams]);

  // Query params
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: pageSize,
    };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (paymentFilter !== 'ALL') params.paymentStatus = paymentFilter;
    return params;
  }, [page, pageSize, search, statusFilter, paymentFilter]);

  const { data: res, isLoading, isFetching, refetch } = useOrders(queryParams);
  const orders = res?.data || [];
  const pagination = res?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const stats = res?.stats;

  // Tải thông tin vận đơn đối tác cho các đơn hàng hiển thị
  useEffect(() => {
    if (!orders || orders.length === 0) {
      setShipmentsMap({});
      return;
    }
    const orderCodes = orders.map((o) => o.orderCode).filter(Boolean);
    if (orderCodes.length === 0) return;

    shipmentService
      .getShipmentsByOrderCodes(orderCodes)
      .then((map) => setShipmentsMap(map || {}))
      .catch((err) => console.warn('Lỗi lấy bản đồ vận đơn:', err));
  }, [orders]);

  // Handlers for modals
  const handleOpenStatusModal = (order, nextStatus) => setStatusModalState({ isOpen: true, order, nextStatus });
  const handleCloseStatusModal = () => setStatusModalState({ isOpen: false, order: null, nextStatus: null });
  const handleOpenCancelModal = (order) => setCancelModalState({ isOpen: true, order });
  const handleCloseCancelModal = () => setCancelModalState({ isOpen: false, order: null });

  // Export CSV
  const handleExportCsv = () => {
    if (!orders || orders.length === 0) {
      toast.error('Không có dữ liệu đơn hàng để xuất');
      return;
    }

    const headers = [
      'Mã đơn',
      'Ngày đặt',
      'Khách hàng',
      'SĐT',
      'Địa chỉ',
      'Tổng tiền (VND)',
      'Thanh toán',
      'Trạng thái đơn',
      'Ghi chú',
    ];

    const rows = orders.map((o) => [
      `"${o.orderCode}"`,
      `"${new Date(o.createdAt).toLocaleString('vi-VN')}"`,
      `"${o.shippingAddress?.fullName || ''}"`,
      `"${o.shippingAddress?.phone || ''}"`,
      `"${[o.shippingAddress?.detailAddress, o.shippingAddress?.ward, o.shippingAddress?.district, o.shippingAddress?.province].filter(Boolean).join(', ')}"`,
      o.pricing?.totalAmount || 0,
      `"${o.paymentStatus} (${o.paymentMethod || 'COD'})"`,
      `"${o.orderStatus}"`,
      `"${(o.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `don_hang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đã xuất danh sách đơn hàng sang file CSV');
  };

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Top Statistics */}
      <OrderStatsGrid
        orders={orders}
        stats={stats}
        totalCount={pagination.total}
        activeStatus={statusFilter}
        onSelectStatus={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
      />

      {/* Toolbar / Filters */}
      <OrderToolbar
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        paymentFilter={paymentFilter}
        setPaymentFilter={(val) => {
          setPaymentFilter(val);
          setPage(1);
        }}
        onRefresh={refetch}
        isFetching={isFetching}
        columnVisibility={columnVisibility}
        onExportCsv={handleExportCsv}
        stats={stats}
      />

      {/* Main Table */}
      <OrderTable
        orders={orders}
        shipmentsMap={shipmentsMap}
        isLoading={isLoading}
        onViewOrder={(order) => navigate(`/orders/${order._id}`)}
        onOpenStatusModal={handleOpenStatusModal}
        onOpenCancelModal={handleOpenCancelModal}
        onCreateShipment={(order) => setCreateShipmentOrder(order)}
        isColumnVisible={isColumnVisible}
      />

      {/* Pagination */}
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={pagination.total || 0}
        totalItems={pagination.total || 0}
        totalPages={pagination.totalPages || 1}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        pageSizeOptions={[10, 20, 50, 100]}
      />

      {/* Modals */}
      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onOpenStatusModal={handleOpenStatusModal}
          onOpenCancelModal={handleOpenCancelModal}
        />
      )}

      {statusModalState.isOpen && (
        <OrderStatusModal
          order={statusModalState.order}
          nextStatus={statusModalState.nextStatus}
          isOpen={statusModalState.isOpen}
          onClose={handleCloseStatusModal}
        />
      )}

      {cancelModalState.isOpen && (
        <OrderCancelModal
          order={cancelModalState.order}
          isOpen={cancelModalState.isOpen}
          onClose={handleCloseCancelModal}
        />
      )}

      {createShipmentOrder && (
        <CreateShipmentModal
          isOpen={!!createShipmentOrder}
          initialOrderId={createShipmentOrder._id}
          onClose={() => setCreateShipmentOrder(null)}
          onSuccess={() => {
            setCreateShipmentOrder(null);
            refetch();
            toast.success('Tạo vận đơn thành công!');
          }}
        />
      )}
    </div>
  );
}
