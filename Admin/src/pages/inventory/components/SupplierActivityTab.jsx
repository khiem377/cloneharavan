import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  formatVnd,
  formatDateTime,
  getStatusMeta,
  getPaymentMeta,
  ROW_TYPE_LABEL,
} from './supplierActivityUtils';

const COL_COUNT = 6;

function SkeletonRows() {
  return Array.from({ length: 4 }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: COL_COUNT }).map((__, j) => (
        <td key={j} className="py-3 px-3">
          <div className={`h-3.5 rounded-[4px] bg-muted animate-pulse ${j === 3 ? 'w-3/4' : 'w-5/6'}`} />
        </td>
      ))}
    </tr>
  ));
}

/**
 * Lịch sử đơn nhập / đơn trả của NCC trong kỳ. Đủ 4 trạng thái: loading, error, empty, success.
 */
export default function SupplierActivityTab({ data, isLoading, isError, onRetry, page, onPageChange }) {
  const navigate = useNavigate();
  const history = data?.history || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const openRow = (row) => {
    if (row.type === 'purchase_order') navigate(`/purchase-orders?poId=${row._id}`);
    else navigate('/purchase-returns');
  };

  return (
    <div className="flex flex-col space-y-3 text-xs">
      <h3 className="font-bold text-foreground text-sm">Lịch sử nhập / trả hàng</h3>

      <div className="overflow-x-auto rounded-[6px] border border-border bg-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 font-bold text-muted-foreground text-[11px] uppercase">
              <th className="py-2.5 px-3 whitespace-nowrap">Loại</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Mã chứng từ</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Ngày tạo</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Giá trị</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Trạng thái</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Thanh toán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && !data ? (
              <SkeletonRows />
            ) : isError ? (
              <tr>
                <td colSpan={COL_COUNT} className="py-10 text-center">
                  <p className="text-muted-foreground mb-3">Không tải được lịch sử nhập / trả hàng.</p>
                  <Button size="sm" variant="outline" onClick={onRetry} className="rounded-[6px] h-8 text-xs">
                    Thử lại
                  </Button>
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={COL_COUNT} className="py-12 text-center text-muted-foreground">
                  Không có đơn nhập hoặc đơn trả nào trong kỳ này.
                </td>
              </tr>
            ) : (
              history.map((row) => {
                const status = getStatusMeta(row);
                const payment = getPaymentMeta(row);
                const isReturn = row.type === 'purchase_return';
                return (
                  <tr
                    key={`${row.type}-${row._id}`}
                    onClick={() => openRow(row)}
                    className="hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                      {ROW_TYPE_LABEL[row.type]}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-primary whitespace-nowrap">{row.code}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap">
                      <span className={isReturn ? 'text-emerald-600' : 'text-foreground'}>
                        {isReturn ? '-' : ''}
                        {formatVnd(row.totalAmount)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <Badge className={`rounded-[4px] text-[10px] font-semibold ${status.tone}`}>{status.label}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <Badge className={`rounded-[4px] text-[10px] font-semibold ${payment.tone}`}>{payment.label}</Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground tabular-nums">
            {pagination.total} chứng từ, trang {pagination.page}/{pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-[6px] h-8 text-xs"
            >
              Trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pagination.totalPages}
              onClick={() => onPageChange(page + 1)}
              className="rounded-[6px] h-8 text-xs"
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
