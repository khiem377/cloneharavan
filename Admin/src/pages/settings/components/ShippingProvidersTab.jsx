import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/providers/ToastProvider';
import storeSettingService from '@/services/storeSetting.service';
import ConnectShippingModal from './ConnectShippingModal';
import { CarrierLogo } from './CarrierLogos';
import {
  MoreHorizontal,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const SHIPPING_CARRIERS = [
  {
    code: 'green_sm',
    name: 'GREEN SM',
    desc: 'Dịch vụ giao nhận siêu tốc cho nhà bán hàng thương mại điện tử',
    status: 'disconnected',
  },
  {
    code: 'vnpost',
    name: 'VIETNAM POST',
    desc: 'Cung cấp bưu chuyển phát nhanh EMS và chuyển phát bưu kiện',
    status: 'disconnected',
  },
  {
    code: 'best_express',
    name: 'BEST EXPRESS',
    desc: 'Giải pháp vận chuyển thông minh, nhanh chóng, an toàn, tiết kiệm',
    status: 'disconnected',
  },
  {
    code: 'spx',
    name: 'SPX',
    desc: 'Giải pháp vận chuyển thông minh, nhanh chóng, an toàn, tiết kiệm',
    status: 'disconnected',
  },
  {
    code: 'ghn',
    name: 'GiaoHangNhanh',
    desc: 'Giải pháp giao hàng, thu hộ chuyên nghiệp trải dài mọi miền đất nước',
    status: 'disconnected',
  },
  {
    code: 'ghtk',
    name: 'GHTK',
    desc: 'Dịch vụ giao hàng thu tiền tận nơi, tốc độ nhanh, phủ sóng toàn quốc',
    status: 'disconnected',
    isRegisterBtn: true,
  },
  {
    code: 'grab_express',
    name: 'Grab Express',
    desc: 'Dịch vụ nhận gửi, vận chuyển và phát nhanh bằng đường bộ',
    subLink: 'Đăng ký xuất hóa đơn (VAT)',
    status: 'disconnected',
  },
  {
    code: 'viettelpost',
    name: 'ViettelPost',
    desc: 'Dịch vụ nhận gửi, vận chuyển và phát nhanh bằng đường bộ',
    status: 'disconnected',
  },
  {
    code: 'ahamove',
    name: 'Ahamove',
    desc: 'Dịch vụ giao hàng nội thành siêu tốc',
    status: 'disconnected',
  },
  {
    code: 'jt_express',
    name: 'J&T Express',
    desc: 'Hỗ trợ các hoạt động giao nhận hàng hóa nhanh chóng',
    status: 'disconnected',
  },
];

export default function ShippingProvidersTab() {
  const [carriers, setCarriers] = useState(SHIPPING_CARRIERS);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [testingCode, setTestingCode] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const fetchCarriers = async () => {
    try {
      const res = await storeSettingService.getShippingProviders();
      if (res.data && res.data.length > 0) {
        // Merge trạng thái thực tế từ backend
        const serverMap = {};
        res.data.forEach((p) => {
          serverMap[p.code] = p;
        });

        setCarriers((prev) =>
          prev.map((c) => ({
            ...c,
            status: serverMap[c.code]?.status || c.status,
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

        {/* SINGLE FLAT CARD CONTAINER DIVIDED BY 1PX LINES */}
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

                {/* Cột Mô tả */}
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
                    <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-[#008848] dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã kết nối
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

                      {/* Dropdown menu Sapo */}
                      {activeMenu === carrier.code && (
                        <div className="absolute right-0 top-8 w-44 bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-lg py-1 z-30 text-[13px] text-[#212b36] dark:text-foreground">
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

      {/* 3. MODAL KẾT NỐI TỪNG HÃNG CHUẨN SAPO 100% */}
      <ConnectShippingModal
        isOpen={!!selectedCarrier}
        onClose={() => setSelectedCarrier(null)}
        provider={selectedCarrier}
        onSuccess={fetchCarriers}
      />
    </div>
  );
}
