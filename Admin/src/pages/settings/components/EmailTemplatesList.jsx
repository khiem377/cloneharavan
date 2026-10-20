import React from 'react';
import { Package, Truck, UserCheck, Building2, Paintbrush, Edit3, Sparkles } from '@/components/ui/Icons';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function EmailTemplatesList({
  templates = [],
  triggers = {},
  onToggleTrigger,
  onOpenCustomizer,
  onSelectTemplate,
  onEditTemplate,
  saving,
}) {
  const groups = [
    {
      id: 'order',
      title: 'Đơn hàng',
      icon: Package,
      iconColor: 'text-primary',
      description: 'Các email tự động gửi khi khách mua hàng, cập nhật hoặc hủy đơn.',
      items: templates.filter((t) => t.group === 'order'),
    },
    {
      id: 'shipping',
      title: 'Vận chuyển',
      icon: Truck,
      iconColor: 'text-sky-600',
      description: 'Các email thông báo mã vận đơn, tiến trình đóng gói và giao hàng.',
      items: templates.filter((t) => t.group === 'shipping'),
    },
    {
      id: 'account',
      title: 'Tài khoản & Khách hàng',
      icon: UserCheck,
      iconColor: 'text-emerald-600',
      description: 'Các email liên quan đến xác minh tài khoản và đặt lại mật khẩu.',
      items: templates.filter((t) => t.group === 'account'),
    },
    {
      id: 'admin',
      title: 'Hệ thống & Nhà cung cấp',
      icon: Building2,
      iconColor: 'text-indigo-600',
      description: 'Mã xác thực đăng nhập bảo mật và phiếu đặt mua hàng (PO).',
      items: templates.filter((t) => t.group === 'admin'),
    },
  ];

  return (
    <Card className="border-border bg-card animate-in fade-in duration-200">
      {/* Header Section */}
      <CardHeader className="p-5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Nội dung email tự động
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Những email này được hệ thống gửi tự động. Bạn có thể sửa câu chữ, dặn dò hoặc tùy biến màu sắc, logo thương hiệu.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenCustomizer}
            className="h-8 text-xs font-semibold rounded-[6px] shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Paintbrush className="size-3.5 mr-1 text-primary" />
            Màu sắc & Logo chung
          </Button>
        </div>
      </CardHeader>

      <Separator />

      {/* Các nhóm mẫu email */}
      <CardContent className="p-5 space-y-6">
        {groups.map((grp) => {
          if (grp.items.length === 0) return null;
          const Icon = grp.icon;

          return (
            <div key={grp.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className={`size-4 ${grp.iconColor}`} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {grp.title} ({grp.items.length})
                </h3>
              </div>

              <div className="divide-y divide-border border border-border rounded-[6px] overflow-hidden bg-card">
                {grp.items.map((item) => {
                  const isEnabled = triggers[item.id] !== false;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => (onEditTemplate ? onEditTemplate(item.id) : onSelectTemplate(item.id))}
                            className="text-xs font-bold text-primary hover:underline text-left cursor-pointer"
                          >
                            {item.name}
                          </button>

                          {item.isCustomized ? (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-medium py-0 px-1.5 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800"
                            >
                              <Sparkles className="size-2.5 mr-1" />
                              Đã tùy chỉnh
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-muted-foreground py-0 px-1.5"
                            >
                              Mặc định
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => (onEditTemplate ? onEditTemplate(item.id) : onSelectTemplate(item.id))}
                          className="h-7 px-2.5 rounded-[4px] text-xs font-medium cursor-pointer"
                          title="Tùy biến câu chữ mẫu email này"
                        >
                          <Edit3 className="size-3 mr-1 text-muted-foreground" />
                          <span className="hidden sm:inline">Sửa nội dung</span>
                        </Button>

                        <div className="ml-1 flex items-center">
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => onToggleTrigger(item.id, checked)}
                            disabled={saving}
                            aria-label={`Bật tắt gửi email ${item.name}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
