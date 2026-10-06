import { Check, Pencil, Trash2, Eye, EyeOff } from '@/components/ui/Icons';
import { VisibleBadge, TypeBadge, ScheduleBadge, AnalyticsChip } from './BannerBadges';
import { Button } from '@/components/ui/button';

function BannerCard({ banner, selected, onToggle, onEdit, onDelete, onToggleVisible }) {
  return (
    <div
      className={`rounded-[6px] border border-border bg-card text-card-foreground overflow-hidden transition-all hover:border-foreground/30 shadow-2xs ${
        selected ? 'border-primary ring-1 ring-primary/40' : ''
      }`}
    >
      <div
        className="relative aspect-video w-full bg-muted cursor-pointer overflow-hidden border-b border-border"
        onClick={() => onToggle(banner._id)}
      >
        <img
          src={banner.imageUrl}
          alt={banner.altText || banner.title || 'banner'}
          className="size-full object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/320x180?text=Banner';
          }}
        />
        {selected && (
          <div className="absolute top-2 right-2 size-5 rounded-[4px] bg-primary text-primary-foreground flex items-center justify-center shadow-xs z-10">
            <Check className="size-3" />
          </div>
        )}
        {!banner.isVisible && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
            <EyeOff className="size-4" /> Đang ẩn
          </div>
        )}
        {(banner.startAt || banner.endAt) && (
          <div className="absolute top-2 left-2">
            <ScheduleBadge startAt={banner.startAt} endAt={banner.endAt} />
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-xs text-foreground line-clamp-1 flex-1">
            {banner.title || <span className="text-muted-foreground italic">Chưa đặt tiêu đề</span>}
          </span>
          <TypeBadge type={banner.type} />
        </div>

        <div className="flex items-center justify-between">
          <VisibleBadge isVisible={banner.isVisible} />
          <AnalyticsChip views={banner.viewCount} clicks={banner.clickCount} />
        </div>

        <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            title="Sửa banner"
            className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleVisible}
            title={banner.isVisible ? 'Ẩn banner' : 'Hiện banner'}
            className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
          >
            {banner.isVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            title="Xóa banner"
            className="size-7 rounded-[4px] text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BannerGrid({
  banners = [],
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onToggleVisible,
}) {
  if (!banners.length) {
    return (
      <div className="rounded-[6px] border border-border bg-card p-12 text-center text-xs text-muted-foreground font-mono shadow-2xs">
        Không tìm thấy banner nào trong mục này
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {banners.map((banner) => (
        <BannerCard
          key={banner._id}
          banner={banner}
          selected={selectedIds.has(banner._id)}
          onToggle={onToggleSelect}
          onEdit={() => onEdit(banner)}
          onDelete={() => onDelete(banner)}
          onToggleVisible={() => onToggleVisible(banner)}
        />
      ))}
    </div>
  );
}
