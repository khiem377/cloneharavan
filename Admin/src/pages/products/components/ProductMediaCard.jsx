import React from 'react';
import { Image, Plus } from '@/components/ui/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import SortableGalleryItem from '@/components/products/SortableGalleryItem';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

/**
 * Product Thumbnail & Gallery Media Uploader Card with Sortable DnD
 */
export default function ProductMediaCard({
  form,
  setForm,
  mediaMap = {},
  setPickerMode,
  removeGalleryImage,
  handleDragEndGallery,
}) {
  const gallerySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-semibold text-foreground">Ảnh sản phẩm</CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Main Thumbnail */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Ảnh đại diện <span className="text-destructive ml-0.5">*</span>
          </label>
          {(() => {
            const thumbSrc =
              typeof form.thumbnailUrl === 'string'
                ? form.thumbnailUrl
                : form.thumbnailUrl?.url || '';

            if (thumbSrc) {
              return (
                <div className="relative aspect-square w-full rounded-[6px] border border-border overflow-hidden bg-muted group">
                  <MediaThumbnailHover media={mediaMap[form.thumbnailMediaId]} className="size-full">
                    <img
                      src={thumbSrc}
                      alt="thumbnail"
                      className="size-full object-cover"
                    />
                  </MediaThumbnailHover>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs rounded-[4px] cursor-pointer"
                      onClick={() => setPickerMode('thumbnail')}
                    >
                      Thay đổi
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs rounded-[4px] cursor-pointer"
                      onClick={() =>
                        setForm((f) => ({ ...f, thumbnailMediaId: '', thumbnailUrl: '' }))
                      }
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-[6px] border-2 border-dashed border-border bg-muted/20 hover:border-primary/50 transition-colors cursor-pointer text-center"
                onClick={() => setPickerMode('thumbnail')}
              >
                <Image size={24} className="text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">Chọn ảnh đại diện</span>
              </div>
            );
          })()}
        </div>

        {/* Gallery Image List */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Bộ ảnh sản phẩm</label>
            {form.imageUrls.length > 1 && (
              <span className="text-[11px] text-muted-foreground">Kéo thả để sắp xếp</span>
            )}
          </div>

          <DndContext
            sensors={gallerySensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEndGallery}
          >
            <SortableContext
              items={form.imageUrls.map((u, i) => form.imageMediaIds[i] || (typeof u === 'string' ? u : `img-${i}`))}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 gap-2">
                {form.imageUrls.map((rawUrl, idx) => {
                  const url = typeof rawUrl === 'string' ? rawUrl : rawUrl?.url || '';
                  const itemId = form.imageMediaIds[idx] || (url ? `img-${url}-${idx}` : `img-${idx}`);
                  return (
                    <SortableGalleryItem
                      key={itemId}
                      id={itemId}
                      url={url}
                      idx={idx}
                      onRemove={removeGalleryImage}
                      media={mediaMap[form.imageMediaIds[idx]] || null}
                    />
                  );
                })}
                <div
                  className="aspect-square rounded-[6px] border-2 border-dashed border-border bg-muted/20 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground active:scale-[0.98]"
                  onClick={() => setPickerMode('images')}
                >
                  <Plus size={18} />
                  <span className="text-[10px] font-medium">Thêm ảnh</span>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </CardContent>
    </Card>
  );
}
