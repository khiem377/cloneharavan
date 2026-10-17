import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/providers/ToastProvider';
import paymentProviderService from '@/services/paymentProvider.service';
import ConnectPaymentModal from './ConnectPaymentModal';
import { PaymentMethodLogo } from './PaymentLogos';
import {
  MoreHorizontal,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function PaymentMethodsTab() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [togglingCode, setTogglingCode] = useState(null);
  const [testingCode, setTestingCode] = useState(null);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await paymentProviderService.getProviders();
      if (res.data) {
        setProviders(res.data);
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách cổng thanh toán: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleTestHandshake = async (code) => {
    try {
      setTestingCode(code);
      const res = await paymentProviderService.testProvider(code);
      toast.success(res.message || 'Kiểm tra thông số kết nối thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Kiểm tra kết nối thất bại');
    } finally {
      setTestingCode(null);
      setActiveMenu(null);
    }
  };

  const handleToggleEnable = async (provider, newStatus) => {
    const code = provider.code;
    if (provider.status !== 'connected' && code !== 'cod') {
      toast.error('Cần kết nối keys trước khi kích hoạt hiển thị tại Checkout!');
      return;
    }

    try {
      setTogglingCode(code);
      const res = await paymentProviderService.toggleEnable(code, newStatus);
      toast.success(res.message);
      setProviders((prev) =>
        prev.map((p) => (p.code === code ? { ...p, isEnabled: res.data.isEnabled } : p))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi bật/tắt hiển thị checkout');
    } finally {
      setTogglingCode(null);
    }
  };

  const handleDisconnect = async (code) => {
    if (!window.confirm('Bạn có chắc chắn muốn ngắt kết nối cổng thanh toán này? Keys xác thực sẽ bị xóa và cổng sẽ bị ẩn khỏi trang checkout.')) {
      return;
    }
    try {
      await paymentProviderService.disconnectProvider(code);
      toast.success('Đã ngắt kết nối cổng thanh toán');
      setActiveMenu(null);
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi ngắt kết nối');
    }
  };

  const integrated = providers.filter((p) => p.type === 'gateway');
  const manual = providers.filter((p) => p.type === 'manual');

  return (
    <div className="space-y-6">
      {/* 1. PHƯƠNG THỨC THANH TOÁN TÍCH HỢP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-[15px] font-semibold text-[#212b36] dark:text-foreground">
              Phương thức thanh toán tích hợp
            </h3>
            <p className="text-[12.5px] text-[#637381] dark:text-muted-foreground mt-0.5">
              Kết nối API Keys các cổng thanh toán và cấu hình hiển thị độc lập tại trang Checkout
            </p>
          </div>
          <button
            type="button"
            onClick={fetchProviders}
            disabled={loading}
            className="p-1.5 text-[#637381] hover:text-[#212b36] dark:text-muted-foreground rounded-[4px] hover:bg-slate-100 dark:hover:bg-accent transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0088ff]' : ''}`} />
          </button>
        </div>

        {/* CONTAINER CHUẨN SAPO 1PX BORDER & DIVIDE-Y */}
        <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-xs divide-y divide-[#dfe3e8] dark:divide-border overflow-visible">
          {integrated.map((gateway) => {
            const isConnected = gateway.status === 'connected';
            const isCheckoutEnabled = Boolean(gateway.isEnabled);
            const isToggling = togglingCode === gateway.code;

            return (
              <div
                key={gateway.code}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-[#fafbfb] dark:hover:bg-muted/30 transition-colors gap-4"
              >
                {/* Logo & Thông tin */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-36 h-10 flex items-center shrink-0">
                    <PaymentMethodLogo code={gateway.code} className="h-7 max-w-full" />
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[13px] text-[#212b36] dark:text-foreground leading-snug font-medium">
                      {gateway.shortDesc || gateway.name}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {/* Trạng thái kết nối */}
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#008848] dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã kết nối ({gateway.environment === 'production' ? 'Production' : 'Sandbox'})
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-[#637381] dark:text-muted-foreground">
                          Chưa kết nối khóa API
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phân khu Điều khiển Checkout & Hành động */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#f4f6f8] dark:border-border">
                  {/* CÔNG TẮC ẨN / HIỆN CHECKOUT */}
                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <div className="text-[12px] font-medium text-[#212b36] dark:text-foreground flex items-center gap-1 justify-end">
                        {isCheckoutEnabled ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-[#0088ff]" />
                            <span>Hiện ở Checkout</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-400">Ẩn ở Checkout</span>
                          </>
                        )}
                      </div>
                      {!isConnected && (
                        <span className="text-[10.5px] text-[#919eab] block">Cần kết nối trước</span>
                      )}
                    </div>

                    <Switch
                      checked={isCheckoutEnabled}
                      disabled={!isConnected || isToggling}
                      onCheckedChange={(checked) => handleToggleEnable(gateway, checked)}
                      className="cursor-pointer"
                    />
                  </div>

                  {/* NÚT KẾT NỐI / CẤU HÌNH */}
                  <div className="flex items-center gap-2 relative">
                    {isConnected ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProvider(gateway)}
                          className="h-8 px-3 rounded-[6px] text-[12.5px] font-medium border-[#c4cdd5] dark:border-border hover:bg-slate-50 dark:hover:bg-accent bg-white dark:bg-card text-[#212b36] dark:text-foreground cursor-pointer flex items-center gap-1.5"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          Cấu hình
                        </Button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenu(activeMenu === gateway.code ? null : gateway.code)
                            }
                            className="p-1.5 rounded-[4px] border border-[#dfe3e8] dark:border-border text-[#637381] hover:text-[#212b36] dark:hover:text-foreground hover:bg-white dark:hover:bg-accent transition-colors cursor-pointer"
                            title="Tùy chọn khác"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenu === gateway.code && (
                            <div className="absolute right-0 top-9 w-44 bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-lg py-1 z-30 text-[13px]">
                              <button
                                type="button"
                                onClick={() => handleTestHandshake(gateway.code)}
                                disabled={testingCode === gateway.code}
                                className="w-full text-left px-3 py-1.5 hover:bg-[#f4f6f8] dark:hover:bg-accent flex items-center justify-between cursor-pointer text-[#212b36] dark:text-foreground"
                              >
                                <span>Kiểm tra kết nối</span>
                                {testingCode === gateway.code && (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0088ff]" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDisconnect(gateway.code)}
                                className="w-full text-left px-3 py-1.5 hover:bg-[#fff0f0] dark:hover:bg-rose-950/40 text-[#e01a22] dark:text-rose-400 cursor-pointer border-t border-[#f4f6f8] dark:border-border"
                              >
                                Ngắt kết nối cổng
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setSelectedProvider(gateway)}
                        className="h-8 px-4 rounded-[6px] text-[12.5px] font-medium shadow-xs active:scale-[0.98] transition-transform bg-[#0088ff] hover:bg-[#0077e6] text-white cursor-pointer"
                      >
                        Kết nối
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PHƯƠNG THỨC THANH TOÁN THỦ CÔNG */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-[15px] font-semibold text-[#212b36] dark:text-foreground">
              Phương thức thanh toán thủ công
            </h3>
            <p className="text-[12.5px] text-[#637381] dark:text-muted-foreground mt-0.5">
              Các hình thức thanh toán trực tiếp không cần tích hợp cổng đối tác
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-xs divide-y divide-[#dfe3e8] dark:divide-border">
          {manual.map((m) => (
            <div
              key={m.code}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-[#fafbfb] dark:hover:bg-muted/30 transition-colors gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-36 h-10 flex items-center shrink-0">
                  <PaymentMethodLogo code={m.code} className="h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#212b36] dark:text-foreground leading-snug font-medium">
                    {m.name}
                  </p>
                  <p className="text-[12px] text-[#637381] dark:text-muted-foreground mt-0.5">
                    {m.shortDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#f4f6f8] dark:border-border">
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="text-[12px] font-medium text-[#212b36] dark:text-foreground block">
                      {m.isEnabled ? 'Đang hiển thị ở Checkout' : 'Đã ẩn khỏi Checkout'}
                    </span>
                  </div>
                  <Switch
                    checked={Boolean(m.isEnabled)}
                    disabled={togglingCode === m.code}
                    onCheckedChange={(checked) => handleToggleEnable(m, checked)}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CẤU HÌNH VÀ KẾT NỐI KEYS */}
      <ConnectPaymentModal
        isOpen={Boolean(selectedProvider)}
        onClose={() => setSelectedProvider(null)}
        provider={selectedProvider}
        onSuccess={fetchProviders}
      />
    </div>
  );
}
