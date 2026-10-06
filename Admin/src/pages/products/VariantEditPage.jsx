import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Image, Check, Save, Plus } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import { useProduct } from '@/hooks/useProducts';
import { useVariant, useUpdateVariant } from '@/hooks/useProductVariants';
import RichTextEditor from '@/components/ui/RichTextEditor';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import SearchableSelect from '@/components/ui/SearchableSelect';
import PriceInput, { formatVND } from '@/components/ui/PriceInput';
import SpecsEditor from '@/components/products/SpecsEditor';
import SortableGalleryItem from '@/components/products/SortableGalleryItem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
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
  arrayMove,
} from '@dnd-kit/sortable';

const UNIT_OPTIONS = [
  'Cái', 'Chiếc', 'Hộp', 'Thùng', 'Lốc', 'Lon', 'Bộ', 'Gói', 'Chai', 'Mét', 'Kg', 'Cuộn', 'Bao', 'Tấm', 'Cặp'
];

function fmtVND(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Number(n).toLocaleString('vi-VN');
}

function ImageGrid({ urls = [], ids = [], onAdd, onRemove, onReorder }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const getTileId = (i) => ids[i] || `v-img-${i}`;
      const oldIdx = urls.findIndex((_, i) => getTileId(i) === active.id);
      const newIdx = urls.findIndex((_, i) => getTileId(i) === over.id);

      if (oldIdx !== -1 && newIdx !== -1 && onReorder) {
        onReorder(arrayMove(ids, oldIdx, newIdx), arrayMove(urls, oldIdx, newIdx));
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={urls.map((_, i) => ids[i] || `v-img-${i}`)} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-2">
          {urls.map((url, i) => {
            const tileId = ids[i] || `v-img-${i}`;
            return <SortableGalleryItem key={tileId} id={tileId} url={url} idx={i} onRemove={onRemove} size="sm" />;
          })}
          <button
            type="button"
            onClick={onAdd}
            className="size-20 rounded-[6px] border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary active:scale-[0.98]"
          >
            <Plus size={16} />
            <span className="text-[10px] font-medium">Thêm ảnh</span>
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
}

/* ─── VariantEditPage ─── */
export default function VariantEditPage() {
  const navigate = useNavigate();
  const { id: productId, variantId } = useParams();

  const { data: product, isLoading: loadingProduct } = useProduct(productId);
  const { data: variant, isLoading: loadingVariant } = useVariant(variantId);
  const updateMut = useUpdateVariant(productId);

  const [pickerMode, setPickerMode] = useState(null);
  const [overrideSpecs, setOverrideSpecs] = useState(false);
  const [saving, setSaving] = useState(false);

  // Derive base form from server data — synchronous via useMemo, no useEffect delay
  const baseForm = useMemo(() => {
    if (!variant) return null;
    return {
      sku: variant.sku || '',
      unit: variant.unit || 'Cái',
      price: variant.price ?? null,
      salePrice: variant.salePrice ?? null,
      stock: variant.stock ?? 0,
      isActive: variant.isActive ?? true,
      nameOverride: variant.nameOverride || '',
      descriptionOverride: variant.descriptionOverride || '',
      specifications: variant.specifications || [],
      thumbnailMediaId: variant.thumbnail?.mediaId || null,
      thumbnailUrl: variant.thumbnail?.url || '',
      imageMediaIds: (variant.images || []).map((img) => img.mediaId).filter(Boolean),
      imageUrls: (variant.images || []).map((img) => img.url).filter(Boolean),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant?._id]);

  // User edits overlay
  const [userEdits, setUserEdits] = useState({});
  const lastVariantId = useRef(null);
  useEffect(() => {
    if (variant?._id && variant._id !== lastVariantId.current) {
      lastVariantId.current = variant._id;
      setUserEdits({});
      setOverrideSpecs((variant.specifications || []).length > 0);
    }
  }, [variant?._id]);

  const form = baseForm ? { ...baseForm, ...userEdits } : null;
  const set = (patch) => setUserEdits((prev) => ({ ...prev, ...patch }));

  const handleMediaSelected = (media) => {
    if (pickerMode === 'thumbnail') {
      const m = Array.isArray(media) ? media[0] : media;
      if (m) set({ thumbnailMediaId: m._id, thumbnailUrl: m.url });
    } else {
      const list = Array.isArray(media) ? media : [media];
      const ids = [...(form.imageMediaIds || [])], urls = [...(form.imageUrls || [])];
      list.forEach((m) => { if (!ids.includes(m._id)) { ids.push(m._id); urls.push(m.url); } });
      set({ imageMediaIds: ids, imageUrls: urls });
    }
    setPickerMode(null);
  };

  const removeGalleryImage = (idx) => {
    set({
      imageMediaIds: (form.imageMediaIds || []).filter((_, i) => i !== idx),
      imageUrls: (form.imageUrls || []).filter((_, i) => i !== idx),
    });
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await updateMut.mutateAsync({
        id: variantId,
        data: {
          sku: form.sku,
          price: form.price,
          salePrice: form.salePrice,
          stock: form.stock,
          isActive: form.isActive,
          nameOverride: form.nameOverride || null,
          descriptionOverride: form.descriptionOverride || null,
          specifications: overrideSpecs ? form.specifications : [],
          thumbnailMediaId: form.thumbnailMediaId || null,
          imageMediaIds: form.imageMediaIds || [],
        },
      });
      toast.success('Đã lưu biến thể thành công');
      navigate(`/products/${productId}/variants`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi lưu biến thể');
    } finally {
      setSaving(false);
    }
  };

  // ── Guard: no variantId
  if (!variantId) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-2 text-muted-foreground text-xs">
        <span>Không tìm thấy ID biến thể</span>
        <Button variant="link" size="sm" className="text-xs" onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  if (loadingVariant && !variant) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-muted-foreground text-xs">
        <Loader2 size={20} className="animate-spin text-primary" />
        <span>Đang tải biến thể...</span>
      </div>
    );
  }

  if (!loadingVariant && !variant) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground text-xs">
        <span>Không tải được biến thể. Hãy kiểm tra lại đường dẫn.</span>
        <Button variant="link" size="sm" className="text-xs" onClick={() => navigate(`/products/${productId}/variants`)}>Quay về danh sách biến thể</Button>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-muted-foreground">
        <Loader2 size={20} className="animate-spin text-primary" />
      </div>
    );
  }

  const displayName = (variant?.attributes || []).map((a) => a.value).join(' / ') || variant?.sku || 'Biến thể';

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto p-6">
      <div className="sticky -top-3 sm:-top-6 z-30 -mt-3 sm:-mt-6 -mx-3 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/95 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/products/${productId}/variants`)}
            className="h-8 w-8 rounded-[6px] border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <ArrowLeft size={15} />
          </Button>
          <div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              {loadingProduct
                ? <span className="inline-block w-24 h-3 rounded bg-muted animate-pulse" />
                : product?.name}
              {' '}&rsaquo;{' '}Biến thể
            </p>
            <h1 className="text-base font-bold text-foreground">{displayName}</h1>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="h-8 rounded-[6px] bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin mr-1.5" /> : <Save size={13} className="mr-1.5" />}
          Lưu biến thể
        </Button>
      </div>

      {/* ── Body: 2-col like ProductFormPage ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Inherited from parent */}
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold text-foreground">Kế thừa từ sản phẩm cha</CardTitle>
              <Badge variant="outline" className="text-[10px] rounded-[4px] bg-muted/50 text-muted-foreground">
                Chỉ xem
              </Badge>
              {loadingProduct && <Loader2 size={11} className="animate-spin text-muted-foreground ml-1" />}
            </CardHeader>
            <CardContent className="pt-3">
              {loadingProduct ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-20 h-3 rounded bg-muted animate-pulse shrink-0" />
                      <div className="h-3 rounded bg-muted animate-pulse flex-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">Tên SP</span>
                    <span className="text-foreground font-medium">{product?.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">Thương hiệu</span>
                    <span className="text-foreground font-medium">{product?.brand?.name || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">Danh mục</span>
                    <span className="text-foreground">{(product?.categories || []).map((c) => c.name).join(', ') || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">Giá gốc</span>
                    <span className="text-foreground font-medium font-mono tabular-nums">{fmtVND(product?.price)}₫</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variant identity */}
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs font-semibold text-foreground">Thông tin biến thể</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Attribute chips */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Thuộc tính</label>
                <div className="flex flex-wrap gap-2">
                  {(variant?.attributes || []).map((attr, i) => (
                    <div key={i} className="inline-flex items-center gap-1.5 rounded-[6px] bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs">
                      <span className="text-muted-foreground">{attr.name}:</span>
                      <span className="font-semibold text-primary">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Name override */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Tên riêng <span className="font-normal">(để trống = dùng tên SP cha)</span>
                </label>
                <Input
                  className="h-8 rounded-[6px] text-xs"
                  placeholder={product?.name || 'Kế thừa tên sản phẩm cha'}
                  value={form.nameOverride}
                  onChange={(e) => set({ nameOverride: e.target.value })}
                />
              </div>

              {/* SKU & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Mã SKU <span className="text-destructive">*</span></label>
                  <Input
                    className="h-8 rounded-[6px] text-xs font-mono uppercase"
                    value={form.sku}
                    onChange={(e) => set({ sku: e.target.value.toUpperCase() })}
                    placeholder="VD: SP001-DO-256GB"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Đơn vị tính (ĐVT)</label>
                  <SearchableSelect
                    options={UNIT_OPTIONS}
                    value={form.unit || 'Cái'}
                    onChange={(v) => set({ unit: v })}
                    creatable={true}
                    placeholder="Chọn hoặc gõ ĐVT..."
                  />
                </div>
              </div>

              {/* Price + Sale */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Giá niêm yết <span className="font-normal">(để trống = kế thừa)</span>
                  </label>
                  <PriceInput
                    value={form.price}
                    onChange={(v) => set({ price: v })}
                    placeholder={product?.price ? `${fmtVND(product.price)} (kế thừa)` : '0'}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Giá khuyến mãi <span className="font-normal">(để trống = kế thừa)</span>
                  </label>
                  <PriceInput
                    value={form.salePrice}
                    onChange={(v) => set({ salePrice: v })}
                    placeholder={product?.salePrice ? `${fmtVND(product.salePrice)} (kế thừa)` : '0'}
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tồn kho</label>
                <Input
                  type="number"
                  min="0"
                  className="h-8 rounded-[6px] text-xs font-mono tabular-nums"
                  value={form.stock}
                  onChange={(e) => set({ stock: Math.max(0, Number(e.target.value)) })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Description override */}
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold text-foreground">Mô tả riêng</CardTitle>
              <span className="text-[11px] text-muted-foreground">Để trống = kế thừa từ sản phẩm cha</span>
            </CardHeader>
            <CardContent className="pt-4">
              <RichTextEditor
                value={form.descriptionOverride}
                onChange={(v) => set({ descriptionOverride: v })}
              />
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold text-foreground">Thông số kỹ thuật</CardTitle>
              <Button
                type="button"
                variant={overrideSpecs ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs rounded-[6px]"
                onClick={() => {
                  if (!overrideSpecs && form.specifications.length === 0 && product?.specifications?.length > 0) {
                    set({ specifications: product.specifications.map((s) => ({ ...s })) });
                  }
                  setOverrideSpecs((v) => !v);
                }}
              >
                {overrideSpecs ? <Check size={12} className="mr-1" /> : null}
                {overrideSpecs ? 'Đang dùng riêng' : 'Override thông số'}
              </Button>
            </CardHeader>

            <CardContent className="pt-4">
              {overrideSpecs ? (
                <SpecsEditor specs={form.specifications} onChange={(specs) => set({ specifications: specs })} />
              ) : (
                <>
                  <p className="text-xs text-muted-foreground italic mb-2">Đang kế thừa thông số từ sản phẩm cha.</p>
                  {product?.specifications?.length > 0 && (
                    <div className="rounded-[6px] border border-border overflow-hidden opacity-60 pointer-events-none">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead className="py-2 text-xs w-28">Nhóm</TableHead>
                            <TableHead className="py-2 text-xs">Tên</TableHead>
                            <TableHead className="py-2 text-xs">Giá trị</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.specifications.map((s, i) => (
                            <TableRow key={i}>
                              <TableCell className="py-1.5 text-xs text-muted-foreground">{s.group}</TableCell>
                              <TableCell className="py-1.5 text-xs text-foreground/70">{s.key}</TableCell>
                              <TableCell className="py-1.5 text-xs text-foreground/70">{s.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: 1 col */}
        <div className="flex flex-col gap-5">

          {/* Trạng thái */}
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs font-semibold text-foreground">Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <Button
                type="button"
                variant="outline"
                className={`h-8 w-full rounded-[6px] text-xs font-medium flex items-center justify-center gap-2 ${
                  form.isActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20'
                    : 'bg-muted text-muted-foreground'
                }`}
                onClick={() => set({ isActive: !form.isActive })}
              >
                <span className={`size-2 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                {form.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
              </Button>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs font-semibold text-foreground">Ảnh đại diện</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {form.thumbnailUrl ? (
                <div className="relative group w-full aspect-square rounded-[6px] overflow-hidden border border-border bg-muted">
                  <img src={form.thumbnailUrl} alt="thumb" className="size-full object-cover" />
                  <div
                    className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setPickerMode('thumbnail')}
                  >
                    <Image size={16} className="text-white" />
                    <span className="text-white text-xs font-semibold">Thay ảnh</span>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full aspect-square rounded-[6px] border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                  onClick={() => setPickerMode('thumbnail')}
                >
                  <Image size={24} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Chọn ảnh đại diện</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs font-semibold text-foreground">Bộ ảnh biến thể</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ImageGrid
                urls={form.imageUrls}
                ids={form.imageMediaIds}
                onAdd={() => setPickerMode('images')}
                onRemove={removeGalleryImage}
                onReorder={(newIds, newUrls) => set({ imageMediaIds: newIds, imageUrls: newUrls })}
              />
            </CardContent>
          </Card>

          {/* Save footer */}
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-9 rounded-[6px] bg-primary text-primary-foreground text-xs font-semibold active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Lưu biến thể
          </Button>
        </div>
      </div>

      {/* Media picker */}
      {pickerMode && (
        <MediaPickerModal
          isMultiple={pickerMode === 'images'}
          onSelect={handleMediaSelected}
          onClose={() => setPickerMode(null)}
        />
      )}
    </div>
  );
}
