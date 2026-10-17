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
import { toast } from '@/providers/ToastProvider';
import paymentProviderService from '@/services/paymentProvider.service';
import { PaymentMethodLogo } from './PaymentLogos';
import { PAYMENT_MODAL_CONFIG } from './paymentConfigData';
import { Info, ExternalLink } from 'lucide-react';

export default function ConnectPaymentModal({ isOpen, onClose, provider, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [environment, setEnvironment] = useState('sandbox');
  const [saving, setSaving] = useState(false);

  const code = provider?.code;
  const config = PAYMENT_MODAL_CONFIG[code] || {
    title: `Kết nối cổng ${provider?.name || ''}`,
    notice: 'Vui lòng nhập các thông số xác thực API do đối tác cung cấp.',
    fields: [],
    links: [],
  };

  useEffect(() => {
    if (provider && isOpen) {
      setEnvironment(provider.environment || 'sandbox');
      const initial = {};
      const fields = config.fields || [];
      fields.forEach((f) => {
        initial[f.key] = provider.maskedCredentials?.[f.key] || '';
      });
      setFormData(initial);
    }
  }, [provider, isOpen, code]);

  const handleChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await paymentProviderService.connectProvider(code, {
        credentials: formData,
        environment,
      });
      toast.success(`Kết nối thành công cổng ${provider.name}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi kết nối cổng thanh toán');
    } finally {
      setSaving(false);
    }
  };

  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white dark:bg-card border border-border rounded-[6px]">
        <DialogHeader className="p-4 border-b border-border bg-[#fafbfb] dark:bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-28 h-9 flex items-center shrink-0">
              <PaymentMethodLogo code={code} className="h-7" />
            </div>
            <div>
              <DialogTitle className="text-[15px] font-bold text-slate-900 dark:text-foreground">
                {config.title}
              </DialogTitle>
              <p className="text-[12px] text-slate-500 dark:text-muted-foreground mt-0.5">
                {config.notice}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* MÔI TRƯỜNG KẾT NỐI */}
          <div className="bg-slate-50 dark:bg-muted/30 p-3 rounded-[6px] border border-border">
            <label className="block text-[12.5px] font-semibold text-slate-800 dark:text-foreground mb-1.5">
              Môi trường API
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEnvironment('sandbox')}
                className={`py-2 px-3 text-[12.5px] font-medium rounded-[4px] border text-center transition-all cursor-pointer ${
                  environment === 'sandbox'
                    ? 'border-[#0088ff] bg-[#e8f2fe] text-[#0088ff] font-semibold dark:bg-[#0088ff]/15 dark:text-[#38bdf8]'
                    : 'border-border bg-white dark:bg-card text-slate-600 dark:text-muted-foreground hover:bg-slate-100'
                }`}
              >
                Sandbox (Môi trường test)
              </button>
              <button
                type="button"
                onClick={() => setEnvironment('production')}
                className={`py-2 px-3 text-[12.5px] font-medium rounded-[4px] border text-center transition-all cursor-pointer ${
                  environment === 'production'
                    ? 'border-[#0088ff] bg-[#e8f2fe] text-[#0088ff] font-semibold dark:bg-[#0088ff]/15 dark:text-[#38bdf8]'
                    : 'border-border bg-white dark:bg-card text-slate-600 dark:text-muted-foreground hover:bg-slate-100'
                }`}
              >
                Production (Chính thức)
              </button>
            </div>
          </div>

          {/* CÁC TRƯỜNG NHẬP LIỆU KEYS */}
          <div className="space-y-3">
            {config.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-[12.5px] font-semibold text-slate-800 dark:text-foreground mb-1">
                  {field.label}
                </label>
                <Input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  className="h-9 text-[13px] rounded-[6px] font-mono"
                />
              </div>
            ))}
          </div>

          {/* LIÊN KẾT TÀI LIỆU HỖ TRỢ */}
          {config.links?.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-muted-foreground mb-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Tài liệu hướng dẫn &amp; cổng kết nối:</span>
              </div>
              <div className="flex flex-col gap-1">
                {config.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-[#0088ff] hover:underline flex items-center gap-1"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 text-[13px] rounded-[6px]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-[13px] font-medium rounded-[6px] bg-[#0088ff] hover:bg-[#0077e6] text-white active:scale-[0.98] transition-transform cursor-pointer"
            >
              {saving ? 'Đang lưu...' : 'Lưu kết nối'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
