import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import RecaptchaBadge from './RecaptchaBadge';

const SAMPLE_REFUND_POLICY = `1. Điều kiện đổi trả hàng:
- Sản phẩm còn nguyên bao bì, tem nhãn, chưa qua sử dụng hoặc giặt tẩy.
- Thời gian hỗ trợ đổi trả trong vòng 07 ngày kể từ ngày nhận hàng.
- Áp dụng khi sản phẩm bị lỗi do nhà sản xuất hoặc giao sai mẫu mã, số lượng.

2. Quy trình đổi trả:
- Quý khách vui lòng liên hệ hotline hoặc gửi yêu cầu qua website kèm hình ảnh sản phẩm.
- Cửa hàng sẽ thẩm định và gửi sản phẩm đổi mới hoặc hoàn tiền trong vòng 03 - 05 ngày làm việc.`;

const SAMPLE_PRIVACY_POLICY = `1. Mục đích thu thập thông tin:
- Tiếp nhận và xử lý đơn hàng, giao hàng tới địa chỉ người nhận.
- Gửi thông báo về tình trạng đơn hàng và hỗ trợ khách hàng sau mua.

2. Phạm vi sử dụng thông tin:
- Cam kết bảo mật thông tin cá nhân của khách hàng tuyệt đối.
- Chỉ cung cấp thông tin cần thiết cho đơn vị vận chuyển để phục vụ giao nhận hàng hóa.`;

const SAMPLE_TERMS_OF_SERVICE = `1. Chấp thuận điều khoản:
- Khi tiến hành đặt mua hàng trên website, quý khách được coi là đã đọc và đồng ý với tất cả điều khoản dịch vụ này.

2. Giá cả và thanh toán:
- Giá sản phẩm được niêm yết rõ ràng bằng Việt Nam Đồng (VND).
- Quý khách có thể lựa chọn hình thức thanh toán khi nhận hàng (COD) hoặc chuyển khoản ngân hàng qua mã VietQR.`;

