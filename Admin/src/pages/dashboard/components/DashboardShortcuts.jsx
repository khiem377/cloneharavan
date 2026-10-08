import { Link } from 'react-router-dom';
import { PlusIcon, WarehouseNavIcon, ZapIcon, TagIcon, FileTextIcon } from '@/components/ui/Icons';

const SHORTCUTS = [
  { to: '/products/new', label: 'Tạo sản phẩm', icon: PlusIcon },
  { to: '/purchase-orders', label: 'Đơn nhập kho (PO)', icon: WarehouseNavIcon },
  { to: '/promotions/flash-sales', label: 'Tạo Flash Sale', icon: ZapIcon },
  { to: '/promotions/coupons', label: 'Mã Giảm Giá', icon: TagIcon },
  { to: '/blog/posts/new', label: 'Soạn bài viết', icon: FileTextIcon },
];

export default function DashboardShortcuts() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
      {SHORTCUTS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] border border-border bg-card hover:border-foreground/30 hover:bg-accent/40 transition-colors text-xs font-medium active:scale-[0.98] group shadow-2xs"
        >
          <div className="size-6 rounded-[4px] bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <item.icon className="size-3.5" />
          </div>
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
