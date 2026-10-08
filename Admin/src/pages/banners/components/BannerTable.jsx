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
  Check,
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
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import { VisibleBadge, ScheduleBadge, AnalyticsChip } from './BannerBadges';
import { Button } from '@/components/ui/button';

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
      {/* Drag Handle & Checkbox */}
      <TableCell className="w-12 px-2 text-center" onPointerDown={stopDrag}>
        <div className="flex items-center gap-1.5 justify-center">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5">
            <GripVertical className="size-4" />
          </div>
          <button
            type="button"
            className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background transition-colors cursor-pointer ${
              selected ? 'bg-primary border-primary text-primary-foreground' : ''
            }`}
            onClick={() => onToggle(banner._id)}
          >
            {selected && <Check className="size-3" />}
          </button>
        </div>
      </TableCell>

      {/* Image Thumbnail */}
      <TableCell className="w-24 px-3 py-2">
        <div className="relative inline-block">
          <MediaThumbnailHover media={banner._mediaObj}>
            <img
              src={banner.imageUrl}
              alt={banner.title || 'banner'}
              className="h-12 w-20 object-cover rounded-[4px] border border-border bg-muted shrink-0"
              onError={(e) => {
                e.target.src = 'https://placehold.co/160x90?text=Banner';
              }}
            />
          </MediaThumbnailHover>
        </div>
      </TableCell>

      {/* Title */}
      <TableCell className="px-3 py-2 font-medium">
        <span className="text-xs font-semibold text-foreground line-clamp-2">
          {banner.title || <span className="text-muted-foreground italic">Chưa đặt tiêu đề</span>}
        </span>
      </TableCell>

      {/* Link */}
      <TableCell className="px-3 py-2" onPointerDown={stopDrag}>
        {banner.link ? (
          (() => {
            const FRONTEND = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';
            const href = banner.link.startsWith('http') ? banner.link : `${FRONTEND}${banner.link}`;
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-xs font-mono"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="size-3" />
                <span>{banner.link.length > 32 ? banner.link.slice(0, 32) + '…' : banner.link}</span>
              </a>
            );
          })()
        ) : (
          <span className="text-muted-foreground italic text-xs font-mono">—</span>
        )}
      </TableCell>

      {/* Visibility Status */}
      <TableCell className="px-3 py-2">
        <VisibleBadge isVisible={banner.isVisible} />
      </TableCell>

      {/* Schedule */}
      <TableCell className="px-3 py-2">
        <ScheduleBadge startAt={banner.startAt} endAt={banner.endAt} />
      </TableCell>

      {/* Analytics */}
      <TableCell className="px-3 py-2">
        <AnalyticsChip views={banner.viewCount} clicks={banner.clickCount} />
      </TableCell>

      {/* Position */}
      <TableCell className="px-3 py-2 text-center">
        <span className="inline-flex items-center justify-center min-w-6 h-5 px-1.5 bg-secondary border border-border rounded-[4px] text-xs font-mono font-bold text-foreground">
          {displayPosition}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="px-3 py-2 text-right" onPointerDown={stopDrag}>
        <div className="flex items-center justify-end gap-1">
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
      </TableCell>
    </TableRow>
  );
}

export default function BannerTable({
  banners = [],
  selectedIds,
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
              <button
                type="button"
                className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background mx-auto transition-colors cursor-pointer ${
                  isAllSelected ? 'bg-primary border-primary text-primary-foreground' : ''
                }`}
                onClick={onToggleAll}
              >
                {isAllSelected && <Check className="size-3" />}
              </button>
            </TableHead>
            <TableHead className="w-24">Hình ảnh</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Liên kết</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Lịch hiển thị</TableHead>
            <TableHead>Thống kê</TableHead>
            <TableHead className="text-center w-16">Vị trí</TableHead>
            <TableHead className="text-right w-28">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.length > 0 ? (
            <SortableContext items={banners.map((b) => b._id)} strategy={verticalListSortingStrategy}>
              {banners.map((b, i) => (
                <SortableBannerRow
                  key={b._id}
                  banner={b}
                  index={i}
                  selected={selectedIds.has(b._id)}
                  onToggle={onToggleSelect}
                  onEdit={() => onEdit(b)}
                  onDelete={() => onDelete(b)}
                  onToggleVisible={() => onToggleVisible(b)}
                  highlightId={highlightId}
                />
              ))}
            </SortableContext>
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-xs text-muted-foreground font-mono">
                Không tìm thấy banner nào trong mục này
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
