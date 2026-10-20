import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notification.service';
import EmailTemplatesList from './EmailTemplatesList';
import EmailBrandingCustomizer from './EmailBrandingCustomizer';
import EmailTemplateEditModal from './EmailTemplateEditModal';
import { toast } from '@/providers/ToastProvider';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationSettingsTab() {
  const [view, setView] = useState('list'); // 'list' | 'customize'
  const [selectedTemplateId, setSelectedTemplateId] = useState('order_confirmation');
  const [templates, setTemplates] = useState([]);
  const [triggers, setTriggers] = useState({});
  const [smtpConfig, setSmtpConfig] = useState(null);
  const [branding, setBranding] = useState({
    logoUrl: '',
    logoWidth: 180,
    primaryColor: '#0088ff',
  });
  const [storeInfo, setStoreInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal tùy biến câu chữ template
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getTemplates();
      if (res.success && res.data) {
        setTemplates(res.data.templates || []);
        setTriggers(res.data.triggers || {});
        if (res.data.smtpConfig) {
          setSmtpConfig(res.data.smtpConfig);
        }
        if (res.data.storeInfo) {
          setStoreInfo(res.data.storeInfo);
        }
        if (res.data.branding) {
          setBranding({
            logoUrl: res.data.branding.logoUrl || res.data.storeInfo?.logo || '',
            logoWidth: Number(res.data.branding.logoWidth) || 180,
            primaryColor: res.data.branding.primaryColor || '#0088ff',
          });
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải mẫu email:', err);
      toast.error('Không thể tải danh sách cấu hình email thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Bật/tắt trigger gửi email
  const handleToggleTrigger = async (templateId, isEnabled) => {
    const prev = triggers[templateId];
    const newTriggers = { ...triggers, [templateId]: isEnabled };
    setTriggers(newTriggers);

    try {
      setSaving(true);
      await notificationService.updateSettings({ triggers: newTriggers });
      toast.success(
        isEnabled
          ? 'Đã bật gửi email tự động cho sự kiện này'
          : 'Đã tạm ngưng gửi email cho sự kiện này'
      );
    } catch (err) {
      setTriggers((t) => ({ ...t, [templateId]: prev }));
      toast.error('Không thể cập nhật trạng thái gửi email');
    } finally {
      setSaving(false);
    }
  };

  // Lưu thông tin thương hiệu logo & màu sắc
  const handleSaveBranding = async (newBranding) => {
    try {
      setSaving(true);
      const res = await notificationService.updateSettings({ branding: newBranding });
      if (res.success) {
        setBranding(newBranding);
        toast.success('Cập nhật thương hiệu email thành công');
      }
    } catch (err) {
      toast.error('Không thể lưu cấu hình thương hiệu email');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditModal = (templateId) => {
    setEditingTemplateId(templateId);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-96" />
        <Separator className="my-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full border border-border" />
          ))}
        </div>
      </div>
    );
  }

  if (view === 'customize') {
    return (
      <EmailBrandingCustomizer
        branding={branding}
        storeInfo={storeInfo}
        templates={templates}
        initialTemplateId={selectedTemplateId}
        onSaveBranding={handleSaveBranding}
        saving={saving}
        onBack={() => setView('list')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Danh sách các mẫu email thông báo */}
      <EmailTemplatesList
        templates={templates}
        triggers={triggers}
        onToggleTrigger={handleToggleTrigger}
        onOpenCustomizer={() => {
          setSelectedTemplateId('order_confirmation');
          setView('customize');
        }}
        onSelectTemplate={(tmplId) => {
          setSelectedTemplateId(tmplId);
          setView('customize');
        }}
        onEditTemplate={handleOpenEditModal}
        saving={saving}
      />

      {/* Modal Tùy biến nội dung Template & Live Preview & Reset to Default */}
      {showEditModal && editingTemplateId && (
        <EmailTemplateEditModal
          templateId={editingTemplateId}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTemplateId(null);
          }}
          onSaved={loadData}
        />
      )}
    </div>
  );
}
