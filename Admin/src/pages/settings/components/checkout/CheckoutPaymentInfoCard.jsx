import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function CheckoutPaymentInfoCard({ checkout, onChange, onFieldMatrixChange }) {
  const renderRadioGroup = (fieldKey, label) => {
    const currentVal = checkout.fieldMatrix?.[fieldKey] || 'optional';
    return (
      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground">{label}</label>
        <div className="space-y-1.5 text-[13px] text-[#212b36] dark:text-foreground">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`field_${fieldKey}`}
              value="hidden"
              checked={currentVal === 'hidden'}
              onChange={() => onFieldMatrixChange(fieldKey, 'hidden')}
              className="text-[#0088ff] focus:ring-0 cursor-pointer"
            />
            <span>Ẩn</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`field_${fieldKey}`}
              value="optional"
              checked={currentVal === 'optional'}
              onChange={() => onFieldMatrixChange(fieldKey, 'optional')}
              className="text-[#0088ff] focus:ring-0 cursor-pointer"
            />
            <span>Không bắt buộc</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`field_${fieldKey}`}
              value="required"
              checked={currentVal === 'required'}
              onChange={() => onFieldMatrixChange(fieldKey, 'required')}
              className="text-[#0088ff] focus:ring-0 cursor-pointer"
            />
            <span>Bắt buộc</span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-5 shadow-xs space-y-5">
      <h3 className="text-[14px] font-bold text-[#212b36] dark:text-foreground">Thông tin thanh toán</h3>

      {/* Ma trận các trường: Row 1 (Số ĐT, Email, Địa chỉ) & Row 2 (Quận/Huyện, Phường/Xã) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
        {renderRadioGroup('phone', 'Số điện thoại')}
        {renderRadioGroup('email', 'Email')}
        {renderRadioGroup('address', 'Địa chỉ')}
        {renderRadioGroup('district', 'Quận/Huyện')}
        {renderRadioGroup('ward', 'Phường/Xã')}
      </div>

      {/* CHECKBOXES & WARNING BANNER */}
      <div className="pt-4 border-t border-[#f4f6f8] dark:border-border space-y-3.5">
        {/* Checkbox 1: Sử dụng địa chỉ 2 cấp */}
        <div>
          <div className="flex items-start gap-2.5 text-[13px] text-[#212b36] dark:text-foreground">
            <Checkbox
              id="two-level-address"
              checked={checkout.useTwoLevelAddress || false}
              onCheckedChange={(checked) => onChange('useTwoLevelAddress', checked)}
              className="mt-0.5"
            />
            <div>
              <label htmlFor="two-level-address" className="font-medium cursor-pointer select-none">
                Sử dụng địa chỉ 2 cấp
              </label>
              <p className="text-[12px] text-[#637381] dark:text-muted-foreground">
                Khi bật, người mua cần sử dụng địa chỉ 2 cấp ở trang checkout
              </p>
            </div>
          </div>

          {/* CẢNH BÁO VÀNG CHUẨN SAPO KHI BẬT ĐỊA CHỈ 2 CẤP */}
          {checkout.useTwoLevelAddress && (
            <div className="mt-2.5 ml-6 bg-[#fff8e5] dark:bg-amber-950/40 border border-[#ffea8a] dark:border-amber-900/60 rounded-[4px] p-3 text-[12.5px] text-[#8a6116] dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#8a6116] dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Bạn cần chuyển đổi địa chỉ cũ của khách hàng cũng như nâng cấp giao diện để đồng nhất ở trang địa chỉ khách hàng trên website
              </span>
            </div>
          )}
        </div>

        {/* Checkbox 2: Cho phép khách hàng nhập thông tin nhận hàng khác */}
        <div className="flex items-start gap-2.5 text-[13px] text-[#212b36] dark:text-foreground">
          <Checkbox
            id="different-shipping"
            checked={checkout.allowDifferentShippingAddress ?? true}
            onCheckedChange={(checked) => onChange('allowDifferentShippingAddress', checked)}
            className="mt-0.5"
          />
          <label htmlFor="different-shipping" className="font-medium cursor-pointer select-none">
            Cho phép khách hàng nhập thông tin nhận hàng khác với thông tin mua hàng.
          </label>
        </div>

        {/* Checkbox 3: Cho phép gửi yêu cầu xuất hóa đơn */}
        <div className="flex items-start gap-2.5 text-[13px] text-[#212b36] dark:text-foreground">
          <Checkbox
            id="company-invoice"
            checked={checkout.allowCompanyInvoice ?? true}
            onCheckedChange={(checked) => onChange('allowCompanyInvoice', checked)}
            className="mt-0.5"
          />
          <div>
            <label htmlFor="company-invoice" className="font-medium cursor-pointer select-none">
              Cho phép gửi yêu cầu xuất hóa đơn
            </label>
            <p className="text-[12px] text-[#637381] dark:text-muted-foreground">
              Khi bật người mua sẽ có thể yêu cầu xuất hóa đơn ở trang thanh toán. Hiện tại chỉ nên bật khi bạn có tích hợp dịch vụ hóa đơn điện tử
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
