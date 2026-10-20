import {
  Lock,
  Unlock,
  Eye,
  Check,
  MapPin,
  Mail,
  Phone,
} from '@/components/ui/Icons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import CustomerProviderBadge from './CustomerProviderBadge';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function CustomerTable({
  customers = [],
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  onView,
  onToggleStatus,
  isColumnVisible,
}) {
  const isAllSelected = customers.length > 0 && selectedIds.length === customers.length;

  return (
    <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40 hover:bg-secondary/40">
            {isColumnVisible('select') && (
              <TableHead className="w-10 text-center">
                <div className="flex justify-center">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Chọn tất cả khách hàng"
                  />
                </div>
              </TableHead>
            )}
            {isColumnVisible('customer') && <TableHead>Khách hàng</TableHead>}
            {isColumnVisible('provider') && <TableHead className="w-28">Nguồn</TableHead>}
            {isColumnVisible('contact') && <TableHead>Liên hệ</TableHead>}
            {isColumnVisible('orders') && <TableHead className="text-center w-24">Đơn hàng</TableHead>}
            {isColumnVisible('totalSpent') && <TableHead className="text-right w-32">Tổng chi tiêu</TableHead>}
            {isColumnVisible('address') && <TableHead>Địa chỉ mặc định</TableHead>}
            {isColumnVisible('createdAt') && <TableHead>Ngày tham gia</TableHead>}
            {isColumnVisible('status') && <TableHead>Trạng thái</TableHead>}
            {isColumnVisible('actions') && <TableHead className="text-right w-24">Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-12 text-center text-xs text-muted-foreground font-mono">
                Không tìm thấy khách hàng nào
              </TableCell>
            </TableRow>
          ) : (
            customers.map((user) => {
              const isSelected = selectedIds.includes(user._id);
              const defaultAddr =
                user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
              const initials = (user.fullName?.[0] || user.email?.[0] || '?').toUpperCase();

              return (
                <TableRow
                  key={user._id}
                  className={`transition-colors hover:bg-muted/40 ${
                    isSelected ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''
                  }`}
                >
                  {/* Select */}
                  {isColumnVisible('select') && (
                    <TableCell className="w-10 px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onSelectOne(user._id)}
                          aria-label={`Chọn khách hàng ${user.fullName}`}
                        />
                      </div>
                    </TableCell>
                  )}

                  {/* Customer Info */}
                  {isColumnVisible('customer') && (
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 rounded-[4px] shrink-0 border border-border">
                          <AvatarImage src={user.avatar?.url} alt={user.fullName} />
                          <AvatarFallback className="rounded-[4px] text-xs font-bold font-mono">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {user.fullName || 'Khách hàng'}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono truncate">
                            ID: {user._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {/* Provider */}
                  {isColumnVisible('provider') && (
                    <TableCell className="px-3 py-2">
                      <CustomerProviderBadge user={user} />
                    </TableCell>
                  )}

                  {/* Contact */}
                  {isColumnVisible('contact') && (
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-col gap-0.5 text-xs">
                        {user.email ? (
                          <div className="flex items-center gap-1 text-foreground">
                            <Mail className="size-3 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[180px]">{user.email}</span>
                          </div>
                        ) : user.zaloId ? (
                          <div className="flex items-center gap-1 text-[#0068FF] font-medium text-[11px]">
                            <span className="size-1.5 rounded-full bg-[#0068FF] shrink-0" />
                            <span className="truncate max-w-[180px]">Zalo: {user.zaloName || user.zaloId}</span>
                          </div>
                        ) : user.tiktokId ? (
                          <div className="flex items-center gap-1 text-foreground font-medium text-[11px]">
                            <span className="size-1.5 rounded-full bg-foreground shrink-0" />
                            <span className="truncate max-w-[180px]">TikTok: @{user.tiktokUsername || user.tiktokId}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Chưa liên kết email</span>
                        )}
                        {user.phone ? (
                          <div className="flex items-center gap-1 text-muted-foreground font-mono tabular-nums text-[11px]">
                            <Phone className="size-3 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        ) : defaultAddr?.phone ? (
                          <div className="flex items-center gap-1 text-muted-foreground/80 font-mono tabular-nums text-[11px]" title="Lấy từ sổ địa chỉ nhận hàng">
                            <Phone className="size-3 shrink-0" />
                            <span>{defaultAddr.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono italic">Chưa có SĐT</span>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Orders Count */}
                  {isColumnVisible('orders') && (
                    <TableCell className="px-3 py-2 text-center">
                      <span className="font-mono tabular-nums text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-secondary/70 border border-border">
                        {user.orderCount || 0}
                      </span>
                    </TableCell>
                  )}

                  {/* Total Spent */}
                  {isColumnVisible('totalSpent') && (
                    <TableCell className="px-3 py-2 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono tabular-nums text-xs font-bold text-foreground">
                          {formatCurrency(user.totalSpent)}
                        </span>
                        {user.totalSpent >= 5000000 && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 font-mono">
                            ★ VIP
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Address */}
                  {isColumnVisible('address') && (
                    <TableCell className="px-3 py-2">
                      {defaultAddr ? (
                        <div className="flex items-start gap-1 text-xs text-muted-foreground max-w-[200px]">
                          <MapPin className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {[
                              defaultAddr.detailAddress || defaultAddr.street,
                              defaultAddr.ward,
                              defaultAddr.district,
                              defaultAddr.province || defaultAddr.city,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono italic">—</span>
                      )}
                    </TableCell>
                  )}

                  {/* CreatedAt */}
                  {isColumnVisible('createdAt') && (
                    <TableCell className="px-3 py-2 font-mono text-xs text-muted-foreground tabular-nums">
                      {formatDate(user.createdAt)}
                    </TableCell>
                  )}

                  {/* Status */}
                  {isColumnVisible('status') && (
                    <TableCell className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[11px] font-medium border ${
                          user.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            user.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'
                          }`}
                        />
                        {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </TableCell>
                  )}

                  {/* Actions */}
                  {isColumnVisible('actions') && (
                    <TableCell className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Xem chi tiết"
                          onClick={() => onView(user)}
                          className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          onClick={() => onToggleStatus(user)}
                          className={`size-7 rounded-[4px] ${
                            user.isActive
                              ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                              : 'text-emerald-600 hover:bg-emerald-500/10'
                          }`}
                        >
                          {user.isActive ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
