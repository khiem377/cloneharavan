import React from 'react';
import { Image } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';

export default function FlashSaleBasicFields({
  name,
  setName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  description,
  setDescription,
  banner,
  onOpenMediaPicker,
  isActive,
  setIsActive,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5 md:col-span-2">
        <label className="text-xs font-medium text-foreground">
          Tên chương trình <span className="text-destructive">*</span>
        </label>
        <Input
          className="h-9 rounded-[6px]"
          placeholder="VD: Flash Sale Giờ Vàng 12h - 14h..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">
          Thời gian bắt đầu <span className="text-destructive">*</span>
        </label>
        <DateTimePicker
          value={startDate}
          onChange={(val) => setStartDate(val)}
          placeholder="Chọn thời gian bắt đầu..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">
          Thời gian kết thúc <span className="text-destructive">*</span>
        </label>
        <DateTimePicker
          value={endDate}
          onChange={(val) => setEndDate(val)}
          placeholder="Chọn thời gian kết thúc..."
          align="right"
        />
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <label className="text-xs font-medium text-foreground">Mô tả chương trình</label>
        <textarea
          rows={2}
          className="w-full px-3 py-2 rounded-[6px] border border-input bg-background text-xs outline-none focus:border-ring resize-none placeholder:text-muted-foreground"
          placeholder="Mô tả chi tiết ưu đãi Flash Sale..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <label className="text-xs font-medium text-foreground">Banner chương trình</label>
        {banner?.url ? (
          <div className="relative w-full aspect-[21/9] sm:aspect-[1920/650] max-h-64 rounded-[6px] border border-border overflow-hidden group bg-zinc-950 flex items-center justify-center">
            <MediaThumbnailHover media={banner}>
              <img src={banner.url} alt="banner" className="size-full object-contain sm:object-cover" />
            </MediaThumbnailHover>
            <Button
              type="button"
              size="sm"
              onClick={onOpenMediaPicker}
              className="absolute bottom-2 right-2 h-7 px-2.5 bg-black/75 text-white text-xs font-medium rounded-[6px] hover:bg-black"
            >
              Đổi banner
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenMediaPicker}
            className="w-full h-20 border-dashed border-border hover:border-primary/50 rounded-[6px] flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Image className="size-5" />
            <span className="text-xs font-normal">Chọn ảnh banner từ thư viện media</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 md:col-span-2 pt-1">
        <Checkbox
          id="isActiveToggle"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked)}
        />
        <label htmlFor="isActiveToggle" className="text-xs font-medium text-foreground cursor-pointer select-none">
          Kích hoạt chương trình Flash Sale này
        </label>
      </div>
    </div>
  );
}
