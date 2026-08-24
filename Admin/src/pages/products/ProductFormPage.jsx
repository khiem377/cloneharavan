import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, Image, ChevronDown, Layers } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import { useProduct, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useBrands, useAllBrands } from '@/hooks/useBrands';
import RichTextEditor from '@/components/ui/RichTextEditor';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
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
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableGalleryItem({ id, url, idx, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative aspect-square rounded-md border border-border overflow-hidden bg-muted group select-none hover:ring-2 hover:ring-primary/40 transition-all cursor-grab active:cursor-grabbing"
    >
      <img src={url} alt={`gallery-${idx}`} className="size-full object-cover pointer-events-none" />
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(idx);
        }}
        className="absolute top-1 right-1 size-6 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs cursor-pointer shadow-xs z-10 font-bold"
        title="Xóa ảnh"
      >
        ×
      </button>
      <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[9px] font-medium text-white">Kéo để đổi vị trí</span>
      </div>
    </div>
  );
}

const DEFAULT_FORM = {
  name: '',
  sku: '',
  categories: [],
  brand: '',
  price: '',
  salePrice: '',
  stock: 0,
  description: '',
  status: 'published',
  isActive: true,
  isFeatured: false,
  isHot: false,
  specifications: [],
  options: [],
  thumbnailMediaId: '',
  thumbnailUrl: '',
  imageMediaIds: [],
  imageUrls: [],
};

function formatVND(val) {
  if (!val || isNaN(val)) return '0';
  return Number(val).toLocaleString('vi-VN');
}

function parseVND(str) {
  if (!str) return 0;
  return Number(String(str).replace(/\D/g, '')) || 0;
}

