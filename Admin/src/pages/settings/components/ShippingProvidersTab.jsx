import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/providers/ToastProvider';
import storeSettingService from '@/services/storeSetting.service';
import ConnectShippingModal from './ConnectShippingModal';
import { CarrierLogo } from './CarrierLogos';
import { SHIPPING_CARRIERS } from './shippingCarriersData';
import {
  MoreHorizontal,
  CheckCircle2,
  RefreshCw,
  Star,
  Check,
} from 'lucide-react';

export default function ShippingProvidersTab() {
  const [carriers, setCarriers] = useState(SHIPPING_CARRIERS);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [testingCode, setTestingCode] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const fetchCarriers = async () => {
    try {
      const res = await storeSettingService.getShippingProviders();
      if (res.data && res.data.length > 0) {
        const serverMap = {};
        res.data.forEach((p) => {
          serverMap[p.code] = p;
        });

        setCarriers(
          SHIPPING_CARRIERS.map((c) => ({
            ...c,
            status: serverMap[c.code]?.status || c.status,
            isDefault: Boolean(serverMap[c.code]?.isDefault),
            maskedCredentials: serverMap[c.code]?.maskedCredentials || {},
          }))
        );
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ carriers:', err.message);
    }
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  const handleDisconnect = async (code) => {
    if (!window.confirm('Bạn có chắc chắn muốn ngắt kết nối với đối tác vận chuyển này?')) return;
    try {
      await storeSettingService.disconnectShippingProvider(code);
      toast.success('Đã ngắt kết nối thành công');
      fetchCarriers();
      setActiveMenu(null);
    } catch (err) {
      toast.error('Lỗi ngắt kết nối: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTestHandshake = async (code) => {
    try {
      setTestingCode(code);
      const res = await storeSettingService.testShippingProvider(code);
      if (res.success) {
        toast.success(res.message || 'Kiểm tra thông số kết nối thành công!');
      } else {
        toast.error(res.message || 'Kiểm tra thất bại');
      }
    } catch (err) {
      toast.error('Lỗi kiểm tra kết nối: ' + (err.response?.data?.message || err.message));
    } finally {
      setTestingCode(null);
      setActiveMenu(null);
    }
  };

  const handleSetDefault = async (code) => {
    try {
      const res = await storeSettingService.setDefaultShippingProvider(code);
      if (res.success) {
        toast.success(res.message || 'Đã đặt đối tác mặc định thành công!');
        fetchCarriers();
      }
    } catch (err) {
      toast.error('Lỗi đặt mặc định: ' + (err.response?.data?.message || err.message));
    } finally {
      setActiveMenu(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* DANH SÁCH ĐỐI TÁC VẬN CHUYỂN TRỰC TIẾP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[15px] font-semibold text-[#212b36] dark:text-foreground">
            Kết nối trực tiếp với đối tác vận chuyển
          </h3>
          <span className="text-[12.5px] text-[#637381] dark:text-muted-foreground">
            Môi trường thử nghiệm Sandbox &amp; Kết nối chính thức
          </span>
        </div>

        {/* CONTAINER CHIA DÒNG 1PX */}
        <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-xs divide-y divide-[#dfe3e8] dark:divide-border">
          {carriers.map((carrier) => {
            const isConnected = carrier.status === 'connected';

            return (
              <div
                key={carrier.code}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[#fafbfb] dark:hover:bg-muted/30 transition-colors gap-3"
              >
                {/* Cột Logo */}
                <div className="w-36 min-h-[40px] flex items-center shrink-0">
                  <CarrierLogo code={carrier.code} />
                </div>

                {/* Cột Mô tả & Trạng thái */}
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-[13px] text-[#212b36] dark:text-foreground leading-normal">{carrier.desc}</p>
                  {carrier.subLink && (
                    <a
                      href="#vat"
                      className="text-[12px] text-[#0088ff] hover:underline block mt-0.5"
                    >
                      {carrier.subLink}
                    </a>
                  )}
                  {isConnected && (
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1.5 text-[11.5px] text-[#008848] dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã kết nối
                      </span>
                      <button
                        type="button"
                        onClick={() => !carrier.isDefault && handleSetDefault(carrier.code)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11.5px] transition-all cursor-pointer ${
                          carrier.isDefault
                            ? 'bg-[#e6f4ff] text-[#0088ff] border border-[#b3ddff] dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800 font-semibold'
                            : 'bg-slate-50 text-slate-600 hover:bg-[#f0f7ff] hover:text-[#0088ff] hover:border-[#b3ddff] border border-slate-200 dark:bg-muted dark:text-muted-foreground'
                        }`}
                        title={carrier.isDefault ? 'Đang là đối tác mặc định' : 'Bấm để đặt làm đối tác mặc định'}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          carrier.isDefault ? 'border-[#0088ff] bg-[#0088ff] text-white' : 'border-slate-400 bg-white'
                        }`}>
                          {carrier.isDefault && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        <span>{carrier.isDefault ? 'Mặc định' : 'Chọn mặc định'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Cột Hành động */}
                <div className="shrink-0 flex items-center gap-2 relative">
                  {isConnected ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenu(activeMenu === carrier.code ? null : carrier.code)
                        }
                        className="p-1.5 rounded-[4px] border border-[#dfe3e8] dark:border-border text-[#637381] dark:text-muted-foreground hover:text-[#212b36] dark:hover:text-foreground hover:bg-white dark:hover:bg-accent transition-colors cursor-pointer"
                        title="Tùy chọn đối tác"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown menu */}
                      {activeMenu === carrier.code && (
                        <div className="absolute right-0 top-8 w-44 bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-lg py-1 z-30 text-[13px] text-[#212b36] dark:text-foreground">
                          {!carrier.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(carrier.code)}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#f4f6f8] dark:hover:bg-accent flex items-center gap-2 cursor-pointer text-[#0088ff] font-medium"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>Đặt làm mặc định</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleTestHandshake(carrier.code)}
                            disabled={testingCode === carrier.code}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#f4f6f8] dark:hover:bg-accent flex items-center justify-between cursor-pointer"
                          >
                            <span>Kiểm tra kết nối</span>
                            {testingCode === carrier.code && <RefreshCw className="w-3 h-3 animate-spin text-[#0088ff]" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDisconnect(carrier.code)}
                            className="w-full text-left px-3 py-1.5 hover:bg-[#fff0f0] dark:hover:bg-rose-950/40 text-[#e01a22] dark:text-rose-400 cursor-pointer"
                          >
                            Ngừng kết nối
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setSelectedCarrier(carrier)}
                      className="px-4 py-1.5 rounded-[6px] text-[13px] font-medium shadow-xs active:scale-[0.98] transition-transform bg-[#0088ff] hover:bg-[#0077e6] text-white cursor-pointer"
                    >
                      {carrier.isRegisterBtn ? 'Đăng ký' : 'Kết nối'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL KẾT NỐI */}
      <ConnectShippingModal
        isOpen={!!selectedCarrier}
        onClose={() => setSelectedCarrier(null)}
        provider={selectedCarrier}
        onSuccess={fetchCarriers}
      />
    </div>
  );
}
