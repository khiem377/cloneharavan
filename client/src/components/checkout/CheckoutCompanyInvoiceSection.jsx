'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function CheckoutCompanyInvoiceSection({
  allowCompanyInvoice = true,
  invoiceData = {},
  onInvoiceChange,
}) {
  if (!allowCompanyInvoice) {
    return null;
  }

  const {
    requireInvoice = false,
    companyName = '',
    taxCode = '',
    companyAddress = '',
    invoiceEmail = '',
  } = invoiceData;

  const handleChange = (field, value) => {
    if (onInvoiceChange) {
      onInvoiceChange({
        ...invoiceData,
        [field]: value,
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5">
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={requireInvoice}
          onChange={(e) => handleChange('requireInvoice', e.target.checked)}
          className="rounded-[4px] border-slate-300 text-[#0088ff] focus:ring-[#0088ff] w-4 h-4"
        />
        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-slate-700" />
          <span className="text-xs sm:text-sm font-bold text-slate-900">
            Yêu cầu xuất hóa đơn công ty (Hóa đơn điện tử VAT)
          </span>
        </div>
      </label>

      {requireInvoice && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên công ty / Tổ chức <span className="text-red-500">*</span>
              </label>
              <Input
                value={companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Ví dụ: Công ty TNHH Dịch vụ Thương mại ABC"
                className="h-9 text-xs rounded-[6px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã số thuế <span className="text-red-500">*</span>
              </label>
              <Input
                value={taxCode}
                onChange={(e) => handleChange('taxCode', e.target.value)}
                placeholder="Ví dụ: 0312345678"
                className="h-9 text-xs rounded-[6px] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ công ty (Theo giấy phép ĐKKD) <span className="text-red-500">*</span>
            </label>
            <Input
              value={companyAddress}
              onChange={(e) => handleChange('companyAddress', e.target.value)}
              placeholder="Ví dụ: Tầng 5, Tòa nhà ABC, 123 Nguyễn Huệ, Quận 1, TP.HCM"
              className="h-9 text-xs rounded-[6px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email nhận hóa đơn điện tử <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={invoiceEmail}
              onChange={(e) => handleChange('invoiceEmail', e.target.value)}
              placeholder="ketoan@congty.com"
              className="h-9 text-xs rounded-[6px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
