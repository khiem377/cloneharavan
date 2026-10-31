import React from 'react';
import { ChevronRight, ExternalLink } from '@/components/ui/Icons';
import { Checkbox } from '@/components/ui/checkbox';
import { LINK_TYPE_LABELS, BADGE_COLORS } from './menuEditorConstants';

export default function ItemFormPanel({
  item,
  onChange,
  categories,
  brands,
  blogCats,
  flatCategoryOptions = [],
}) {
  if (!item) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-8">
        <ChevronRight size={36} strokeWidth={1.2} />
        <p className="text-sm text-center">Chọn một mục bên trái để chỉnh sửa</p>
      </div>
    );
  }

  const set = (key, val) => onChange({ ...item, [key]: val });

  const refOptions = {
    category: flatCategoryOptions.length > 0 ? flatCategoryOptions : categories,
    brand: brands,
    blog: blogCats,
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 p-5 overflow-y-auto">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground">
          Tên hiển thị <span className="text-destructive ml-0.5">*</span>
        </label>
        <input
          className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
          value={item.label}
          onChange={(e) => set('label', e.target.value)}
          placeholder="Ví dụ: Tivi, Flash Sale..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground">Loại link</label>
        <select
          className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
          value={item.linkType}
          onChange={(e) => {
            const newType = e.target.value;
            const updates = { linkType: newType };
            if (newType === 'none') {
              updates.customUrl = '';
              updates.linkRef = null;
            }
            onChange({ ...item, ...updates });
          }}
        >
          {Object.entries(LINK_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {(item.linkType === 'category' || item.linkType === 'brand' || item.linkType === 'blog') && (
        <div className="flex flex-col gap-1.5 bg-muted/40 p-3 rounded-[6px] border border-border">
          <label className="text-xs font-semibold text-primary flex items-center justify-between">
            <span>Chọn {LINK_TYPE_LABELS[item.linkType]} (từ hệ thống)</span>
            <span className="text-[11px] font-normal text-muted-foreground">Tự động điền tên & link</span>
          </label>
          <select
            className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors font-medium"
            value={item.linkRef || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              const options = refOptions[item.linkType] || [];
              const selectedObj = options.find((o) => o._id === selectedId);

              const updates = { linkRef: selectedId || null };
              if (selectedObj) {
                updates.label = selectedObj.name;
                if (item.linkType === 'category') {
                  updates.customUrl = `/collections/${selectedObj.slug || selectedObj._id}`;
                } else if (item.linkType === 'brand') {
                  updates.customUrl = `/brands/${selectedObj.slug || selectedObj._id}`;
                } else if (item.linkType === 'blog') {
                  updates.customUrl = `/blogs/${selectedObj.slug || selectedObj._id}`;
                }
              }
              onChange({ ...item, ...updates });
            }}
          >
            <option value="">-- Bấm vào đây để chọn {LINK_TYPE_LABELS[item.linkType]} --</option>
            {(refOptions[item.linkType] || []).map((opt) => (
              <option key={opt._id} value={opt._id}>
                {item.linkType === 'category' && opt.depth
                  ? `${'　'.repeat(opt.depth)}└ ${opt.name}`
                  : opt.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {item.linkType === 'url' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">URL</label>
          <input
            className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors font-mono"
            value={item.customUrl}
            onChange={(e) => set('customUrl', e.target.value)}
            placeholder="/pages/chinh-sach hoặc https://..."
          />
        </div>
      )}

      {item.linkType !== 'none' && (
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="item-new-tab"
            checked={item.openInNewTab}
            onCheckedChange={(checked) => set('openInNewTab', checked)}
          />
          <label htmlFor="item-new-tab" className="text-sm text-foreground flex items-center gap-1.5 cursor-pointer select-none">
            Mở tab mới <ExternalLink size={12} className="text-muted-foreground" />
          </label>
        </div>
      )}

      <div className="border-t border-border" />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground">Badge (Hot, Mới, Sale...)</label>
        <div className="flex gap-2">
          <input
            className="h-9 flex-1 rounded-[6px] border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
            value={item.badge}
            onChange={(e) => set('badge', e.target.value)}
            placeholder="Để trống nếu không cần"
          />
          <select
            className="h-9 rounded-[6px] border border-input bg-background px-2 text-sm outline-none focus:border-ring transition-colors"
            value={item.badgeColor}
            onChange={(e) => set('badgeColor', e.target.value)}
          >
            {BADGE_COLORS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="item-mega-menu"
          checked={item.megaMenu}
          onCheckedChange={(checked) => set('megaMenu', checked)}
        />
        <label htmlFor="item-mega-menu" className="text-sm text-foreground cursor-pointer select-none">
          Hiển thị Mega Menu
        </label>
      </div>

      <div className="flex flex-col gap-1.5 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="item-is-active"
              checked={item.isActive !== false}
              onCheckedChange={(checked) => set('isActive', checked)}
            />
            <label htmlFor="item-is-active" className="text-sm font-semibold text-foreground cursor-pointer select-none">
              {item.isActive !== false ? 'Hiển thị trên website' : 'Đang tạm ẩn'}
            </label>
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-[6px] border ${
              item.isActive !== false
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            {item.isActive !== false ? 'Hoạt động' : 'Tạm ẩn'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {item.isActive !== false
            ? 'Mục này sẽ xuất hiện trên menu khách hàng. Bỏ chọn để tạm ẩn mà không xóa dữ liệu.'
            : 'Mục này đang bị ẩn khỏi website. Mọi liên kết và mục con vẫn được giữ nguyên.'}
        </p>
      </div>
    </div>
  );
}
