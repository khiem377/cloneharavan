import React from 'react';
import {
  Bell,
  Package,
  AlertCircle,
  Clock,
  Trash2,
  Check,
  ExternalLink,
} from '@/components/ui/Icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'ORDER_NEW':
      return <Package className="size-4 text-blue-600 dark:text-blue-400" />;
    case 'ORDER_CANCELLED':
      return <AlertCircle className="size-4 text-rose-500" />;
    case 'STOCK_LOW':
      return <AlertCircle className="size-4 text-amber-500" />;
    default:
      return <Bell className="size-4 text-primary" />;
  }
};

export default function NotificationTable({
  notifications = [],
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onItemClick,
  onDeleteItem,
  onMarkReadItem,
}) {
  const isAllSelected =
    notifications.length > 0 && selectedIds.length === notifications.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < notifications.length;

  return (
    <div className="rounded-[6px] border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-12 text-center">
              <div className="flex justify-center">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Chọn tất cả thông báo"
                />
              </div>
            </TableHead>
            <TableHead className="min-w-[320px]">Thông báo</TableHead>
            <TableHead className="w-48 text-right font-medium">Thời gian</TableHead>
            <TableHead className="w-24 text-center font-medium">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {notifications.map((item) => {
            const isSelected = selectedIds.includes(item._id);

            return (
              <TableRow
                key={item._id}
                className={`transition-colors cursor-pointer group ${
                  !item.isRead ? 'bg-primary/[0.03] font-medium' : 'hover:bg-muted/30'
                } ${isSelected ? 'bg-primary/10 hover:bg-primary/15' : ''}`}
                onClick={() => onItemClick(item)}
              >
                {/* Checkbox */}
                <TableCell
                  className="text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="flex justify-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(item._id)}
                      aria-label={`Chọn thông báo ${item.title}`}
                    />
                  </div>
                </TableCell>

                {/* Nội dung thông báo */}
                <TableCell>
                  <div className="flex items-center gap-3 py-1">
                    <div className="size-7 rounded-[4px] bg-background border border-border flex items-center justify-center shrink-0">
                      {getNotificationIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs leading-relaxed transition-colors ${
                          !item.isRead ? 'font-bold' : 'font-medium'
                        } text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer`}
                      >
                        {item.message || item.title}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Thời gian */}
                <TableCell className="text-right text-xs text-muted-foreground font-mono tabular-nums whitespace-nowrap">
                  {formatFullDate(item.createdAt)}
                </TableCell>

                {/* Thao tác */}
                <TableCell
                  className="text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1">
                    {!item.isRead && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkReadItem(item._id)}
                        className="size-7 p-0 rounded-[4px] text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="size-3.5" />
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteItem(item._id)}
                      className="size-7 p-0 rounded-[4px] text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
