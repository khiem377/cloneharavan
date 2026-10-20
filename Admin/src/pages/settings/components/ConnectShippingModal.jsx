import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/providers/ToastProvider';
import storeSettingService from '@/services/storeSetting.service';
import { CarrierLogo } from './CarrierLogos';
import ShopLogo from '@/components/common/ShopLogo';
import { Info, ExternalLink } from 'lucide-react';

const SAPO_MODAL_CONFIG = {
  ghn: {
    title: 'Kết nối tài khoản GHN (Giao Hàng Nhanh)',
    notice: 'Môi trường hỗ trợ: Sandbox (dev-online-gateway.ghn.vn) & Production',
    fields: [
      { key: 'token', label: 'Mã Token API*', type: 'password', placeholder: 'Nhập mã Token API (tại khachhang.ghn.vn hoặc sandbox)...', required: true, fullWidth: true },
      { key: 'shopId', label: 'Mã cửa hàng (Shop ID)*', type: 'text', placeholder: 'Nhập Shop ID tài khoản của bạn (VD: 1234567)...', required: true },
      { key: 'clientId', label: 'Mã đối tác (Client ID)', type: 'text', placeholder: 'Mã Client ID (tùy chọn)', required: false },
    ],
    links: [
      { label: 'Cổng đối tác GHN (khachhang.ghn.vn)', url: 'https://khachhang.ghn.vn/' },
      { label: 'Tài liệu Open API GHN v2 (dev-online-gateway)', url: 'https://api.ghn.vn/home/docs/detail' },
    ],
  },
  ghtk: {
    title: 'Kết nối tài khoản GHTK (Giao Hàng Tiết Kiệm)',
    notice: 'Môi trường hỗ trợ: Sandbox (services-staging.ghtklab.com) & Production',
    fields: [
      { key: 'apiToken', label: 'Mã API Token đối tác*', type: 'password', placeholder: 'Nhập mã Token API tạo tại Cấu hình API GHTK...', required: true, fullWidth: true },
      { key: 'partnerCode', label: 'Mã Shop / Client Source', type: 'text', placeholder: 'VD: S12345 hoặc tên nguồn shop (tùy chọn)', required: false, fullWidth: true },
    ],
    links: [
      { label: 'Cổng khách hàng Sandbox GHTK (khachhang-staging.ghtklab.com)', url: 'https://khachhang-staging.ghtklab.com/web' },
      { label: 'Tài liệu Open API GHTK (docs.giaohangtietkiem.vn)', url: 'https://docs.giaohangtietkiem.vn/' },
    ],
  },
  viettelpost: {
    title: 'Kết nối tài khoản ViettelPost',
    notice: 'Môi trường hỗ trợ: Sandbox (partnerdev.viettelpost.vn) & Production',
    fields: [
      { key: 'username', label: 'Tên đăng nhập (Email / SĐT)*', type: 'text', placeholder: 'Nhập số điện thoại hoặc email ViettelPost', required: true },
      { key: 'password', label: 'Mật khẩu*', type: 'password', placeholder: 'Nhập mật khẩu tài khoản ViettelPost', required: true },
      { key: 'appKey', label: 'Mã ứng dụng (App Key)', type: 'text', placeholder: 'Nhập App Key cấp từ partnerdev (tùy chọn)', required: false, fullWidth: true },
    ],
    links: [
      { label: 'Swagger API Sandbox ViettelPost (partnerdev.viettelpost.vn)', url: 'https://partnerdev.viettelpost.vn/v2/swagger-ui.html' },
      { label: 'Cổng đối tác ViettelPost (partner.viettelpost.vn)', url: 'https://partner.viettelpost.vn/' },
    ],
  },
  vnpost: {
    title: 'Kết nối tài khoản VNPost (Bưu điện Việt Nam)',
    notice: 'Môi trường hỗ trợ: UAT Sandbox (my-uat.vnpost.vn) & Production',
    fields: [
      { key: 'username', label: 'Tên đăng nhập My VNPost*', type: 'text', placeholder: 'Nhập tên đăng nhập My VNPost', required: true },
      { key: 'password', label: 'Mật khẩu*', type: 'password', placeholder: 'Nhập mật khẩu tài khoản', required: true },
      { key: 'customerCode', label: 'Mã khách hàng CMS*', type: 'text', placeholder: 'Mã KH do Bưu điện cấp (VD: C00123456)', required: true },
      { key: 'contractCode', label: 'Mã hợp đồng', type: 'text', placeholder: 'Nhập mã hợp đồng ký kết (nếu có)', required: false },
    ],
    links: [
      { label: 'Cổng UAT Sandbox VNPost (my-uat.vnpost.vn/customer)', url: 'https://my-uat.vnpost.vn/customer' },
      { label: 'Cổng Portal chính thức VNPost', url: 'https://portal.vnpost.vn/' },
    ],
  },
  ahamove: {
    title: 'Kết nối tài khoản Ahamove (Delivery API)',
    notice: 'Môi trường hỗ trợ: Sandbox (partner-apistg.ahamove.com) & Production',
    fields: [
      { key: 'apiKey', label: 'Mã API Key đối tác*', type: 'password', placeholder: 'Nhập API Key cấp từ developers.ahamove.com...', required: true, fullWidth: true },
      { key: 'mobile', label: 'Số điện thoại đăng ký*', type: 'tel', placeholder: 'VD: 0912345678 (SĐT tài khoản Ahamove)', required: true },
      { key: 'brandName', label: 'Tên thương hiệu Shop', type: 'text', placeholder: 'Nhập tên Shop hiển thị với tài xế (tùy chọn)', required: false },
    ],
    links: [
      { label: 'Cổng tài liệu Ahamove API Developers', url: 'https://developers.ahamove.com/' },
      { label: 'Cổng đối tác Ahamove Sandbox (partnerstg)', url: 'https://partnerstg.ahamove.com/' },
    ],
  },
  jt_express: {
    title: 'Kết nối tài khoản J&T Express (Open Platform)',
    notice: 'Môi trường hỗ trợ: VIP Portal Sandbox & Production (vip.jtexpress.vn)',
    fields: [
      { key: 'customerCode', label: 'Mã khách hàng (Customer Code)*', type: 'text', placeholder: 'VD: 084LC12345 (Mã khách hàng VIP)', required: true },
      { key: 'password', label: 'Mật khẩu API*', type: 'password', placeholder: 'Nhập mật khẩu API do J&T cấp', required: true },
      { key: 'privateKey', label: 'Khóa bảo mật (Private Key)*', type: 'password', placeholder: 'Nhập Private Key dùng để tạo chữ ký dữ liệu...', required: true, fullWidth: true },
      { key: 'eccompanyid', label: 'Mã công ty đối tác', type: 'text', placeholder: 'Mặc định: CUSMODEL (hoặc mã sales cấp)', required: false, fullWidth: true },
    ],
    links: [
      { label: 'Cổng VIP J&T Express (vip.jtexpress.vn)', url: 'https://vip.jtexpress.vn/' },
      { label: 'Trang chủ J&T Express Việt Nam', url: 'https://jtexpress.vn/' },
    ],
  },
  best_express: {
    title: 'Kết nối tài khoản BEST Express (Open API)',
    notice: 'Môi trường hỗ trợ: Open API Sandbox & Production (open.best-inc.vn)',
    fields: [
      { key: 'username', label: 'Tên đăng nhập / Khách hàng*', type: 'text', placeholder: 'Nhập tài khoản cổng vận chuyển BEST', required: true },
      { key: 'password', label: 'Mật khẩu*', type: 'password', placeholder: 'Nhập mật khẩu tài khoản', required: true },
      { key: 'appKey', label: 'Mã ứng dụng (App Key)*', type: 'text', placeholder: 'Nhập App Key cấp từ open.best-inc.vn', required: true },
      { key: 'appSecret', label: 'Khóa bí mật (App Secret)', type: 'password', placeholder: 'Khóa bí mật sinh chữ ký bảo mật sign (nếu có)', required: false },
    ],
    links: [
      { label: 'Cổng Open API BEST Express', url: 'http://open.best-inc.vn/' },
      { label: 'Cổng đối soát BEST Express', url: 'https://best-inc.vn/' },
    ],
  },
  spx: {
    title: 'Kết nối tài khoản SPX Express (Shopee Open Platform)',
    notice: 'Môi trường hỗ trợ: Shopee Open Platform Sandbox & Production',
    fields: [
      { key: 'partnerId', label: 'Mã đối tác (Partner ID)*', type: 'text', placeholder: 'VD: 100234 (Partner ID trên Shopee Console)', required: true },
      { key: 'partnerKey', label: 'Khóa đối tác (Partner Key / Secret)*', type: 'password', placeholder: 'Nhập Partner Key bí mật...', required: true },
      { key: 'shopId', label: 'Mã cửa hàng Shopee (Shop ID)*', type: 'text', placeholder: 'VD: 98765432 (Mã Shop Shopee)', required: true, fullWidth: true },
    ],
    links: [
      { label: 'Cổng Shopee Open Platform Console', url: 'https://open.shopee.com/' },
      { label: 'Trang chủ SPX Express Việt Nam', url: 'https://spx.vn/' },
    ],
  },
  grab_express: {
    title: 'Kết nối dịch vụ GrabExpress (Delivery API)',
    notice: 'Môi trường hỗ trợ: OAuth 2.0 Sandbox (developer.grab.com) & Production',
    fields: [
      { key: 'clientId', label: 'Mã ứng dụng (Client ID)*', type: 'text', placeholder: 'Nhập Client ID cấp từ Grab Developer Portal', required: true },
      { key: 'clientSecret', label: 'Khóa bí mật (Client Secret)*', type: 'password', placeholder: 'Nhập Client Secret cấp từ Grab...', required: true },
      { key: 'merchantId', label: 'Mã doanh nghiệp (Merchant ID)', type: 'text', placeholder: 'Nhập Merchant ID Grab for Business (tùy chọn)', required: false, fullWidth: true },
    ],
    links: [
      { label: 'Cổng Grab Developer Portal', url: 'https://developer.grab.com/' },
      { label: 'GrabExpress Doanh nghiệp', url: 'https://www.grab.com/vn/business/express/' },
    ],
  },
  green_sm: {
    title: 'Kết nối tài khoản Green SM (Xanh SM Express)',
    notice: 'Green SM (GSM) hỗ trợ: (1) Kết nối ủy quyền qua Số điện thoại đăng ký hoặc (2) Cấu hình API Key theo Hợp đồng Doanh nghiệp B2B (Xanh4Biz).',
    fields: [
      { key: 'phone', label: 'Số điện thoại tài khoản Green SM*', type: 'tel', placeholder: 'Nhập số điện thoại đã đăng ký dịch vụ Xanh SM...', required: true, fullWidth: true },
      { key: 'apiKey', label: 'Mã đối tác / API Key B2B (Tùy chọn)', type: 'password', placeholder: 'Nhập API Key nếu đã ký hợp đồng B2B riêng với GSM...', required: false },
      { key: 'clientId', label: 'Mã khách hàng B2B (Tùy chọn)', type: 'text', placeholder: 'Mã định danh khách hàng Xanh4Biz / GSM...', required: false },
    ],
    links: [
      { label: 'Cổng Khách hàng Doanh nghiệp GSM Business', url: 'https://business.xanhsm.com/' },
      { label: 'Giải pháp Doanh nghiệp Green Business (Xanh4Biz)', url: 'https://www.greensm.com/vn-vi/business-transport' },
      { label: 'Bảng giá & Dịch vụ giao hàng Green SM Express', url: 'https://www.greensm.com/vn-vi/green-express' },
    ],
  },
};

