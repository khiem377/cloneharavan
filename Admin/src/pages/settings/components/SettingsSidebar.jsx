import {
  Store,
  CreditCard,
  Truck,
  Package,
  History,
  WalletCards,
  Bell,
  Server,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const SAPO_MENUS = [
  { id: 'store', label: 'Cấu hình chung', icon: Store },
  { id: 'notifications', label: 'Mẫu email & Thông báo', icon: Bell },
  { id: 'smtp', label: 'Máy chủ gửi thư (SMTP)', icon: Server },
  { id: 'payment-methods', label: 'Phương thức thanh toán', icon: WalletCards },
  { id: 'checkout', label: 'Trang thanh toán', icon: CreditCard },
  { id: 'shipping-providers', label: 'Đối tác vận chuyển', icon: Truck },
  { id: 'shipping-rules', label: 'Cấu hình vận chuyển', icon: Package },
  { id: 'activity', label: 'Nhật ký hoạt động', icon: History },
];

export default function SettingsSidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="w-full lg:w-60 shrink-0 lg:sticky lg:top-2 self-start z-10">
      <nav className="space-y-1 bg-card border border-border rounded-[6px] p-2 shadow-xs">
        {SAPO_MENUS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              type="button"
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSelectTab(item.id)}
              className={`w-full justify-start text-left gap-2.5 h-9 px-3 text-xs rounded-[6px] transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary/10 text-primary font-bold hover:bg-primary/15'
                  : 'text-foreground hover:text-foreground hover:bg-muted font-medium'
              }`}
            >
              <Icon
                className={`size-4 shrink-0 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
