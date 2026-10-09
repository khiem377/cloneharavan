'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Clock, Receipt, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const TIME_SLOTS = [
  { id: 'morning', label: 'Sáng (08:00 - 12:00)' },
  { id: 'afternoon', label: 'Chiều (14:00 - 18:00)' },
  { id: 'evening', label: 'Tối (18:00 - 21:00)' },
];

export default function CartAddons() {
  const [note, setNote] = useState('');
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(TIME_SLOTS[0].id);

  const [enableVat, setEnableVat] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');

  // Load / Save to sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('haravan_cart_addons');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.note) setNote(data.note);
        if (data.enableSchedule) {
          setEnableSchedule(true);
          setDeliveryDate(data.deliveryDate || '');
          setDeliveryTimeSlot(data.deliveryTimeSlot || TIME_SLOTS[0].id);
        }
        if (data.enableVat) {
          setEnableVat(true);
          setCompanyName(data.companyName || '');
          setTaxId(data.taxId || '');
          setCompanyAddress(data.companyAddress || '');
          setInvoiceEmail(data.invoiceEmail || '');
        }
      }
    } catch {}
  }, []);

  const saveAddons = (updates) => {
    try {
      const current = {
        note,
        enableSchedule,
        deliveryDate,
        deliveryTimeSlot,
        enableVat,
        companyName,
        taxId,
        companyAddress,
        invoiceEmail,
        ...updates,
      };
      sessionStorage.setItem('haravan_cart_addons', JSON.stringify(current));
    } catch {}
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
      <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
        <span>Tiện ích & Dịch vụ bổ sung</span>
      </h3>

      {/* 1. Ghi chú đơn hàng */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <FileText size={14} className="text-slate-500" />
          <span>Ghi chú đơn hàng</span>
        </label>
        <Textarea
          placeholder="Nhập yêu cầu đặc biệt về đơn hàng (ví dụ: giao giờ hành chính, bọc gói quà...)"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            saveAddons({ note: e.target.value });
          }}
          className="text-xs min-h-[64px] resize-none"
        />
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-3">
        {/* 2. Hẹn giờ giao hàng */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              checked={enableSchedule}
              onChange={(e) => {
                const val = e.target.checked;
                setEnableSchedule(val);
                saveAddons({ enableSchedule: val });
              }}
            />
            <span className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
              <Clock size={14} className="text-slate-500" />
              <span>Hẹn ngày & giờ nhận hàng thuận tiện</span>
            </span>
          </label>

          {enableSchedule && (
            <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 animate-fadeIn">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Ngày giao mong muốn
                </label>
                <Input
                  type="date"
                  value={deliveryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    saveAddons({ deliveryDate: e.target.value });
                  }}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Khung giờ nhận hàng
                </label>
                <select
                  value={deliveryTimeSlot}
                  onChange={(e) => {
                    setDeliveryTimeSlot(e.target.value);
                    saveAddons({ deliveryTimeSlot: e.target.value });
                  }}
                  className="w-full h-8 text-xs rounded-md border border-slate-300 bg-white px-2 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 3. Xuất hóa đơn VAT */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              checked={enableVat}
              onChange={(e) => {
                const val = e.target.checked;
                setEnableVat(val);
                saveAddons({ enableVat: val });
              }}
            />
            <span className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
              <Receipt size={14} className="text-slate-500" />
              <span>Yêu cầu xuất hóa đơn điện tử VAT cho công ty</span>
            </span>
          </label>

          {enableVat && (
            <div className="pl-6 space-y-2 pt-1 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Tên công ty / Doanh nghiệp (*)"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    saveAddons({ companyName: e.target.value });
                  }}
                  className="text-xs h-8"
                />
                <Input
                  placeholder="Mã số thuế (MST) (*)"
                  value={taxId}
                  onChange={(e) => {
                    setTaxId(e.target.value);
                    saveAddons({ taxId: e.target.value });
                  }}
                  className="text-xs h-8"
                />
              </div>

              <Input
                placeholder="Địa chỉ trụ sở công ty trên hóa đơn (*)"
                value={companyAddress}
                onChange={(e) => {
                  setCompanyAddress(e.target.value);
                  saveAddons({ companyAddress: e.target.value });
                }}
                className="text-xs h-8"
              />

              <Input
                placeholder="Email nhận hóa đơn điện tử (PDF/XML) (*)"
                type="email"
                value={invoiceEmail}
                onChange={(e) => {
                  setInvoiceEmail(e.target.value);
                  saveAddons({ invoiceEmail: e.target.value });
                }}
                className="text-xs h-8"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
