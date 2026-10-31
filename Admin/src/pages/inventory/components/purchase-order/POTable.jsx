import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from '@/components/ui/Icons';
import { Card } from '@/components/ui/card';
import DataTablePagination from '@/components/ui/DataTablePagination';
import PORowItem from './PORowItem';

export default function POTable({
  orders,
  isLoading,
  page,
  pageSize,
  pagination,
  setPage,
  setPageSize,
  columnVisibility,
  sortField,
  sortOrder,
  handleSort,
  handleOpenPoDetail,
  handleOpenPayment,
  handleOpenSendPOModal,
  handleAdvanceStatus,
  handlePreviewExcelOnWeb,
  handleDownloadExcel,
  downloadingId,
  navigate,
}) {
  const { isColumnVisible } = columnVisibility;

  const renderSortHeader = (field, label, align = 'left', extraClass = '') => {
    const isSorted = sortField === field;
    const alignClass = align === 'center' ? 'justify-center text-center' : align === 'right' ? 'justify-end text-right' : 'justify-start text-left';

    return (
      <th
        onClick={() => handleSort(field)}
        className={`px-4 py-3.5 whitespace-nowrap cursor-pointer select-none hover:bg-muted/80 transition-colors ${extraClass}`}
      >
        <div className={`flex items-center gap-1.5 ${alignClass}`}>
          <span>{label}</span>
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary shrink-0" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-primary shrink-0" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          )}
        </div>
      </th>
    );
  };

  return (
    <Card className="rounded-[6px] border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
            <tr>
              {isColumnVisible('stt') && <th className="px-4 py-3.5 text-center w-12 whitespace-nowrap">STT</th>}
              {isColumnVisible('poNumber') && renderSortHeader('poNumber', 'Mã Đơn PO', 'left', 'w-36')}
              {isColumnVisible('warehouse') && <th className="px-4 py-3.5 whitespace-nowrap text-left text-xs uppercase text-muted-foreground font-semibold">Kho Nhập</th>}
              {isColumnVisible('supplier') && renderSortHeader('supplierId', 'Nhà Cung Cấp', 'left', 'min-w-[220px]')}
              {isColumnVisible('itemCount') && renderSortHeader('itemCount', 'Số Loại SP', 'center', 'w-24')}
              {isColumnVisible('totalQuantity') && renderSortHeader('totalQuantity', 'Tổng SL', 'center', 'w-24')}
              {isColumnVisible('totalAmount') && renderSortHeader('totalAmount', 'Tổng Giá Nhập', 'right', 'w-36')}
              {isColumnVisible('paymentStatus') && <th className="px-4 py-3.5 whitespace-nowrap w-40 text-center">Thanh Toán</th>}
              {isColumnVisible('status') && renderSortHeader('status', 'Trạng Thái Kho', 'center', 'w-48')}
              {isColumnVisible('stepper') && <th className="px-4 py-3.5 whitespace-nowrap w-48 text-center">Nấc Tiến Quy Trình</th>}
              {isColumnVisible('actions') && <th className="px-4 py-3.5 whitespace-nowrap w-56 text-right">Xem & Tải Excel</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={columnVisibility.visibleCount} className="py-8 text-center text-sm text-muted-foreground">
                  Đang tải danh sách đơn nhập kho...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={columnVisibility.visibleCount} className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có đơn nhập kho nào
                </td>
              </tr>
            ) : (
              orders.map((po, idx) => (
                <PORowItem
                  key={po._id}
                  po={po}
                  idx={idx}
                  page={page}
                  pageSize={pageSize}
                  isColumnVisible={isColumnVisible}
                  handleOpenPoDetail={handleOpenPoDetail}
                  handleOpenPayment={handleOpenPayment}
                  handleOpenSendPOModal={handleOpenSendPOModal}
                  handleAdvanceStatus={handleAdvanceStatus}
                  handlePreviewExcelOnWeb={handlePreviewExcelOnWeb}
                  handleDownloadExcel={handleDownloadExcel}
                  downloadingId={downloadingId}
                  navigate={navigate}
                />
              ))
            )}
          </tbody>
        </table>
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
    </Card>
  );
}
