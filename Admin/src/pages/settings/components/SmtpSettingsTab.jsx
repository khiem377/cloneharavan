import React, { useState, useEffect } from 'react';
import SmtpConfigCard from './SmtpConfigCard';
import { notificationService } from '@/services/notification.service';
import { toast } from '@/providers/ToastProvider';
import { HelpCircle } from '@/components/ui/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function SmtpSettingsTab() {
  const [smtpConfig, setSmtpConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSmtp = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getTemplates();
      if (res.success && res.data?.smtpConfig) {
        setSmtpConfig(res.data.smtpConfig);
      }
    } catch (err) {
      console.error('Lỗi khi tải cấu hình SMTP:', err);
      toast.error('Không thể tải cấu hình máy chủ gửi thư');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSmtp();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-96" />
        <Separator className="my-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full border border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Khối Cấu hình chính */}
      <SmtpConfigCard
        initialSmtp={smtpConfig}
        onSmtpUpdated={(updated) => setSmtpConfig(updated)}
      />

      {/* Khối hướng dẫn thiết lập Gmail / Zoho */}
      <Card className="border-border bg-card">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center gap-2 text-foreground">
            <HelpCircle className="size-4 text-sky-600" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider">
              Hướng dẫn cấu hình nhanh các dịch vụ phổ biến
            </CardTitle>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-5 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            {/* Gmail */}
            <Card className="p-4 bg-muted/20 border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-xs">Google Gmail / Google Workspace</span>
                <Badge variant="secondary" className="font-mono text-[10.5px]">
                  Port 587 / 465
                </Badge>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11.5px] leading-relaxed">
                <li><strong>SMTP Host:</strong> <code className="font-mono text-foreground">smtp.gmail.com</code></li>
                <li><strong>Cổng:</strong> <code className="font-mono text-foreground">587</code> (không tick SSL) hoặc <code className="font-mono text-foreground">465</code> (tick SSL/TLS)</li>
                <li>Bật <strong>Xác minh 2 bước</strong> trong tài khoản Google.</li>
                <li>Tạo <strong>Mật khẩu ứng dụng (App Password)</strong> 16 ký tự và dán vào ô mật khẩu.</li>
              </ul>
            </Card>

            {/* Zoho */}
            <Card className="p-4 bg-muted/20 border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-xs">Zoho Mail Doanh nghiệp</span>
                <Badge variant="secondary" className="font-mono text-[10.5px]">
                  Port 587 / 465
                </Badge>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11.5px] leading-relaxed">
                <li><strong>SMTP Host:</strong> <code className="font-mono text-foreground">smtppro.zoho.com</code></li>
                <li><strong>Cổng:</strong> <code className="font-mono text-foreground">587</code> hoặc <code className="font-mono text-foreground">465</code> (bật SSL/TLS)</li>
                <li>Dùng địa chỉ email tên miền làm tài khoản.</li>
                <li>Vào cài đặt Zoho Mail tạo <strong>Application Specific Password</strong>.</li>
              </ul>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
