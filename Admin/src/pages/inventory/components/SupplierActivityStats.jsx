import { formatVnd } from './supplierActivityUtils';

const CELLS = [
  { key: 'purchaseOrdersCreated', label: 'Đơn nhập đã tạo', unit: 'đơn' },
  { key: 'purchaseOrdersReceivedUnpaid', label: 'Đã nhập, chưa thanh toán', unit: 'đơn', warn: true },
  { key: 'returnsCreated', label: 'Đơn trả đã tạo', unit: 'đơn' },
  { key: 'returnsPendingRefund', label: 'Đã trả, chưa nhận hoàn tiền', unit: 'đơn', warn: true },
];

/**
 * Hàng 4 chỉ số theo kỳ + bộ chọn tháng. Phẳng, ngăn cách bằng đường kẻ.
 */
export default function SupplierActivityStats({ stats, month, onMonthChange, isLoading }) {
  return (
    <div className="border-b border-border shrink-0">
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <h3 className="text-sm font-bold text-foreground">
          {month ? 'Tổng quan trong kỳ' : 'Tổng quan toàn bộ thời gian'}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => onMonthChange('')}
            className={`h-8 rounded-[6px] border px-3 text-xs font-medium transition-colors active:scale-[0.98] ${
              month === ''
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả thời gian
          </button>
          <label className="flex items-center gap-2">
            Tháng
            <input
              type="month"
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="h-8 rounded-[6px] border border-border bg-background px-2 text-xs font-mono tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border border-t border-border">
        {CELLS.map((cell) => {
          const item = stats?.[cell.key];
          const hasDebt = cell.warn && item?.amount > 0;
          return (
            <div key={cell.key} className="px-6 py-3 min-h-[76px]">
              <p className="text-[11px] text-muted-foreground">{cell.label}</p>
              {isLoading && !stats ? (
                <div className="mt-2 h-4 w-20 rounded-[4px] bg-muted animate-pulse" />
              ) : (
                <>
                  <p className="mt-1 text-sm font-bold text-foreground tabular-nums">
                    {item?.count || 0} {cell.unit}
                  </p>
                  <p
                    className={`font-mono text-xs tabular-nums ${
                      hasDebt ? 'text-destructive font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {formatVnd(item?.amount)}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
