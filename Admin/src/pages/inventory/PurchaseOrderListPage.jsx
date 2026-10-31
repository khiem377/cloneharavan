import React from 'react';
import { useNavigate } from 'react-router-dom';
import useColumnVisibility from '@/hooks/useColumnVisibility';
import ExcelPreviewModal from '@/components/common/ExcelPreviewModal';
import SendPOModal from '@/components/inventory/SendPOModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PurchaseOrderPaymentModal from './components/PurchaseOrderPaymentModal';
import { usePurchaseOrderList } from './components/purchase-order/usePurchaseOrderList';
import POHeader from './components/purchase-order/POHeader';
import POFilterBar from './components/purchase-order/POFilterBar';
import POTable from './components/purchase-order/POTable';
import PODetailDrawer from './components/purchase-order/PODetailDrawer';

const PO_COLUMNS = [
  { id: 'stt', label: 'STT', defaultVisible: true },
  { id: 'poNumber', label: 'Mã Đơn PO', defaultVisible: true, alwaysVisible: true },
  { id: 'warehouse', label: 'Kho Nhập', defaultVisible: true },
  { id: 'supplier', label: 'Nhà Cung Cấp', defaultVisible: true },
  { id: 'itemCount', label: 'Số Loại SP', defaultVisible: true },
  { id: 'totalQuantity', label: 'Tổng SL', defaultVisible: true },
  { id: 'totalAmount', label: 'Tổng Giá Nhập', defaultVisible: true },
  { id: 'paymentStatus', label: 'Thanh Toán', defaultVisible: true },
  { id: 'status', label: 'Trạng Thái', defaultVisible: true },
  { id: 'stepper', label: 'Nấc Tiến Quy Trình', defaultVisible: true },
  { id: 'actions', label: 'Xem & Tải Excel', defaultVisible: true, alwaysVisible: true },
];

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const columnVisibility = useColumnVisibility('admin_po_columns', PO_COLUMNS);
  const po = usePurchaseOrderList();

  const previewData = po.modal.data('excelPreview') || {};
  const confirmData = po.modal.data('confirm') || {};

  return (
    <div className="space-y-6 p-6">
      <POHeader navigate={navigate} />

      <POFilterBar
        keyword={po.keyword}
        setKeyword={po.setKeyword}
        warehouseFilter={po.warehouseFilter}
        setWarehouseFilter={po.setWarehouseFilter}
        warehouses={po.warehouses}
        statusFilter={po.statusFilter}
        setStatusFilter={po.setStatusFilter}
        setPage={po.setPage}
        columnVisibility={columnVisibility}
      />

      <POTable
        orders={po.sortedOrders}
        isLoading={po.isLoading}
        page={po.page}
        pageSize={po.pageSize}
        pagination={po.pagination}
        setPage={po.setPage}
        setPageSize={po.setPageSize}
        columnVisibility={columnVisibility}
        sortField={po.sortField}
        sortOrder={po.sortOrder}
        handleSort={po.handleSort}
        handleOpenPoDetail={(item) => po.modal.open('detail', item)}
        handleOpenPayment={(item) => po.modal.open('payment', item)}
        handleOpenSendPOModal={(item) => po.modal.open('sendPO', item)}
        handleAdvanceStatus={po.handleAdvanceStatus}
        handlePreviewExcelOnWeb={po.handlePreviewExcelOnWeb}
        handleDownloadExcel={po.handleDownloadExcel}
        downloadingId={po.downloadingId}
        navigate={navigate}
      />

      <ExcelPreviewModal
        isOpen={po.modal.isOpen('excelPreview')}
        onClose={() => po.modal.close('excelPreview')}
        title={previewData.title || ''}
        downloadUrl={previewData.url || ''}
      />

      <SendPOModal
        isOpen={po.modal.isOpen('sendPO')}
        onClose={() => po.modal.close('sendPO')}
        po={po.modal.data('sendPO')}
        onSuccess={() => {
          po.queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        }}
      />

      <ConfirmDialog
        open={po.modal.isOpen('confirm')}
        title={confirmData.title}
        message={confirmData.message}
        confirmText={confirmData.confirmText}
        variant={confirmData.variant}
        loading={po.updateStatusMutation.isPending}
        onCancel={() => po.modal.close('confirm')}
        onConfirm={async () => {
          if (confirmData.po && confirmData.nextStatus) {
            await po.doAdvanceStatus(confirmData.po._id, confirmData.nextStatus, confirmData.po.poNumber);
            po.modal.close('confirm');
          }
        }}
      />

      <PODetailDrawer
        isOpen={po.modal.isOpen('detail')}
        selectedPoDetail={po.modal.data('detail')}
        onClose={() => po.modal.close('detail')}
        renderStatusBadge={(st) => st}
        renderPaymentBadge={(item) => item}
        handlePreviewExcelOnWeb={po.handlePreviewExcelOnWeb}
        handleOpenSendPOModal={(item) => po.modal.open('sendPO', item)}
        handleOpenPayment={(item) => po.modal.open('payment', item)}
        navigate={navigate}
      />

      <PurchaseOrderPaymentModal
        po={po.modal.data('payment')}
        open={po.modal.isOpen('payment')}
        onClose={() => po.modal.close('payment')}
        onSuccess={async () => {
          po.queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        }}
      />
    </div>
  );
}
