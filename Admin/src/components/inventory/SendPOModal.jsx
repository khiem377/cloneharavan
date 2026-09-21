import React, { useState, useEffect } from 'react';
import {
  Mail, PhoneCall, Send, Eye, CheckCircle2, X, Building2, Loader2, MessageSquare, FileText,
} from '@/components/ui/Icons';
import { inventoryService } from '@/services/inventory.service';
import { toast } from '@/providers/ToastProvider';
import SearchableSelect from '@/components/ui/SearchableSelect';

export default function SendPOModal({ isOpen, onClose, po, onSuccess }) {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'manual'
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [manualChannel, setManualChannel] = useState('Zalo');
  const [manualNote, setManualNote] = useState('');

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen && po) {
      const supEmail = po.supplierId?.email || '';
      setRecipientEmail(supEmail);
      setSubject(`[EGA ] - Đơn Đặt Mua Hàng Mới #${po.poNumber}`);
      setCustomNote('');
      setManualChannel('Zalo');
      setManualNote(`Đã chốt qua Zalo/Điện thoại với đại diện ${po.supplierId?.name || 'Nhà cung cấp'}`);

      // Fetch live email HTML preview from backend
      fetchPreviewHtml(po._id);
    }
  }, [isOpen, po]);

  const fetchPreviewHtml = async (poId) => {
    try {
      setLoadingPreview(true);
      const res = await inventoryService.previewPOEmail(poId);
      if (res.data?.data?.html) {
        setPreviewHtml(res.data.data.html);
      }
    } catch (err) {
      console.error('Lỗi tải preview email:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  if (!isOpen || !po) return null;

  const handleSubmitDispatch = async (e) => {
    e.preventDefault();
    try {
      setIsSending(true);
      if (activeTab === 'email') {
        if (!recipientEmail || !recipientEmail.includes('@')) {
          toast.error('Vui lòng nhập địa chỉ Email nhà cung cấp hợp lệ!');
          setIsSending(false);
          return;
        }

        await inventoryService.sendPOToSupplier(po._id, {
          sendMethod: 'email',
          recipientEmail,
          subject,
          customNote,
        });

        toast.success(`Đã gửi thành công Email đơn hàng ${po.poNumber} tới ${recipientEmail}!`);
      } else {
        await inventoryService.sendPOToSupplier(po._id, {
          sendMethod: 'manual',
          manualNote: `[${manualChannel}] ${manualNote}`,
        });

        toast.success(`Đã cập nhật trạng thái đã gửi PO (${manualChannel}) cho ${po.poNumber}!`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thực hiện gửi đơn hàng');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden text-card-foreground">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Gửi Đơn Nhập Kho {po.poNumber} Cho NCC
                </h2>
                <p className="text-xs text-muted-foreground">
                  Lựa chọn phương thức gửi email tự động hoặc liên hệ thủ công qua Zalo/SĐT
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Supplier summary card */}
          <div className="bg-muted/20 px-6 py-3 border-b border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              <span>{po.supplierId?.name || 'Nhà cung cấp'}</span>
            </div>
            <div className="text-muted-foreground font-mono">
              Tổng tiền đơn: <span className="font-bold text-emerald-600 dark:text-emerald-400">{(po.totalAmount || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-border bg-muted/10 p-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'email'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <Mail className="h-4 w-4" />
              Option 1: Gửi Email Tự Động
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeTab === 'manual'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <PhoneCall className="h-4 w-4" />
              Option 2: Liên Hệ Thủ Công (Zalo / SĐT)
            </button>
          </div>

          {/* Tab Body */}
          <form onSubmit={handleSubmitDispatch} className="p-6 space-y-4">
            {activeTab === 'email' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Email Người Nhận (NCC) <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="sales@supplier.com..."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Tiêu Đề Email Thư
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Ghi Chú Bổ Sung Gửi Cho NCC (Hiển thị trong khung thư)
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="VD: Đề nghị giao hàng trước 10h sáng ngày 28/08..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Email Live Preview Bar */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-primary">
                    <FileText className="h-4 w-4" />
                    Mẫu Thư HTML Chuẩn Doanh Nghiệp Đã Được Dựng Sẵn
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Xem Trước Thư Email
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Kênh Liên Hệ Với NCC
                  </label>
                  <SearchableSelect
                    options={[
                      { label: 'Zalo Chat / Zalo OA', value: 'Zalo' },
                      { label: 'Gọi Điện Trực Tiếp (Hotline/SĐT)', value: 'Số Điện Thoại' },
                      { label: 'Gặp Mặt Trực Tiếp / Ký Bản Cứng', value: 'Trực Tiếp' },
                      { label: 'Kênh Khác', value: 'Khác' },
                    ]}
                    value={manualChannel}
                    onChange={(val) => setManualChannel(val)}
                    creatable={false}
                    placeholder="Chọn kênh liên hệ..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Ghi Chú Xác Nhận (Lưu Lịch Sử Hệ Thống)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    placeholder="VD: Đã chốt số lượng và giá qua Zalo với anh Nam đại diện..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-input bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang Xử Lý...
                  </>
                ) : activeTab === 'email' ? (
                  <>
                    <Send className="h-4 w-4" /> Xác Nhận Gửi Email PO
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Xác Nhận Đã Chốt Thủ Công
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Email HTML Preview Sub-Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Eye className="h-4 w-4 text-primary" />
                Xem Trước Giao Diện Email Sắp Gửi Tới NCC ({recipientEmail || 'sales@supplier.com'})
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-muted/10">
              {loadingPreview ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  Đang dựng khung Email HTML...
                </div>
              ) : (
                <div
                  className="mx-auto bg-white rounded-xl shadow border border-border overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>

            <div className="border-t border-border bg-card p-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Đóng Xem Trước
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
