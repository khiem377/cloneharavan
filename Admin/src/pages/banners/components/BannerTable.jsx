import React from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
} from '@/components/ui/Icons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import { VisibleBadge, ScheduleBadge, AnalyticsChip } from './BannerBadges';

function SortableBannerRow({
  banner,
  index,
  selected,
  onToggle,
  onEdit,
  onDelete,
  onToggleVisible,
  highlightId,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: banner._id });

  const isHighlighted = banner._id === highlightId;

  const setRef = (el) => {
    setNodeRef(el);
    if (el && isHighlighted) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const stopDrag = (e) => e.stopPropagation();
  const displayPosition = banner.position > 0 ? banner.position : index + 1;

  return (
    <TableRow
      ref={setRef}
      style={style}
      className={`transition-colors hover:bg-muted/40 ${
        selected || isHighlighted ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''
      } ${!banner.isVisible ? 'opacity-70' : ''}`}
    >
      <TableCell className="w-12 px-2 text-center" onPointerDown={stopDrag}>
        <div className="flex items-center gap-1.5 justify-center">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5">
            <GripVertical className="size-4" />
          </div>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggle(banner._id)}
            aria-label={`Chọn banner ${banner.title}`}
          />
        </div>
      </TableCell>

      <TableCell className="w-24 px-3 py-2">
        <div className="relative inline-block">
          <MediaThumbnailHover media={banner._mediaObj}>
            <img
              src={banner.imageUrl}
              alt={banner.title || 'banner'}
              className="h-10 w-20 rounded-[4px] object-cover border border-border bg-muted shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </MediaThumbnailHover>
        </div>
      </TableCell>

      <TableCell className="px-3 py-2">
        <div className="flex flex-col min-w-0 max-w-xs">
          <span className="font-semibold text-xs text-foreground truncate hover:text-primary transition-colors cursor-pointer" onClick={onEdit}>
            {banner.title || <span className="text-muted-foreground italic">Không có tiêu đề</span>}
          </span>
          {banner.subtitle && (
            <span className="text-[11px] text-muted-foreground truncate">{banner.subtitle}</span>
          )}
        </div>
      </TableCell>

      <TableCell className="px-3 py-2">
        {banner.linkUrl ? (
          <a
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono truncate max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate">{banner.linkUrl}</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground font-mono">—</span>
        )}
      </TableCell>

      <TableCell className="px-3 py-2">
        <div className="flex flex-col gap-1">
          <VisibleBadge isVisible={banner.isVisible} />
          <ScheduleBadge startDate={banner.startDate} endDate={banner.endDate} />
        </div>
      </TableCell>

      <TableCell className="px-3 py-2">
        <AnalyticsChip views={banner.viewCount} clicks={banner.clickCount} />
      </TableCell>

      <TableCell className="px-3 py-2 text-center">
        <span className="inline-flex items-center justify-center min-w-6 h-5 px-1.5 bg-secondary border border-border rounded-[4px] text-xs font-mono font-bold text-foreground">
          {displayPosition}
        </span>
      </TableCell>

      <TableCell className="px-3 py-2 text-right" onPointerDown={stopDrag}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            title="Sửa banner"
            className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleVisible}
            title={banner.isVisible ? 'Ẩn banner' : 'Hiện banner'}
            className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
          >
            {banner.isVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            title="Xóa banner"
            className="size-7 rounded-[4px] text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function BannerTable({
  banners = [],
  selectedIds,
  loading = false,
  onToggleSelect,
  onToggleAll,
  onEdit,
  onDelete,
  onToggleVisible,
  highlightId,
}) {
  const isAllSelected = banners.length > 0 && selectedIds.size === banners.length;

  return (
    <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40 hover:bg-secondary/40">
            <TableHead className="w-12 text-center">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onToggleAll}
                  aria-label="Chọn tất cả banner"
                />
              </div>
            </TableHead>
            <TableHead className="w-24">Hình ảnh</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Liên kết</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thống kê</TableHead>
            <TableHead className="text-center w-20">Thứ tự</TableHead>
            <TableHead className="text-right w-28">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`b-skel-${i}`}>
                <TableCell className="w-12 text-center"><Skeleton className="size-4 mx-auto" /></TableCell>
                <TableCell className="w-24"><Skeleton className="h-10 w-20 rounded-[4px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-7 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : banners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground font-mono">
                Chưa có banner nào
              </TableCell>
            </TableRow>
          ) : (
            <SortableContext items={banners.map((b) => b._id)} strategy={verticalListSortingStrategy}>
              {banners.map((banner, index) => (
                <SortableBannerRow
                  key={banner._id}
                  banner={banner}
                  index={index}
                  selected={selectedIds.has(banner._id)}
                  onToggle={onToggleSelect}
                  onEdit={() => onEdit(banner)}
                  onDelete={() => onDelete(banner)}
                  onToggleVisible={() => onToggleVisible(banner)}
                  highlightId={highlightId}
                />
              ))}
            </SortableContext>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