export default function CheckoutPoliciesCard({
  policies = {},
  extraNotice = '',
  enableReCaptcha = false,
  onChangePolicy,
  onChangeExtraNotice,
  onChangeReCaptcha,
}) {
  const [showRecaptchaTooltip, setShowRecaptchaTooltip] = useState(false);
  const [showNoticeTooltip, setShowNoticeTooltip] = useState(false);

  return (
    <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-5 shadow-xs space-y-5">
      <h3 className="text-[14px] font-bold text-[#212b36] dark:text-foreground">
        Điều khoản sử dụng, bảo mật, hoàn trả, nội dung thông báo thêm
      </h3>

      {/* 1. CHÍNH SÁCH HOÀN TRẢ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-[#212b36] dark:text-foreground">Chính sách hoàn trả</label>
          <button
            type="button"
            onClick={() => onChangePolicy('refundPolicy', SAMPLE_REFUND_POLICY)}
            className="text-[12px] text-[#0088ff] dark:text-[#38bdf8] hover:underline font-medium"
          >
            Sử dụng nội dung mẫu
          </button>
        </div>
        <textarea
          rows={3}
          value={policies.refundPolicy || ''}
          onChange={(e) => onChangePolicy('refundPolicy', e.target.value)}
          placeholder="Nhập nội dung"
          className="w-full text-[13px] p-2.5 rounded-[4px] border border-[#c4cdd5] dark:border-border bg-white dark:bg-background focus:outline-none focus:border-[#0088ff] text-[#212b36] dark:text-foreground placeholder-[#919eab] dark:placeholder-muted-foreground"
        />
      </div>

      {/* 2. CHÍNH SÁCH BẢO MẬT */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-[#212b36] dark:text-foreground">Chính sách bảo mật</label>
          <button
            type="button"
            onClick={() => onChangePolicy('privacyPolicy', SAMPLE_PRIVACY_POLICY)}
            className="text-[12px] text-[#0088ff] dark:text-[#38bdf8] hover:underline font-medium"
          >
            Sử dụng nội dung mẫu
          </button>
        </div>
        <textarea
          rows={3}
          value={policies.privacyPolicy || ''}
          onChange={(e) => onChangePolicy('privacyPolicy', e.target.value)}
          placeholder="Nhập nội dung"
          className="w-full text-[13px] p-2.5 rounded-[4px] border border-[#c4cdd5] dark:border-border bg-white dark:bg-background focus:outline-none focus:border-[#0088ff] text-[#212b36] dark:text-foreground placeholder-[#919eab] dark:placeholder-muted-foreground"
        />
      </div>

      {/* 3. ĐIỀU KHOẢN SỬ DỤNG */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-[#212b36] dark:text-foreground">Điều khoản sử dụng</label>
          <button
            type="button"
            onClick={() => onChangePolicy('termsOfService', SAMPLE_TERMS_OF_SERVICE)}
            className="text-[12px] text-[#0088ff] dark:text-[#38bdf8] hover:underline font-medium"
          >
            Sử dụng nội dung mẫu
          </button>
        </div>
        <textarea
          rows={3}
          value={policies.termsOfService || ''}
          onChange={(e) => onChangePolicy('termsOfService', e.target.value)}
          placeholder="Nhập nội dung"
          className="w-full text-[13px] p-2.5 rounded-[4px] border border-[#c4cdd5] dark:border-border bg-white dark:bg-background focus:outline-none focus:border-[#0088ff] text-[#212b36] dark:text-foreground placeholder-[#919eab] dark:placeholder-muted-foreground"
        />
      </div>

      {/* 4. NỘI DUNG THÔNG BÁO THÊM */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-[13px] font-medium text-[#212b36] dark:text-foreground">Nội dung thông báo thêm</label>
          <div className="relative inline-block">
            <button
              type="button"
              onMouseEnter={() => setShowNoticeTooltip(true)}
              onMouseLeave={() => setShowNoticeTooltip(false)}
              className="text-[#637381] dark:text-muted-foreground hover:text-[#212b36] dark:hover:text-foreground"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            {showNoticeTooltip && (
              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-[#212b36] text-white text-[11px] rounded shadow-lg pointer-events-none">
                Hiển thị lưu ý hoặc ghi chú quan trọng cho khách hàng ngay trước khi xác nhận đặt hàng.
              </div>
            )}
          </div>
        </div>
        <input
          type="text"
          value={extraNotice || ''}
          onChange={(e) => onChangeExtraNotice(e.target.value)}
          placeholder="Nhập nội dung"
          className="w-full h-9 px-3 text-[13px] rounded-[4px] border border-[#c4cdd5] dark:border-border bg-white dark:bg-background focus:outline-none focus:border-[#0088ff] text-[#212b36] dark:text-foreground placeholder-[#919eab] dark:placeholder-muted-foreground"
        />
      </div>

      {/* 5. CHECKBOX BẬT GOOGLE RECAPTCHA KÈM TOOLTIP POPOVER (SAPO 100%) */}
      <div className="pt-2">
        <div className="flex items-center gap-2 text-[13px] text-[#212b36] dark:text-foreground relative">
          <Checkbox
            id="enable-recaptcha"
            checked={enableReCaptcha || false}
            onCheckedChange={(checked) => onChangeReCaptcha(checked)}
          />
          <label htmlFor="enable-recaptcha" className="cursor-pointer select-none">
            Bật Google reCaptcha ở trang thanh toán
          </label>
          <div
            className="relative inline-block ml-0.5"
            onMouseEnter={() => setShowRecaptchaTooltip(true)}
            onMouseLeave={() => setShowRecaptchaTooltip(false)}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#637381] dark:text-muted-foreground hover:text-[#212b36] dark:hover:text-foreground" />

            {/* POPOVER RECAPTCHA CHUẨN SAPO 100% (ẢNH 4) */}
            {showRecaptchaTooltip && (
              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-[290px] bg-[#212b36] text-white p-3.5 rounded-[6px] shadow-2xl pointer-events-none animate-in fade-in-50 zoom-in-95 duration-100 border border-[#384351]">
                <RecaptchaBadge />
                <p className="text-[11.5px] leading-relaxed text-[#dfe3e8]">
                  reCAPTCHA yêu cầu người dùng xác nhận mình là con người giúp bảo vệ trang web, cải thiện an ninh và tăng cường trải nghiệm, bảo mật của người dùng.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