function PriceInput({ value, onChange, placeholder = '0', className = '' }) {
  const [display, setDisplay] = useState(() => (value ? formatVND(value) : ''));

  useEffect(() => {
    setDisplay(value ? formatVND(value) : '');
  }, [value]);

  const handleChange = (e) => {
    const raw = parseVND(e.target.value);
    setDisplay(raw ? formatVND(raw) : '');
    onChange(raw);
  };

  return (
    <input
      type="text"
      className={`h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors ${className}`}
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}

function buildTree(flat) {
  const map = Object.fromEntries((flat || []).map((c) => [c._id, { ...c, children: [] }]));
  const roots = [];
  (flat || []).forEach((c) => {
    const pid = c.parentId?._id || c.parentId;
    if (pid && map[pid]) map[pid].children.push(map[c._id]);
    else roots.push(map[c._id]);
  });
  return roots;
}

function CategoryTreeMultiPicker({ categories, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const ref = useRef(null);

  const tree = buildTree(categories);

  const parentMap = Object.fromEntries(
    (categories || []).map((c) => [c._id, c.parentId?._id || c.parentId || null])
  );
  const childrenMap = (() => {
    const m = {};
    (categories || []).forEach((c) => {
      const pid = c.parentId?._id || c.parentId;
      if (pid) { if (!m[pid]) m[pid] = []; m[pid].push(c._id); }
    });
    return m;
  })();

  const getAncestors = (id) => {
    const result = [];
    let cur = parentMap[id];
    while (cur) { result.push(cur); cur = parentMap[cur]; }
    return result;
  };

  const getDescendants = (id) => {
    const kids = childrenMap[id] || [];
    return [...kids, ...kids.flatMap((kid) => getDescendants(kid))];
  };

  useEffect(() => {
    if (!value?.length || !categories?.length) return;
    const toExpand = {};
    value.forEach((id) => { getAncestors(id).forEach((aid) => { toExpand[aid] = true; }); });
    setExpanded((prev) => ({ ...prev, ...toExpand }));
  }, [value?.join(','), categories?.length]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  const toggleCheck = (id) => {
    const isChecked = value.includes(id);
    if (isChecked) {
      const desc = getDescendants(id);
      onChange(value.filter((v) => v !== id && !desc.includes(v)));
    } else {
      const ancestors = getAncestors(id);
      onChange([...new Set([...value, id, ...ancestors])]);
    }
  };

  const removeCat = (id, e) => {
    e.stopPropagation();
    const desc = getDescendants(id);
    onChange(value.filter((v) => v !== id && !desc.includes(v)));
  };

  const selectedCats = value.map((id) => categories.find((c) => c._id === id)).filter(Boolean);

  const renderNode = (node, depth = 0) => {
    const hasChildren = node.children?.length > 0;
    const isChecked = value.includes(node._id);
    const isExpanded = expanded[node._id];
    return (
      <div key={node._id}>
        <div
          style={{ paddingLeft: `${depth * 16 + 6}px` }}
          className={`flex items-center gap-2 py-1.5 pr-2 rounded-md transition-colors ${isChecked ? 'bg-primary/5' : 'hover:bg-muted'}`}
        >
          <button
            type="button"
            className={`size-4 flex items-center justify-center shrink-0 text-muted-foreground transition-transform ${hasChildren ? 'hover:text-foreground cursor-pointer' : 'opacity-0 pointer-events-none'}`}
            onClick={(e) => toggleExpand(node._id, e)}
          >
            <ChevronDown size={12} className={isExpanded ? '' : '-rotate-90'} />
          </button>
          <label className="flex items-center gap-2 flex-1 cursor-pointer select-none min-w-0">
            <input
              type="checkbox"
              className="size-3.5 rounded border-input cursor-pointer accent-primary shrink-0"
              checked={isChecked}
              onChange={() => toggleCheck(node._id)}
            />
            <span className={`text-sm truncate ${isChecked ? 'font-medium text-primary' : 'text-foreground'}`}>
              {node.name}
            </span>
          </label>
        </div>
        {hasChildren && isExpanded && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="min-h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-left text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors cursor-pointer flex flex-wrap items-center gap-1.5"
        onClick={() => setOpen((v) => !v)}
      >
        {selectedCats.length === 0 ? (
          <span className="text-muted-foreground py-0.5">-- Chọn danh mục --</span>
        ) : (
          selectedCats.map((c) => (
            <span key={c._id} className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 text-xs font-medium">
              {c.name}
              <button type="button" className="hover:text-destructive cursor-pointer leading-none" onClick={(e) => removeCat(c._id, e)}>×</button>
            </span>
          ))
        )}
        <ChevronDown size={14} className={`ml-auto shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-background shadow-lg p-1">
          {tree.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Không có danh mục</p>
          ) : tree.map((node) => renderNode(node))}
        </div>
      )}
    </div>
  );
}




export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [discountMode, setDiscountMode] = useState('price');
  const [pickerMode, setPickerMode] = useState(null);

  const { data: productData, isLoading: productLoading } = useProduct(id);
  const { data: categories = [] } = useCategories({});
  const { data: brands = [] } = useAllBrands();

  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();

  useEffect(() => {
    const p = productData?.data || productData;
    if (isEdit && p && (p._id || p.name)) {
      setForm({
        name: p.name || '',
        sku: p.sku || '',
        categories: (p.categories || []).map((c) => c._id || c),
        brand: p.brand?._id || p.brand || '',
        price: p.price || 0,
        salePrice: p.salePrice || 0,
        stock: p.stock || 0,
        description: p.description || '',
        status: p.status || 'published',
        isActive: p.isActive ?? true,
        isFeatured: p.isFeatured ?? false,
        isHot: p.isHot ?? false,
        specifications: p.specifications || [],
        options: p.options || [],
        thumbnailMediaId: p.thumbnail?.mediaId || p.thumbnail?._id || '',
        thumbnailUrl: p.thumbnail?.url || '',
        imageMediaIds: p.images?.map((i) => i.mediaId || i._id) || [],
        imageUrls: p.images?.map((i) => i.url) || [],
      });
    }
  }, [isEdit, productData]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addSpecRow = () => {
    setForm((f) => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  };

  const removeSpecRow = (idx) => {
    setForm((f) => ({ ...f, specifications: f.specifications.filter((_, i) => i !== idx) }));
  };

  const updateSpecRow = (idx, key, value) => {
    setForm((f) => {
      const copy = [...f.specifications];
      copy[idx] = { key, value };
      return { ...f, specifications: copy };
    });
  };

  const handleMediaPick = (selected) => {
    if (pickerMode === 'thumbnail') {
      const media = Array.isArray(selected) ? selected[0] : selected;
      if (media) setForm((f) => ({ ...f, thumbnailMediaId: media._id, thumbnailUrl: media.url }));
    } else if (pickerMode === 'images') {
      const list = Array.isArray(selected) ? selected : [selected];
      const newIds = list.map((m) => m._id);
      const newUrls = list.map((m) => m.url);
      setForm((f) => ({
        ...f,
        imageMediaIds: [...f.imageMediaIds, ...newIds],
        imageUrls: [...f.imageUrls, ...newUrls],
      }));
    }
    setPickerMode(null);
  };

  const removeGalleryImage = (idx) => {
    setForm((f) => ({
      ...f,
      imageMediaIds: f.imageMediaIds.filter((_, i) => i !== idx),
      imageUrls: f.imageUrls.filter((_, i) => i !== idx),
    }));
  };

  const gallerySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEndGallery = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const getGalleryId = (idx) => form.imageMediaIds[idx] || `img-${idx}`;
      const oldIndex = form.imageUrls.findIndex((_, i) => getGalleryId(i) === active.id);
      const newIndex = form.imageUrls.findIndex((_, i) => getGalleryId(i) === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setForm((f) => ({
          ...f,
          imageMediaIds: arrayMove(f.imageMediaIds, oldIndex, newIndex),
          imageUrls: arrayMove(f.imageUrls, oldIndex, newIndex),
        }));
      }
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên sản phẩm');
    if (!form.sku.trim()) return toast.error('Vui lòng nhập mã SKU');
    if (!form.categories.length) return toast.error('Vui lòng chọn ít nhất 1 danh mục');
    if (!form.price) return toast.error('Vui lòng nhập giá niêm yết');

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      categories: form.categories,
      brand: form.brand || undefined,
      price: Number(form.price),
      salePrice: Number(form.salePrice) || 0,
      stock: Number(form.stock),
      description: form.description,
      status: form.status,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isHot: form.isHot,
      specifications: form.specifications.filter((s) => s.key && s.value),
      options: form.options,
      thumbnailMediaId: form.thumbnailMediaId,
      imageMediaIds: form.imageMediaIds,
    };

    const opts = {
      onSuccess: () => { toast.success(isEdit ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công'); navigate('/products'); },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi'),
    };

    if (isEdit) updateMut.mutate({ id, data: payload }, opts);
    else createMut.mutate(payload, opts);
  };

  const isMutating = createMut.isPending || updateMut.isPending;

  if (isEdit && productLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-6 w-full max-w-6xl mx-auto min-h-full bg-background text-foreground">
      <div className="sticky -top-3 sm:-top-6 z-30 -mt-3 sm:-mt-6 -mx-3 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer shrink-0"
            onClick={() => navigate('/products')}
            title="Quay lại danh sách"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
              {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>
            {isEdit && form.name && (
              <p className="text-xs text-muted-foreground truncate hidden sm:block font-mono">
                {form.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEdit && (
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-violet-500/40 px-3.5 text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-colors cursor-pointer"
              onClick={() => navigate(`/products/${id}/variants`)}
            >
              <Layers size={15} /> <span className="hidden sm:inline">Quản lý</span> biến thể
            </button>
          )}
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs sm:text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isMutating}
          >
            {isMutating ? <Loader2 size={15} className="animate-spin" /> : (isEdit ? 'Cập nhật' : 'Tạo sản phẩm')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xs flex flex-col gap-4">
            <h3 className="text-base font-semibold text-foreground pb-2 border-b border-border">Thông tin cơ bản</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Tên sản phẩm <span className="text-destructive ml-0.5">*</span></label>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Tên sản phẩm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Mã SKU
                  <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(Tùy chọn — tự sinh nếu để trống)</span>
                </label>
                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                  value={form.sku}
                  onChange={(e) => setField('sku', e.target.value)}
                  placeholder="Để trống để tự sinh từ tên sản phẩm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Tồn kho <span className="text-destructive ml-0.5">*</span></label>
                <input
                  type="number"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                  value={form.stock}
                  onChange={(e) => setField('stock', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Giá niêm yết <span className="text-destructive ml-0.5">*</span>
                  <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(Biến thể mặc định)</span>
                </label>
                <PriceInput value={form.price} onChange={(v) => setField('price', v)} placeholder="8,000,000" />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Giá khuyến mãi</label>
                  <div className="flex items-center rounded-md border border-border bg-muted p-0.5 text-xs">
                    <button
                      type="button"
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${discountMode === 'price' ? 'bg-background text-foreground font-semibold shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => setDiscountMode('price')}
                    >
                      Giá
                    </button>
                    <button
                      type="button"
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${discountMode === 'percent' ? 'bg-background text-foreground font-semibold shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => setDiscountMode('percent')}
                    >
                      %
                    </button>
                  </div>
                </div>

                {discountMode === 'price' ? (
                  <PriceInput
                    value={form.salePrice}
                    onChange={(v) => setField('salePrice', v)}
                    placeholder="0"
                  />
                ) : (
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      className="h-9 w-full rounded-md border border-input bg-background pl-3 pr-8 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={
                        form.price && form.salePrice
                          ? Math.round((1 - form.salePrice / form.price) * 100)
                          : ''
                      }
                      onChange={(e) => {
                        const pct = Math.min(100, Math.max(0, Number(e.target.value)));
                        if (form.price) setField('salePrice', Math.round(form.price * (1 - pct / 100)));
                      }}
                    />
                    <span className="absolute right-3 text-xs text-muted-foreground font-medium pointer-events-none">%</span>
                  </div>
                )}

                {form.price > 0 && form.salePrice > 0 && form.salePrice < form.price && (
                  <div className="mt-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                    Giảm {Math.round((1 - form.salePrice / form.price) * 100)}% — Tiết kiệm {formatVND(form.price - form.salePrice)}đ → Còn <strong>{formatVND(form.salePrice)}đ</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xs flex flex-col gap-4">
            <h3 className="text-base font-semibold text-foreground pb-2 border-b border-border">Mô tả sản phẩm</h3>
            <RichTextEditor
              value={form.description}
              onChange={(v) => setField('description', v)}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Thông số kỹ thuật</h3>
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                onClick={addSpecRow}
              >
                <Plus size={14} /> Thêm dòng
              </button>
            </div>

            {form.specifications.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">Chưa có thông số nào</p>
            ) : (
              <div className="flex flex-col gap-2">
                {form.specifications.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                      placeholder="Tên thông số (VD: Màn hình)"
                      value={s.key}
                      onChange={(e) => updateSpecRow(idx, e.target.value, s.value)}
                    />
                    <input
                      className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                      placeholder="Giá trị (VD: 6.7 inch Dynamic AMOLED)"
                      value={s.value}
                      onChange={(e) => updateSpecRow(idx, s.key, e.target.value)}
                    />
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                      onClick={() => removeSpecRow(idx)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xs flex flex-col gap-4">
            <h3 className="text-base font-semibold text-foreground pb-2 border-b border-border">Ảnh sản phẩm</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Ảnh đại diện <span className="text-destructive ml-0.5">*</span></label>
              {form.thumbnailUrl ? (
                <div className="relative aspect-square w-full rounded-lg border border-border overflow-hidden bg-muted group">
                  <img src={form.thumbnailUrl} alt="thumbnail" className="size-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground hover:bg-accent cursor-pointer" onClick={() => setPickerMode('thumbnail')}>
                      Thay ảnh
                    </button>
                    <button type="button" className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-destructive/10 text-destructive px-3 text-xs font-medium hover:bg-destructive/20 cursor-pointer" onClick={() => setForm((f) => ({ ...f, thumbnailMediaId: '', thumbnailUrl: '' }))}>
                      Xóa
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-border bg-muted/20 hover:border-primary/50 transition-colors cursor-pointer text-center"
                  onClick={() => setPickerMode('thumbnail')}
                >
                  <Image size={28} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Chọn ảnh đại diện</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Bộ ảnh sản phẩm</label>
                {form.imageUrls.length > 1 && (
                  <span className="text-[10px] text-muted-foreground">Kéo thả để sắp xếp</span>
                )}
              </div>

              <DndContext sensors={gallerySensors} collisionDetection={closestCenter} onDragEnd={handleDragEndGallery}>
                <SortableContext
                  items={form.imageUrls.map((_, i) => form.imageMediaIds[i] || `img-${i}`)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {form.imageUrls.map((url, idx) => {
                      const itemId = form.imageMediaIds[idx] || `img-${idx}`;
                      return (
                        <SortableGalleryItem
                          key={itemId}
                          id={itemId}
                          url={url}
                          idx={idx}
                          onRemove={removeGalleryImage}
                        />
                      );
                    })}
                    <div
                      className="aspect-square rounded-md border-2 border-dashed border-border bg-muted/20 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => setPickerMode('images')}
                    >
                      <Plus size={20} />
                      <span className="text-[10px] font-medium">Thêm ảnh</span>
                    </div>
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xs flex flex-col gap-4">
            <h3 className="text-base font-semibold text-foreground pb-2 border-b border-border">Phân loại & Trạng thái</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Danh mục <span className="text-destructive ml-0.5">*</span></label>
              <CategoryTreeMultiPicker
                categories={Array.isArray(categories) ? categories : []}
                value={form.categories}
                onChange={(v) => setField('categories', v)}
              />
              {form.categories.length === 0 && (
                <p className="text-xs text-muted-foreground">Có thể chọn nhiều danh mục. Khi chọn danh mục con, danh mục cha sẽ tự động được chọn.</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Thương hiệu</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors cursor-pointer"
                value={form.brand}
                onChange={(e) => setField('brand', e.target.value)}
              >
                <option value="">-- Chọn thương hiệu --</option>
                {(Array.isArray(brands) ? brands : []).map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Trạng thái sản phẩm

              </label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors cursor-pointer"
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
              >
                <option value="published">Công khai</option>
                <option value="draft">Nháp</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input text-primary focus:ring-ring"
                  checked={form.isActive}
                  onChange={(e) => setField('isActive', e.target.checked)}
                />
                <span>Kích hoạt hiển thị sản phẩm</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input text-primary focus:ring-ring"
                  checked={form.isFeatured}
                  onChange={(e) => setField('isFeatured', e.target.checked)}
                />
                <span>Sản phẩm nổi bật</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input text-primary focus:ring-ring"
                  checked={form.isHot}
                  onChange={(e) => setField('isHot', e.target.checked)}
                />
                <span>Sản phẩm HOT</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {pickerMode && (
        <MediaPickerModal
          isMultiple={pickerMode === 'images'}
          onSelect={handleMediaPick}
          onClose={() => setPickerMode(null)}
        />
      )}
    </div>
  );
}