export default function ConnectShippingModal({ isOpen, onClose, provider, onSuccess }) {
  const [credentials, setCredentials] = useState({});
  const [agreed, setAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (provider) {
      setCredentials({});
      setAgreed(true);
    }
  }, [provider]);

  if (!provider) return null;

  const code = provider.code;
  const config = SAPO_MODAL_CONFIG[code] || {
    title: `Đăng nhập tài khoản ${provider.name}`,
    fields: [
      { key: 'username', label: 'Tên đăng nhập / API Key*', type: 'text', placeholder: 'Nhập thông tin xác thực...', required: true },
      { key: 'password', label: 'Mật khẩu*', type: 'password', placeholder: 'Nhập mật khẩu...', required: true },
    ],
    links: [],
  };

  const handleChange = (field, val) => {
    setCredentials((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('Vui lòng đồng ý với điều khoản chia sẻ dữ liệu kết nối');
      return;
    }

    try {
      setSubmitting(true);
      await storeSettingService.connectShippingProvider(code, { credentials });
      toast.success(`Kết nối đối tác ${provider.name} thành công!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi kết nối đối tác');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[560px] p-0 bg-white dark:bg-card rounded-[6px] border border-[#dfe3e8] dark:border-border shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-6 pb-4 border-b border-[#dfe3e8] dark:border-border">
          <DialogTitle className="text-base font-semibold text-[#212b36] dark:text-foreground mb-3">
            Kết nối đối tác
          </DialogTitle>

          {/* Logo Shop ⇄ Hãng (Chuẩn Client Header) */}
          <div className="flex items-center justify-center gap-6 py-2 bg-[#fafbfb] dark:bg-muted/40 rounded-[6px] border border-[#f4f6f8] dark:border-border">
            <ShopLogo className="h-6" />
            <span className="text-[#919eab] font-mono text-base font-bold">⇄</span>
            <div className="min-h-[36px] flex items-center bg-white dark:bg-white/95 rounded-[6px] px-2 py-0.5">
              <CarrierLogo code={code} />
            </div>
          </div>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[13px]">
          <h4 className="font-semibold text-[#212b36] dark:text-foreground text-[13px]">{config.title}</h4>

          {/* DYNAMIC FIELDS - CĂN THẲNG HÀNG 100% ĐỒNG BỘ */}
          <div className="space-y-3.5">
            {config.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="flex items-center text-[13px] font-medium text-[#212b36] dark:text-foreground">
                  <span>{field.label.replace(/\*$/, '').replace(/\(Tùy chọn\)$/i, '').trim()}</span>
                  {field.required ? (
                    <span className="text-red-500 ml-1 font-bold">*</span>
                  ) : (
                    <span className="text-[#919eab] font-normal text-[12px] ml-1.5">(Tùy chọn)</span>
                  )}
                </label>
                <Input
                  type={field.type}
                  value={credentials[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="h-9 w-full text-[13px] rounded-[6px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground focus:border-[#0088ff]"
                />
              </div>
            ))}
          </div>

          {config.hasVAT && (
            <div className="flex items-center gap-2 pt-1">
              <Checkbox id="shipping-vat" />
              <label htmlFor="shipping-vat" className="cursor-pointer text-[#212b36] dark:text-foreground select-none text-[13px]">
                Đăng ký xuất hóa đơn (VAT)
              </label>
            </div>
          )}

          {config.notice && (
            <div className="p-2.5 bg-[#f9fafb] dark:bg-muted/20 rounded-[6px] border border-[#eaebed] dark:border-border text-[12px] text-[#637381] dark:text-muted-foreground leading-relaxed">
              <span className="font-medium text-[#212b36] dark:text-foreground">Lưu ý: </span>
              {config.notice}
            </div>
          )}

          {/* AGREEMENT CHECKBOX */}
          <div className="flex items-start gap-2.5 pt-2">
            <Checkbox
              id="shipping-agreed"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked)}
              className="mt-0.5"
            />
            <label htmlFor="shipping-agreed" className="cursor-pointer text-[#637381] dark:text-muted-foreground text-[12px] leading-relaxed select-none">
              Tôi đã đọc, hiểu và đồng ý với{' '}
              <span className="text-primary font-medium">Chính sách bảo mật dữ liệu</span>{' '}
              của Shop và cho phép chia sẻ dữ liệu cần thiết giữa Shop và {provider.name} để sử dụng dịch vụ.
            </label>
          </div>

          {/* BULLETED BLUE REFERENCE LINKS SAPO 100% */}
          {config.links && config.links.length > 0 && (
            <div className="pt-2 space-y-1.5 border-t border-[#f4f6f8] dark:border-border">
              {config.links.map((link, idx) => (
                <div key={idx}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0088ff] dark:text-blue-400 hover:underline text-[12px] inline-flex items-center gap-1"
                  >
                    • {link.label}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* FOOTER BUTTONS SAPO 100% */}
          <div className="pt-4 border-t border-[#dfe3e8] dark:border-border flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#c4cdd5] dark:border-border text-[#212b36] dark:text-foreground bg-white dark:bg-card hover:bg-[#f4f6f8] dark:hover:bg-accent px-4 py-1.5 rounded-[6px] text-[13px] font-medium h-9 cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#0088ff] hover:bg-[#0077e6] text-white px-5 py-1.5 rounded-[6px] text-[13px] font-medium h-9 shadow-xs active:scale-[0.98] transition-transform cursor-pointer"
            >
              {submitting ? 'Đang kết nối...' : 'Kết nối'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
