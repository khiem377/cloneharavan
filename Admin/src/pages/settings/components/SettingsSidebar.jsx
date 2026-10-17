import React from 'react';
import {
  Store,
  CreditCard,
  Truck,
  Package,
  History,
} from 'lucide-react';

const SAPO_MENUS = [
  { id: 'store', label: 'Cấu hình chung', icon: Store },
  { id: 'checkout', label: 'Trang thanh toán', icon: CreditCard },
  { id: 'shipping-providers', label: 'Đối tác vận chuyển', icon: Truck },
  { id: 'shipping-rules', label: 'Cấu hình vận chuyển', icon: Package },
  { id: 'activity', label: 'Nhật ký hoạt động', icon: History },
];

export default function SettingsSidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="w-full lg:w-60 shrink-0">
      <nav className="space-y-0.5 bg-white dark:bg-card border border-[#e1e4e8] dark:border-border rounded-[6px] p-2 shadow-xs">
        {SAPO_MENUS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-[4px] text-[13px] transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#e8f2fe] text-[#0088ff] font-semibold dark:bg-[#0088ff]/15 dark:text-[#38bdf8]'
                  : 'text-[#212b36] hover:bg-[#f4f6f8] font-normal dark:text-foreground dark:hover:bg-accent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#0088ff] dark:text-[#38bdf8]' : 'text-[#637381] dark:text-muted-foreground'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
