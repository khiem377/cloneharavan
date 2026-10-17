import { X, Mail, Phone, MapPin, CheckCircle2, Lock, Unlock } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { useUserDetail } from '@/hooks/useUsers';
import CustomerProviderBadge, { getProviderInfo } from './CustomerProviderBadge';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default function CustomerDetailModal({ user: initialUser, onClose, onToggleStatus }) {
  if (!initialUser) return null;

  const { data: detailRes } = useUserDetail(initialUser._id);
  const user = detailRes?.data?.user || detailRes?.data || initialUser;

  const initials = (user.fullName?.[0] || user.email?.[0] || '?').toUpperCase();
  const avgOrderValue = user.orderCount > 0 ? Math.round((user.totalSpent || 0) / user.orderCount) : 0;
  const providerInfo = getProviderInfo(user);
  const fallbackPhone = user.phone || user.addresses?.[0]?.phone;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-[6px] border border-border bg-card shadow-lg text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 font-semibold">
          <h2 className="text-base font-semibold text-foreground">Hồ sơ khách hàng</h2>
          <button
            type="button"
            className="inline-flex size-7 items-center justify-center rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-5 overflow-y-auto max-h-[75vh]">
          {/* Avatar & Summary */}
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            {user.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.fullName}
                className="size-16 rounded-[6px] object-cover border border-border shrink-0"
              />
            ) : (
              <div className="size-16 rounded-[6px] bg-primary text-primary-foreground font-mono text-2xl font-bold flex items-center justify-center shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-foreground truncate">{user.fullName || 'Khách hàng'}</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-[10px] font-semibold border ${
                    user.isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                </span>
                <CustomerProviderBadge user={user} />
                {user.totalSpent >= 5000000 && (
                  <span className="inline-flex items-center rounded-[4px] px-2 py-0.5 text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono">
                    ★ VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                {user.email || (
                  <span className="italic text-muted-foreground/80">
                    Đăng nhập qua {providerInfo.label}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono tabular-nums mt-1">
                Tham gia: {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Purchasing KPI */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase font-mono text-muted-foreground">Thống kê mua sắm</h4>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-[6px] border border-border bg-secondary/30">
                <span className="text-muted-foreground block text-[11px]">Tổng chi tiêu</span>
                <span className="font-mono tabular-nums font-bold text-foreground text-sm mt-0.5 block">
                  {formatCurrency(user.totalSpent)}
                </span>
              </div>
              <div className="p-3 rounded-[6px] border border-border bg-secondary/30">
                <span className="text-muted-foreground block text-[11px]">Số đơn hàng</span>
                <span className="font-mono tabular-nums font-bold text-foreground text-sm mt-0.5 block">
                  {user.orderCount || 0} đơn
                </span>
              </div>
              <div className="p-3 rounded-[6px] border border-border bg-secondary/30">
                <span className="text-muted-foreground block text-[11px]">Trung bình / đơn</span>
                <span className="font-mono tabular-nums font-bold text-foreground text-sm mt-0.5 block">
                  {formatCurrency(avgOrderValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase font-mono text-muted-foreground">Thông tin liên hệ</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-[6px] border border-border bg-secondary/30">
                <span className="text-muted-foreground block text-[11px]">Nguồn tài khoản</span>
                <div className="mt-1">
                  <CustomerProviderBadge user={user} showDetails={true} />
                </div>
              </div>
              <div className="p-3 rounded-[6px] border border-border bg-secondary/30">
                <span className="text-muted-foreground block text-[11px]">Email đăng ký</span>
                <span className="font-medium text-foreground truncate block mt-0.5" title={user.email || 'Chưa liên kết email'}>
                  {user.email || <span className="italic text-muted-foreground text-[11px]">Chưa liên kết</span>}
                </span>
              </div>
              <div className="p-3 rounded-[6px] border border-border bg-secondary/30">
                <span className="text-muted-foreground block text-[11px]">Số điện thoại</span>
                <span className="font-medium text-foreground font-mono tabular-nums block mt-0.5">
                  {fallbackPhone || <span className="italic text-muted-foreground text-[11px]">Chưa cung cấp</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase font-mono text-muted-foreground">
              Sổ địa chỉ ({user.addresses?.length || 0})
            </h4>
            {user.addresses?.length > 0 ? (
              <div className="space-y-2">
                {user.addresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    className="p-3 rounded-[6px] border border-border bg-secondary/20 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {addr.fullName || addr.name || user.fullName} ({addr.phone || user.phone || 'Chưa có SĐT'})
                      </span>
                      {addr.isDefault && (
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {[addr.detailAddress || addr.street, addr.ward, addr.district, addr.province || addr.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic font-mono py-2">Khách hàng chưa thêm địa chỉ nhận hàng</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(user)}
            className={`h-8 rounded-[6px] text-xs gap-1.5 font-semibold ${
              user.isActive ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-600 hover:bg-emerald-500/10'
            }`}
          >
            {user.isActive ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
            <span>{user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</span>
          </Button>

          <Button
            size="sm"
            onClick={onClose}
            className="h-8 rounded-[6px] text-xs font-semibold"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
