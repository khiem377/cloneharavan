import React from 'react';

export default function CheckoutCustomerAccountCard({ customerAccount, onChange }) {
  return (
    <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-5 shadow-xs space-y-3">
      <h3 className="text-[14px] font-bold text-[#212b36] dark:text-foreground">Tài khoản khách hàng</h3>

      <div className="space-y-2.5 text-[13px] text-[#212b36] dark:text-foreground">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name="customerAccount"
            value="disabled"
            checked={customerAccount === 'disabled'}
            onChange={() => onChange('disabled')}
            className="text-[#0088ff] focus:ring-0 cursor-pointer"
          />
          <span>Vô hiệu hóa đăng nhập tài khoản</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name="customerAccount"
            value="required"
            checked={customerAccount === 'required'}
            onChange={() => onChange('required')}
            className="text-[#0088ff] focus:ring-0 cursor-pointer"
          />
          <span>Bắt buộc đăng nhập tài khoản</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name="customerAccount"
            value="optional"
            checked={customerAccount === 'optional'}
            onChange={() => onChange('optional')}
            className="text-[#0088ff] focus:ring-0 cursor-pointer"
          />
          <span>Không bắt buộc đăng nhập tài khoản</span>
        </label>
      </div>
    </div>
  );
}
