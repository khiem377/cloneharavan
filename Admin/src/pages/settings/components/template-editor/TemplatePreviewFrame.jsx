import React, { useState } from 'react';
import { Smartphone, Monitor, Loader2, Mail } from '@/components/ui/Icons';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TemplatePreviewFrame({ html = '', subject = '', loading = false }) {
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'mobile'

  return (
    <Card className="flex flex-col h-full bg-slate-50 dark:bg-muted/20 border-border overflow-hidden">
      {/* Thanh công cụ Preview */}
      <CardHeader className="p-3 bg-card border-b border-border flex flex-row items-center justify-between gap-2 shrink-0 space-y-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Mail className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-foreground truncate">
            {subject || 'Xem trước mẫu email'}
          </span>
          {loading && <Loader2 className="size-3 animate-spin text-primary shrink-0" />}
        </div>

        <div className="flex items-center gap-1 border border-border rounded-[4px] p-0.5 bg-background shrink-0">
          <Button
            type="button"
            variant={device === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDevice('desktop')}
            className="size-6 p-0 rounded-[3px] cursor-pointer"
            title="Xem giao diện Máy tính"
          >
            <Monitor className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={device === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDevice('mobile')}
            className="size-6 p-0 rounded-[3px] cursor-pointer"
            title="Xem giao diện Di động"
          >
            <Smartphone className="size-3.5" />
          </Button>
        </div>
      </CardHeader>

      {/* Vùng hiển thị Iframe */}
      <CardContent className="p-3 flex justify-center items-start overflow-y-auto min-h-[460px] flex-1">
        <div
          className={`transition-all duration-200 border border-border bg-white rounded-[6px] overflow-hidden ${
            device === 'mobile' ? 'w-[375px] min-h-[580px]' : 'w-full min-h-[580px]'
          }`}
        >
          {html ? (
            <iframe
              title="Email Live Preview"
              srcDoc={html}
              className="w-full h-full min-h-[580px] border-0"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary mb-2" />
              <p className="text-xs">Đang tải bản xem trước thời gian thực...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
