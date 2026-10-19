import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function AddCustomCarrierModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [payer, setPayer] = useState('shop');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      code: `custom_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      note: note.trim(),
      payer,
    });
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-xl max-w-xl w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dfe3e8] dark:border-border pb-3">
          <h4 className="text-[15px] font-semibold text-[#212b36] dark:text-foreground">Thêm mới đối tác tự liên hệ</h4>
          <button type="button" onClick={onClose} className="p-1 text-[#637381] hover:text-[#212b36] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields identical to Sapo */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-[12.5px]">
          {/* Row 1: Tên đối tác & Số điện thoại */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="font-medium text-[#212b36] dark:text-foreground">Tên đối tác*</label>
              <input
                type="text"
                placeholder="Nhập tên đối tác"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-8 px-2.5 rounded-[6px] border border-[#dfe3e8] dark:border-border mt-1 text-[12.5px]"
                required
              />
            </div>
            <div>
              <label className="font-medium text-[#212b36] dark:text-foreground">Số điện thoại</label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-8 px-2.5 rounded-[6px] border border-[#dfe3e8] dark:border-border mt-1 text-[12.5px]"
              />
            </div>
          </div>

          {/* Row 2: Email & Địa chỉ */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="font-medium text-[#212b36] dark:text-foreground">Email</label>
              <input
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-8 px-2.5 rounded-[6px] border border-[#dfe3e8] dark:border-border mt-1 text-[12.5px]"
              />
            </div>
            <div>
              <label className="font-medium text-[#212b36] dark:text-foreground">Địa chỉ</label>
              <input
                type="text"
                placeholder="Nhập địa chỉ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-8 px-2.5 rounded-[6px] border border-[#dfe3e8] dark:border-border mt-1 text-[12.5px]"
              />
            </div>
          </div>

          {/* Row 3: Ghi chú & Người trả phí */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="font-medium text-[#212b36] dark:text-foreground">Ghi chú</label>
              <input
                type="text"
                placeholder="Nhập ghi chú"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-8 px-2.5 rounded-[6px] border border-[#dfe3e8] dark:border-border mt-1 text-[12.5px]"
              />
            </div>
            <div>
              <label className="font-medium text-[#212b36] dark:text-foreground">Người trả phí:</label>
              <div className="flex items-center gap-4 h-8 mt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="modalPayer" checked={payer === 'shop'} onChange={() => setPayer('shop')} />
                  <span>Shop trả</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="modalPayer" checked={payer === 'receiver'} onChange={() => setPayer('receiver')} />
                  <span>Khách trả</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#dfe3e8] dark:border-border flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-8 px-4 text-[12.5px] rounded-[6px] cursor-pointer">
              Hủy
            </Button>
            <Button type="submit" className="h-8 px-5 text-[12.5px] bg-[#0088ff] hover:bg-[#0077e6] text-white rounded-[6px] cursor-pointer">
              Lưu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
