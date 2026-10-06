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
                <button
                  type="button"
                  className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background mx-auto transition-colors cursor-pointer ${
                    isAllSelected ? 'bg-primary border-primary text-primary-foreground' : ''
                  }`}
                  onClick={onSelectAll}
                >
                  {isAllSelected && <Check className="size-3" />}
                </button>
              </TableHead>
            )}
            {isColumnVisible('customer') && <TableHead>Khách hàng</TableHead>}
            {isColumnVisible('contact') && <TableHead>Liên hệ</TableHead>}
            {isColumnVisible('address') && <TableHead>Địa chỉ mặc định</TableHead>}
            {isColumnVisible('createdAt') && <TableHead>Ngày tham gia</TableHead>}
            {isColumnVisible('status') && <TableHead>Trạng thái</TableHead>}
            {isColumnVisible('actions') && <TableHead className="text-right w-24">Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground font-mono">
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
                    <TableCell className="w-10 px-3 py-2 text-center">
                      <button
                        type="button"
                        className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background mx-auto transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary border-primary text-primary-foreground' : ''
                        }`}
                        onClick={() => onSelectOne(user._id)}
                      >
                        {isSelected && <Check className="size-3" />}
                      </button>
                    </TableCell>
                  )}

                  {/* Customer Info */}
                  {isColumnVisible('customer') && (
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        {user.avatar?.url ? (
                          <img
                            src={user.avatar.url}
                            alt={user.fullName}
                            className="size-8 rounded-[4px] object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="size-8 rounded-[4px] bg-secondary border border-border flex items-center justify-center text-xs font-bold font-mono text-muted-foreground shrink-0">
                            {initials}
                          </div>
                        )}
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

                  {/* Contact */}
                  {isColumnVisible('contact') && (
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <div className="flex items-center gap-1 text-foreground">
                          <Mail className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                        {user.phone ? (
                          <div className="flex items-center gap-1 text-muted-foreground font-mono tabular-nums text-[11px]">
                            <Phone className="size-3 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono italic">Chưa có SĐT</span>
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
                            {[defaultAddr.street, defaultAddr.ward, defaultAddr.district, defaultAddr.city]
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
