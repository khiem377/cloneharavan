import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SettingsSidebar from './components/SettingsSidebar';
import GeneralSettingsTab from './components/GeneralSettingsTab';
import CheckoutSettingsTab from './components/CheckoutSettingsTab';
import ShippingProvidersTab from './components/ShippingProvidersTab';
import ShippingRulesTab from './components/ShippingRulesTab';
import PaymentMethodsTab from './components/PaymentMethodsTab';
import ActivityLogTab from './components/ActivityLogTab';
import NotificationSettingsTab from './components/NotificationSettingsTab';
import SmtpSettingsTab from './components/SmtpSettingsTab';
import storeSettingService from '@/services/storeSetting.service';
import { toast } from '@/providers/ToastProvider';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TAB_TITLES = {
  store: 'Cấu hình chung',
  'payment-methods': 'Phương thức thanh toán',
  checkout: 'Trang thanh toán',
  'shipping-providers': 'Đối tác vận chuyển',
  'shipping-rules': 'Cấu hình vận chuyển',
  notifications: 'Cấu hình thông báo & Email',
  smtp: 'Máy chủ gửi thư (SMTP)',
  activity: 'Nhật ký hoạt động',
};

const TAB_ALIASES = {
  store: 'store',
  general: 'store',
  'payment-methods': 'payment-methods',
  payments: 'payment-methods',
  payment: 'payment-methods',
  checkout: 'checkout',
  'checkout-pages': 'checkout',
  'shipping-providers': 'shipping-providers',
  shipping: 'shipping-providers',
  carriers: 'shipping-providers',
  'shipping-rules': 'shipping-rules',
  rules: 'shipping-rules',
  notifications: 'notifications',
  notification: 'notifications',
  email: 'notifications',
  smtp: 'smtp',
  'email-server': 'smtp',
  'mail-server': 'smtp',
  mail: 'smtp',
  activity: 'activity',
  logs: 'activity',
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc tab từ URL param (?tab=... hoặc ?checkout-pages / ?page=...)
  const rawTab = searchParams.get('tab') || searchParams.get('page') || 'store';
  const activeTab = TAB_ALIASES[rawTab] || 'store';

  const handleSelectTab = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await storeSettingService.getSettings();
      setSettings(res.data);
    } catch (err) {
      toast.error('Lỗi tải cấu hình hệ thống: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* HEADER PAGE */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          {TAB_TITLES[activeTab] || 'Cài đặt hệ thống'}
        </h1>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchSettings}
            disabled={loading}
            className="h-8 px-2.5 text-xs font-medium rounded-[6px] border-border bg-card cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Close X Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="size-8 p-0 rounded-[6px] text-muted-foreground hover:text-foreground cursor-pointer"
            title="Đóng trang cài đặt"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* MASTER-DETAIL LAYOUT: SIDEBAR + CONTENT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <SettingsSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

        <main className="flex-1 w-full min-w-0">
          {loading && !settings ? (
            <div className="bg-card border border-border rounded-[6px] p-16 text-center text-xs text-muted-foreground space-y-2 shadow-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary" />
              <p>Đang tải cấu hình...</p>
            </div>
          ) : (
            <>
              {activeTab === 'store' && (
                <GeneralSettingsTab initialData={settings} onRefresh={fetchSettings} />
              )}
              {activeTab === 'payment-methods' && <PaymentMethodsTab />}
              {activeTab === 'checkout' && (
                <CheckoutSettingsTab initialData={settings} onRefresh={fetchSettings} />
              )}
              {activeTab === 'shipping-providers' && <ShippingProvidersTab />}
              {activeTab === 'shipping-rules' && (
                <ShippingRulesTab initialData={settings} onRefresh={fetchSettings} />
              )}
              {activeTab === 'notifications' && <NotificationSettingsTab />}
              {activeTab === 'smtp' && <SmtpSettingsTab />}
              {activeTab === 'activity' && <ActivityLogTab />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
