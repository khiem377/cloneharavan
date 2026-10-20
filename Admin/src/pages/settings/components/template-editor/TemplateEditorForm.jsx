import React, { useRef } from 'react';
import { Tag, Sparkles } from '@/components/ui/Icons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function TemplateEditorForm({
  form,
  onChange,
  availableVariables = [],
  defaults = {},
}) {
  const lastFocusedRef = useRef(null);

  const handleFocus = (field) => {
    lastFocusedRef.current = field;
  };

  const insertVariable = (variableKey) => {
    const targetField = lastFocusedRef.current || 'subject';
    const currentValue = form[targetField] ?? '';
    const tag = `{{${variableKey}}}`;
    const nextValue = currentValue ? `${currentValue} ${tag}` : tag;
    onChange(targetField, nextValue);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Smart Tags Selector */}
      {availableVariables.length > 0 && (
        <Card className="border-border bg-muted/30">
          <CardContent className="p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11.5px]">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Thẻ thông minh 1 chạm (Click để chèn vào ô đang soạn)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableVariables.map((v) => (
                <Button
                  key={v.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(v.key)}
                  title={v.desc}
                  className="h-6 px-2 py-0.5 rounded-[4px] bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40 border-border text-[11px] font-mono cursor-pointer transition-colors shadow-none"
                >
                  <Tag className="size-2.5 mr-1 opacity-60" />
                  <span>{`{{${v.key}}}`}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tiêu đề email */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground">Tiêu đề email (Subject)</Label>
          {defaults.subject && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => onChange('subject', defaults.subject)}
              className="h-auto p-0 text-[11px] text-muted-foreground hover:text-primary cursor-pointer"
            >
              Mặc định
            </Button>
          )}
        </div>
        <Input
          type="text"
          value={form.subject || ''}
          onFocus={() => handleFocus('subject')}
          onChange={(e) => onChange('subject', e.target.value)}
          placeholder={defaults.subject || 'Tiêu đề email...'}
          className="h-8 text-xs rounded-[6px] border-border bg-background"
        />
      </div>

      {/* Lời chào / Mở đầu */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground">Lời chào & Lời cảm ơn mở đầu</Label>
          {defaults.greetingMessage && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => onChange('greetingMessage', defaults.greetingMessage)}
              className="h-auto p-0 text-[11px] text-muted-foreground hover:text-primary cursor-pointer"
            >
              Mặc định
            </Button>
          )}
        </div>
        <Textarea
          rows={3}
          value={form.greetingMessage || ''}
          onFocus={() => handleFocus('greetingMessage')}
          onChange={(e) => onChange('greetingMessage', e.target.value)}
          placeholder={defaults.greetingMessage || 'Cảm ơn bạn đã đặt hàng tại cửa hàng...'}
          className="text-xs rounded-[6px] border-border bg-background resize-none leading-relaxed"
        />
      </div>

      {/* Ghi chú đặc biệt / Dặn dò */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground">Dặn dò & Lưu ý đặc biệt (Khung nổi bật trong mail)</Label>
          {defaults.specialNote && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => onChange('specialNote', defaults.specialNote)}
              className="h-auto p-0 text-[11px] text-muted-foreground hover:text-primary cursor-pointer"
            >
              Mặc định
            </Button>
          )}
        </div>
        <Textarea
          rows={2}
          value={form.specialNote || ''}
          onFocus={() => handleFocus('specialNote')}
          onChange={(e) => onChange('specialNote', e.target.value)}
          placeholder={defaults.specialNote || 'Ví dụ: Đơn hàng sẽ được nhân viên gọi xác nhận trong 15 phút...'}
          className="text-xs rounded-[6px] border-border bg-background resize-none leading-relaxed"
        />
      </div>

      {/* Nút hành động CTA & Chân thư */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Chữ trên nút bấm (CTA)</Label>
          <Input
            type="text"
            value={form.ctaText || ''}
            onFocus={() => handleFocus('ctaText')}
            onChange={(e) => onChange('ctaText', e.target.value)}
            placeholder={defaults.ctaText || 'Xem chi tiết đơn hàng'}
            className="h-8 text-xs rounded-[6px] border-border bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">Hotline / Hỗ trợ chân thư</Label>
          <Input
            type="text"
            value={form.footerNote || ''}
            onFocus={() => handleFocus('footerNote')}
            onChange={(e) => onChange('footerNote', e.target.value)}
            placeholder={defaults.footerNote || 'Hotline: 1900 xxxx...'}
            className="h-8 text-xs rounded-[6px] border-border bg-background"
          />
        </div>
      </div>
    </div>
  );
}
