import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  Loader2,
  Check,
  RefreshCw,
  Mail,
  Upload,
  Trash2,
  Link as LinkIcon,
} from '@/components/ui/Icons';
import { notificationService } from '@/services/notification.service';
import { mediaService } from '@/services/media.service';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function EmailBrandingCustomizer({
  branding = {},
  storeInfo = {},
  templates = [],
  initialTemplateId = 'order_confirmation',
  onBack,
  onSaveBranding,
  saving,
}) {
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || storeInfo.logo || '');
  const [logoWidth, setLogoWidth] = useState(branding.logoWidth || 180);
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor || '#0088ff');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Modal gửi email test
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Khởi tạo index ban đầu theo initialTemplateId
  useEffect(() => {
    if (templates.length > 0) {
      const idx = templates.findIndex((t) => t.id === initialTemplateId);
      if (idx !== -1) setCurrentIdx(idx);
    }
  }, [initialTemplateId, templates]);

  const currentTemplate = templates[currentIdx] || templates[0] || { id: 'order_confirmation', name: 'Xác nhận đơn hàng' };

  // Nạp lại Live HTML Preview khi đổi mẫu hoặc đổi màu/logo
  useEffect(() => {
    let isCancelled = false;
    const loadPreview = async () => {
      if (!currentTemplate?.id) return;
      setPreviewLoading(true);
      try {
        const res = await notificationService.previewTemplate(currentTemplate.id, {
          logoUrl,
          logoWidth,
          primaryColor,
        });
        if (!isCancelled && res?.success && res.data?.html) {
          let html = res.data.html;
          if (primaryColor) {
            html = html.replaceAll(res.data.branding?.primaryColor || '#0088ff', primaryColor);
          }
          if (logoWidth) {
            html = html.replaceAll(`width="${res.data.branding?.logoWidth || 180}"`, `width="${logoWidth}"`);
          }
          if (logoUrl) {
            html = html.replaceAll(res.data.branding?.logoUrl || '', logoUrl);
          }
          setPreviewHtml(html);
        }
      } catch (err) {
        console.warn('Lỗi tải preview email:', err);
      } finally {
        if (!isCancelled) setPreviewLoading(false);
      }
    };

    loadPreview();
    return () => {
      isCancelled = true;
    };
  }, [currentTemplate?.id, primaryColor, logoWidth, logoUrl]);

  // Upload file logo trực tiếp từ thiết bị lên Media
  const handleUploadLogo = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Dung lượng ảnh logo tối đa là 2MB');
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', 'store-logo');

      const res = await mediaService.upload(formData);
      const mediaItem = res.data?.data?.media || res.data?.data || res.data;

      if (mediaItem?.url) {
        setLogoUrl(mediaItem.url);
        toast.success('Đã tải lên ảnh logo mới thành công!');
      } else {
        toast.error('Không tìm thấy đường dẫn ảnh sau khi tải lên');
      }
    } catch (err) {
      console.error('Lỗi tải ảnh logo:', err);
      toast.error('Lỗi khi tải ảnh lên: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % templates.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + templates.length) % templates.length);
  };

  const handleSave = () => {
    onSaveBranding({
      logoUrl: logoUrl.trim(),
      logoWidth: Number(logoWidth) || 180,
      primaryColor,
    });
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testEmail.trim()) {
      toast.error('Vui lòng nhập địa chỉ email nhận');
      return;
    }
    setSendingTest(true);
    try {
      await notificationService.sendTestEmail(testEmail.trim(), currentTemplate.id);
      toast.success(`Đã gửi email thử nghiệm tới ${testEmail}`);
      setShowTestModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi email thử nghiệm');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="size-3.5 mr-1.5" />
          <span>Quay lại danh sách thông báo</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTestModal(true)}
            className="h-8 text-xs font-medium cursor-pointer"
          >
            <Send className="size-3 mr-1 text-primary" />
            <span>Gửi thử nghiệm</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            {saving ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Save className="size-3.5 mr-1" />}
            <span>Lưu cấu hình</span>
          </Button>
        </div>
      </div>

      {/* Card 1: Logo và màu sắc nhận diện */}
      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Logo và màu sắc nhận diện
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Cụm Logo (Preview + Upload) - 6 cols */}
          <div className="lg:col-span-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">
                Ảnh Logo Email
              </Label>
              {logoUrl && logoUrl !== storeInfo.logo && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setLogoUrl(storeInfo.logo || '')}
                  className="h-auto p-0 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  title="Khôi phục logo theo thông tin cửa hàng"
                >
                  Khôi phục logo mặc định
                </Button>
              )}
            </div>

            {logoUrl ? (
              <div className="flex items-center gap-3.5 p-2.5 border border-border rounded-[6px] bg-muted/20">
                {/* Thumbnail ảnh logo */}
                <div className="w-28 h-14 bg-white dark:bg-zinc-900 border border-border rounded-[4px] p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Hành động đổi ảnh / nhập URL */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2.5 text-xs">
                    <label className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer">
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Đang tải lên...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-3.5" />
                          <span>Tải ảnh mới</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingLogo}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleUploadLogo(e.target.files[0]);
                          e.target.value = '';
                        }}
                      />
                    </label>

                    <span className="text-border">•</span>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="h-6 px-1.5 inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-xs"
                    >
                      <LinkIcon className="size-3" />
                      <span>{showUrlInput ? 'Ẩn URL' : 'Đổi qua URL'}</span>
                    </Button>

                    <span className="text-border">•</span>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogoUrl('')}
                      className="h-6 px-1.5 inline-flex items-center gap-1 font-medium text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors text-xs"
                      title="Xóa logo này"
                    >
                      <Trash2 className="size-3" />
                      <span>Xóa</span>
                    </Button>
                  </div>

                  <p className="text-[11px] text-muted-foreground truncate">
                    {logoUrl.startsWith('http') ? logoUrl : 'Logo tùy chỉnh'}
                  </p>

                  {showUrlInput && (
                    <Input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Dán link ảnh logo https://..."
                      className="w-full h-7 px-2 mt-1 rounded-[4px] border-border bg-background text-[11px] font-mono"
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Khi chưa có ảnh logo */
              <div className="border border-dashed border-border rounded-[6px] p-3 text-center bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 cursor-pointer active:scale-[0.98] transition-all">
                    {uploadingLogo ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>{uploadingLogo ? 'Đang tải lên...' : 'Tải ảnh logo từ máy'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingLogo}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadLogo(e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <span className="text-xs text-muted-foreground">hoặc</span>

                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="h-auto p-0 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Dán URL ảnh
                  </Button>
                </div>

                {showUrlInput && (
                  <Input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://... dán link ảnh logo"
                    className="w-full h-7 px-2 mt-2 rounded-[4px] border-border bg-background text-[11px] font-mono"
                  />
                )}
              </div>
            )}
          </div>

          {/* Chiều rộng logo - 3 cols */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">
                Chiều rộng logo
              </Label>
              <span className="text-xs font-mono tabular-nums font-semibold text-primary">
                {logoWidth} px
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <input
                type="range"
                min={80}
                max={320}
                step={5}
                value={logoWidth}
                onChange={(e) => setLogoWidth(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>80px</span>
                <span>180px (chuẩn)</span>
                <span>320px</span>
              </div>
            </div>
          </div>

          {/* Màu sắc chủ đạo - 3 cols */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <Label className="text-xs font-semibold text-foreground">
              Màu sắc chủ đạo (Brand Accent)
            </Label>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="size-8 rounded-[6px] border border-border cursor-pointer p-0.5 bg-background shrink-0"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                maxLength={7}
                className="h-8 flex-1 px-2.5 rounded-[6px] text-xs font-mono uppercase"
              />
            </div>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Card 2: Live Preview */}
      <Card className="border-border bg-card overflow-hidden">
        {/* Preview Toolbar */}
        <CardHeader className="flex flex-row items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20 space-y-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xs font-bold text-foreground">
              {currentTemplate?.name}
            </CardTitle>
            <span className="text-[11px] text-muted-foreground font-mono">
              ({currentIdx + 1}/{templates.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              className="size-7 p-0 rounded-[4px] cursor-pointer"
              title="Mẫu trước"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="size-7 p-0 rounded-[4px] cursor-pointer"
              title="Mẫu tiếp theo"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Khung render iframe Live HTML Preview */}
        <CardContent className="p-4 bg-slate-50 dark:bg-muted/10 min-h-[460px] flex items-center justify-center">
          {previewLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Đang kết xuất bản xem trước...</span>
            </div>
          ) : (
            <iframe
              srcDoc={previewHtml}
              title="Email Live Preview"
              className="w-full max-w-[580px] h-[520px] rounded-[6px] border border-border bg-white shadow-xs overflow-auto"
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog gửi email test */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground">Gửi email thử nghiệm</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Email sẽ được gửi theo mẫu <strong>{currentTemplate?.name}</strong> với màu sắc và logo hiện tại.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendTest} className="space-y-3 pt-2">
            <Input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="nhap-email-cua-ban@gmail.com"
              className="h-8 text-xs font-mono rounded-[6px]"
            />
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTestModal(false)}
                className="h-8 text-xs cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={sendingTest}
                className="h-8 text-xs font-semibold cursor-pointer"
              >
                {sendingTest ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : 'Gửi ngay'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
