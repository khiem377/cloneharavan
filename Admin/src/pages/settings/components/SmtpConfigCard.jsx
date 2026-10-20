import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, Eye, EyeOff, Loader2, Send, Save, ShieldCheck } from '@/components/ui/Icons';
import { notificationService } from '@/services/notification.service';
import { toast } from '@/providers/ToastProvider';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function SmtpConfigCard({ initialSmtp = {}, onSmtpUpdated }) {
  const [form, setForm] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    fromName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (initialSmtp) {
      const portVal = Number(initialSmtp.port) || 587;
      setForm({
        host: initialSmtp.host || 'smtp.gmail.com',
        port: portVal,
        secure: initialSmtp.secure !== undefined ? Boolean(initialSmtp.secure) : portVal === 465,
        user: initialSmtp.user || '',
        pass: initialSmtp.pass || '',
        fromName: initialSmtp.fromName || '',
      });
    }
  }, [initialSmtp]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'port') {
        const p = Number(value);
        if (p === 465) next.secure = true;
        else if (p === 587) next.secure = false;
      }
      return next;
    });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.user) {
      toast.error('Vui lòng nhập Tài khoản gửi (Email)');
      return;
    }

    try {
      setSaving(true);
      const res = await notificationService.updateSmtpConfig({
        ...form,
        isEnabled: true,
      });
      if (res.success) {
        toast.success(res.message || 'Lưu cấu hình SMTP thành công');
        if (onSmtpUpdated) onSmtpUpdated(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể lưu cấu hình SMTP');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSelf = async () => {
    if (!form.user || !form.user.includes('@')) {
      toast.error('Vui lòng nhập Tài khoản gửi (Username / Email) trước khi kiểm tra');
      return;
    }
    if (!form.pass && !initialSmtp?.hasPassword) {
      toast.error('Vui lòng nhập Mật khẩu ứng dụng trước khi kiểm tra');
      return;
    }

    try {
      setTesting(true);
      const res = await notificationService.testSmtpConfig(form);
      if (res.success) {
        toast.success(res.message || `Đã gửi thư kiểm tra thành công tới ${form.user}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kết nối SMTP thất bại. Vui lòng kiểm tra lại thông số');
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = Boolean(form.user && (form.pass || initialSmtp?.hasPassword));

  return (
    <Card className="border-border bg-card">
      {/* Header Card */}
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Server className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-foreground">
                  Máy chủ gửi thư (SMTP) của Shop
                </CardTitle>
                {isConfigured ? (
                  <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10.5px]">
                    <CheckCircle2 className="size-2.5 mr-1" />
                    Đã cấu hình
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10.5px] text-muted-foreground">
                    Chưa kích hoạt
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Toàn bộ email (đơn hàng, OTP, tài khoản) sẽ gửi trực tiếp từ hòm thư riêng này.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestSelf}
              disabled={testing || saving || !form.user}
              className="h-8 text-xs font-semibold cursor-pointer"
              title="Tự động gửi email kiểm tra đến chính tài khoản này"
            >
              {testing ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Send className="size-3.5 mr-1 text-primary" />}
              <span>Gửi thư thử nghiệm cho chính mình</span>
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
      </CardHeader>

      <Separator />

      {/* Body: Form nhập thông số */}
      <CardContent className="p-5 pt-4">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Host */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold text-foreground">
                Máy chủ SMTP (Host) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                value={form.host}
                onChange={(e) => handleChange('host', e.target.value)}
                placeholder="smtp.gmail.com"
                className="h-8 text-xs font-mono rounded-[6px]"
                required
              />
            </div>

            {/* Port */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Cổng (Port) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                value={form.port}
                onChange={(e) => handleChange('port', e.target.value)}
                placeholder="587"
                className="h-8 text-xs font-mono rounded-[6px]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* User */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Tài khoản gửi (Email) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="email"
                value={form.user}
                onChange={(e) => handleChange('user', e.target.value)}
                placeholder="shopcuaban@gmail.com"
                className="h-8 text-xs rounded-[6px]"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Mật khẩu ứng dụng (App Password) <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.pass}
                  onChange={(e) => handleChange('pass', e.target.value)}
                  placeholder={initialSmtp?.hasPassword ? '•••••••••••••••• (Đã lưu mật khẩu)' : 'Mật khẩu ứng dụng 16 ký tự'}
                  className="h-8 text-xs font-mono pr-8 rounded-[6px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-6 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Tên người gửi hiển thị */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Tên người gửi hiển thị (From Name)</Label>
              <Input
                type="text"
                value={form.fromName}
                onChange={(e) => handleChange('fromName', e.target.value)}
                placeholder="Ví dụ: PosDemo Store..."
                className="h-8 text-xs rounded-[6px]"
              />
            </div>

            {/* SSL/TLS switch */}
            <div className="flex items-center justify-between p-2.5 rounded-[6px] border border-border bg-muted/20 self-end h-8">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                <Label className="text-xs font-semibold text-foreground cursor-pointer">
                  Mã hóa an toàn SSL/TLS (Bật cho Port 465)
                </Label>
              </div>
              <Switch
                checked={form.secure}
                onCheckedChange={(checked) => handleChange('secure', checked)}
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
