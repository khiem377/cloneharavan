import { Link } from 'react-router-dom';
import { ChevronRightIcon, StoreFrontIcon } from '@/components/ui/Icons';
import { DashRecentOrdersIcon } from './DashboardCustomIcons';

const STATUS_MAP = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  CONFIRMED: { label: 'Đã duyệt', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  SHIPPING: { label: 'Đang giao', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' },
  DELIVERED: { label: 'Hoàn tất', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' },
  RETURNED: { label: 'Hoàn hàng', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' },
};

export default function DashboardRecentOrders({ recentOrders = [] }) {
  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}`;
  };

  return (
    <div className="border border-border bg-card rounded-[6px] p-4 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <DashRecentOrdersIcon size={18} className="text-primary" />
            <span>Đơn hàng mới nhất</span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tiến độ xử lý các đơn vừa phát sinh trên hệ thống</p>
        </div>
        <Link
          to="/orders"
          className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium font-mono"
        >
          Tất cả đơn hàng <ChevronRightIcon className="size-3" />
        </Link>
      </div>

      {recentOrders.length > 0 ? (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                <th className="pb-2 font-medium">Mã đơn</th>
                <th className="pb-2 font-medium">Khách hàng</th>
                <th className="pb-2 font-medium">Tổng tiền</th>
                <th className="pb-2 font-medium">Trạng thái</th>
                <th className="pb-2 font-medium text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {recentOrders.map((order) => {
                const statusMeta = STATUS_MAP[order.orderStatus] || {
                  label: order.orderStatus,
                  color: 'bg-secondary text-foreground border-border',
                };
                const totalAmount = order.pricing?.totalAmount || 0;
                const customerName = order.shippingAddress?.fullName || 'Khách vãng lai';

                return (
                  <tr key={order._id || order.orderCode} className="hover:bg-accent/40 transition-colors group">
                    <td className="py-2.5 font-mono font-medium text-foreground">
                      <Link
                        to={`/orders?search=${order.orderCode}`}
                        className="text-primary hover:underline"
                      >
                        {order.orderCode}
                      </Link>
                    </td>
                    <td className="py-2.5">
                      <span className="font-medium text-foreground truncate max-w-32 block">{customerName}</span>
                    </td>
                    <td className="py-2.5 font-mono font-bold tabular-nums text-foreground">
                      {formatCurrency(totalAmount)}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-[6px] text-[10px] font-bold font-mono border ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-muted-foreground text-right tabular-nums">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-44 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
          <DashRecentOrdersIcon size={32} className="text-muted-foreground/40" />
          <span>Chưa có đơn hàng nào phát sinh</span>
        </div>
      )}
    </div>
  );
}
