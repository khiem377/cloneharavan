import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Send, Save, Loader2, AlertTriangle } from '@/components/ui/Icons';
import { notificationService } from '@/services/notification.service';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import TemplateEditorForm from './template-editor/TemplateEditorForm';
import TemplatePreviewFrame from './template-editor/TemplatePreviewFrame';

export default function EmailTemplateEditModal({ templateId, isOpen, onClose, onSaved }) {
  const [template, setTemplate] = useState(null);
  const [form, setForm] = useState({});
  const [defaults, setDefaults] = useState({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !templateId) return;

    let isMounted = true;
    const loadDetail = async () => {
      try {
        setLoading(true);
        const res = await notificationService.getTemplateDetail(templateId);
        if (isMounted && res.success && res.data) {
          const { template: t, custom, defaults: d, preview } = res.data;
          setTemplate(t);
          setDefaults(d || {});
          setForm({
            subject: custom?.subject || d?.subject || '',
            greetingMessage: custom?.greetingMessage || d?.greetingMessage || '',
            specialNote: custom?.specialNote || d?.specialNote || '',
            ctaText: custom?.ctaText || d?.ctaText || '',
            footerNote: custom?.footerNote || d?.footerNote || '',
          });
          setPreviewHtml(preview?.html || '');
        }
      } catch (err) {
        toast.error('Không thể tải chi tiết mẫu email');
        onClose();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDetail();
    return () => {
      isMounted = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [isOpen, templateId, onClose]);

  // Debounced live preview update when form changes
  const handleFieldChange = (field, value) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setPreviewLoading(true);
        const res = await notificationService.previewCustomTemplate(templateId, {
          customConfig: nextForm,
        });
        if (res.success && res.data?.html) {
          setPreviewHtml(res.data.html);
        }
      } catch (err) {
        console.warn('Preview error:', err);
      } finally {
        setPreviewLoading(false);
      }
    }, 250);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await notificationService.saveCustomTemplate(templateId, form);
      if (res.success) {
        toast.success('Đã lưu tùy biến mẫu email thành công');
        if (onSaved) onSaved();
        onClose();
      }
    } catch (err) {
      toast.error('Không thể lưu tùy biến mẫu email');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      setSaving(true);
      const res = await notificationService.resetCustomTemplate(templateId);
      if (res.success) {
        setForm({
          subject: defaults.subject || '',
          greetingMessage: defaults.greetingMessage || '',
          specialNote: defaults.specialNote || '',
          ctaText: defaults.ctaText || '',
          footerNote: defaults.footerNote || '',
        });
        toast.success('Đã khôi phục mẫu email về mặc định ban đầu');
        setShowResetConfirm(false);
        const prevRes = await notificationService.previewCustomTemplate(templateId, {
          customConfig: defaults,
        });
        if (prevRes.success && prevRes.data?.html) {
          setPreviewHtml(prevRes.data.html);
        }
        if (onSaved) onSaved();
      }
    } catch (err) {
      toast.error('Không thể khôi phục mẫu mặc định');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    try {
      setSendingTest(true);
      const res = await notificationService.sendTestNotificationEmail({
        email: testEmail ? testEmail.trim() : undefined,
        templateId,
        customConfig: form,
      });
      if (res.success) {
        toast.success(res.message || 'Đã gửi email thử nghiệm thành công');
        setShowTestDialog(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi email thử nghiệm thất bại');
    } finally {
      setSendingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[95vw] max-w-6xl h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-[6px] border-border bg-background shadow-lg"
        showCloseButton={false}
      >
        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-border flex items-center justify-between gap-3 shrink-0 bg-card">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground truncate">
              {template?.name ? `Tùy biến: ${template.name}` : 'Tùy biến nội dung email'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chỉnh sửa câu chữ, dặn dò và nút hành động. Xem trước trực tiếp theo thời gian thực.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="size-7 p-0 rounded-[4px] cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary mb-2" />
            <p className="text-xs">Đang tải cấu hình mẫu email...</p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-5 overflow-y-auto">
            {/* Cột trái: Visual Form */}
            <div className="lg:col-span-6 space-y-4">
              <TemplateEditorForm
                form={form}
                onChange={handleFieldChange}
                availableVariables={template?.availableVariables || []}
                defaults={defaults}
              />
            </div>

            {/* Cột phải: Live HTML Preview */}
            <div className="lg:col-span-6 min-h-[500px]">
              <TemplatePreviewFrame
                html={previewHtml}
                subject={form.subject || defaults.subject}
                loading={previewLoading}
              />
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-border bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              disabled={saving || loading}
              className="h-8 text-xs font-medium text-destructive hover:bg-destructive/10 border-border cursor-pointer"
            >
              <RotateCcw className="size-3.5 mr-1" />
              <span>Khôi phục mẫu mặc định</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTestDialog(true)}
              disabled={saving || loading}
              className="h-8 text-xs font-medium border-border cursor-pointer"
            >
              <Send className="size-3.5 mr-1 text-sky-600" />
              <span>Gửi thử nghiệm</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs font-medium border-border cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving || loading}
              className="h-8 text-xs font-semibold cursor-pointer"
            >
              {saving ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Save className="size-3.5 mr-1" />}
              <span>Lưu thay đổi</span>
            </Button>
          </div>
        </div>

        {/* Sub-Dialog: Xác nhận khôi phục mẫu mặc định */}
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="size-4 text-amber-500" />
                Xác nhận khôi phục mẫu gốc?
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed text-muted-foreground pt-1">
                Toàn bộ câu chữ và tùy biến của bạn cho mẫu này sẽ được thay thế bằng nội dung mặc định ban đầu của hệ thống.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="h-8 text-xs cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleResetToDefault}
                disabled={saving}
                className="h-8 text-xs font-semibold cursor-pointer"
              >
                {saving && <Loader2 className="size-3.5 mr-1 animate-spin" />}
                Đồng ý khôi phục
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sub-Dialog: Gửi email thử nghiệm */}
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Send className="size-4 text-primary" />
                Gửi email thử nghiệm
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1">
                Hệ thống sẽ gửi một bản mẫu thực tế với nội dung đang soạn thảo đến hộp thư chỉ định hoặc hộp thư của bạn.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5 py-2">
              <Label className="text-xs font-semibold text-foreground">Địa chỉ email nhận (để trống nếu gửi cho chính bạn)</Label>
              <Input
                type="email"
                placeholder="ví dụ: ban@gmail.com..."
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="h-8 text-xs rounded-[6px]"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTestDialog(false)}
                className="h-8 text-xs cursor-pointer"
              >
                Đóng
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSendTest}
                disabled={sendingTest}
                className="h-8 text-xs font-semibold cursor-pointer"
              >
                {sendingTest ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Send className="size-3.5 mr-1" />}
                Gửi ngay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
