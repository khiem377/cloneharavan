import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';

/**
 * SortableGalleryItem — draggable image thumbnail trong gallery.
 * Dùng ở ProductFormPage. VariantEditPage có variant riêng (SortableImageTile)
 * với sizing khác — 2 component này keep separate vì layout khác nhau.
 *
 * Props:
 *   id       — unique id (mediaId hoặc fallback string)
 *   url      — image src
 *   idx      — index trong array (dùng cho onRemove)
 *   onRemove — (idx: number) => void
 *   size     — 'md' (default, aspect-square) | 'sm' (size-20)
 */
export default function SortableGalleryItem({ id, url, idx, onRemove, size = 'md', media = null }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  };

  if (size === 'sm') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative size-20 rounded-lg overflow-hidden border border-border group bg-muted select-none cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/40 transition-all"
      >
        <MediaThumbnailHover media={media} className="size-full">
          <img src={url} alt="" className="size-full object-cover pointer-events-none" />
        </MediaThumbnailHover>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
            className="size-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center text-xs hover:scale-105 cursor-pointer font-bold shadow-xs"
            title="Xoa anh"
          >
            x
          </button>
        </div>
      </div>
    );
  }

  // size === 'md'
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative aspect-square rounded-md border border-border overflow-hidden bg-muted group select-none hover:ring-2 hover:ring-primary/40 transition-all cursor-grab active:cursor-grabbing"
    >
      <MediaThumbnailHover media={media} className="size-full">
        <img src={url} alt={`gallery-${idx}`} className="size-full object-cover pointer-events-none" />
      </MediaThumbnailHover>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
        className="absolute top-1 right-1 size-6 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs cursor-pointer shadow-xs z-10 font-bold"
        title="Xoa anh"
      >
        x
      </button>
    </div>
  );
}
