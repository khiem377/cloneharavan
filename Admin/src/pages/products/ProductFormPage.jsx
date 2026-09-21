import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, Image, ChevronDown, Layers, Search, X } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import { useProduct, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useMediaByIds } from '@/hooks/useMedia';
import { useCategories } from '@/hooks/useCategories';
import { useBrands, useAllBrands } from '@/hooks/useBrands';
import { useSuppliers } from '@/hooks/useSuppliers';
import RichTextEditor from '@/components/ui/RichTextEditor';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import SearchableSelect from '@/components/ui/SearchableSelect';
import PriceInput, { formatVND } from '@/components/ui/PriceInput';
import SortableGalleryItem from '@/components/products/SortableGalleryItem';
import { buildTree, buildRelationMaps, getAncestors, getDescendants } from '@/utils/treeUtils';
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
  'Cái', 'Chiếc', 'Hộp', 'Thùng', 'Lốc', 'Lon', 'Bộ', 'Gói', 'Chai', 'Mét', 'Kg', 'Cuộn', 'Bao', 'Tấm', 'Cặp', 'Thỏi'
];

const ITEM_TYPE_OPTIONS = [
  { label: 'Hàng hóa (Mua bán)', value: 'merchandise' },
  { label: 'Thành phẩm', value: 'finished_good' },
  { label: 'Nguyên vật liệu', value: 'raw_material' },
  { label: 'Dịch vụ', value: 'service' },
];


const DEFAULT_FORM = {
  name: '',
  sku: '',
  unit: 'Cái',
  itemType: 'merchandise',
  categories: [],
  brand: '',
  supplierId: '',
  price: '',
  salePrice: '',
  costPrice: '',
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

// formatVND imported from @/components/ui/PriceInput

// PriceInput imported from @/components/ui/PriceInput


// buildTree, getAncestors, getDescendants imported from @/utils/treeUtils

// ─── Highlight matched text ────────────────────────────────────────────────
function HighlightText({ text, query }) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-200 dark:bg-amber-700/50 text-foreground rounded-[2px] not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function CategoryTreeMultiPicker({ categories, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  const tree = buildTree(categories);
  const { parentMap, childrenMap } = buildRelationMaps(categories);
  const getAncestorIds = (id) => getAncestors(parentMap, id);
  const getDescendantIds = (id) => getDescendants(childrenMap, id);

  // Tính tập node visible khi search
  const searchQ = search.trim().toLowerCase();
  const visibleIds = useMemo(() => {
    if (!searchQ) return null;
    const matched = new Set();
    categories.forEach((c) => {
      if (c.name.toLowerCase().includes(searchQ)) {
        matched.add(c._id);
        getAncestorIds(c._id).forEach((a) => matched.add(a));
      }
    });
    return matched;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQ, categories.length]);

  // Auto-expand ancestors
  useEffect(() => {
    if (!categories?.length) return;
    const toExpand = {};
    if (searchQ && visibleIds) {
      visibleIds.forEach((id) => { toExpand[id] = true; });
    } else {
      value.forEach((id) => { getAncestorIds(id).forEach((a) => { toExpand[a] = true; }); });
    }
    setExpanded((prev) => ({ ...prev, ...toExpand }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQ, value?.join(','), categories?.length]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input khi mo dropdown
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 60);
  }, [open]);

  const toggleExpand = (id, e) => { e.stopPropagation(); setExpanded((p) => ({ ...p, [id]: !p[id] })); };

  const toggleCheck = (id) => {
    const isChecked = value.includes(id);
    if (isChecked) {
      onChange(value.filter((v) => v !== id && !getDescendantIds(id).includes(v)));
    } else {
      onChange([...new Set([...value, id, ...getAncestorIds(id)])]);
    }
  };

  const removeCat = (id, e) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== id && !getDescendantIds(id).includes(v)));
  };

  const selectedCats = value.map((id) => categories.find((c) => c._id === id)).filter(Boolean);

  const renderNode = (node, depth = 0) => {
    if (visibleIds && !visibleIds.has(node._id)) return null;
    const hasChildren = node.children?.length > 0;
    const isChecked = value.includes(node._id);
    const isExpanded = expanded[node._id];
    const isSearchMatch = searchQ && node.name.toLowerCase().includes(searchQ);

    return (
      <div key={node._id}>
        <div
          style={{ paddingLeft: `${depth * 16 + 6}px` }}
          className={`flex items-center gap-2 py-1.5 pr-2 rounded-md transition-colors ${isChecked ? 'bg-primary/5' : 'hover:bg-muted'
            } ${isSearchMatch ? 'ring-1 ring-inset ring-amber-400/50' : ''}`}
        >
          <button
            type="button"
            className={`size-4 flex items-center justify-center shrink-0 text-muted-foreground transition-transform ${hasChildren ? 'hover:text-foreground cursor-pointer' : 'opacity-0 pointer-events-none'
              }`}
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
              <HighlightText text={node.name} query={searchQ} />
            </span>
          </label>
        </div>
        {hasChildren && (isExpanded || (visibleIds && visibleIds.has(node._id))) && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const hasResults = !visibleIds || visibleIds.size > 0;

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        className="min-h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-left text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors cursor-pointer flex flex-wrap items-center gap-1.5"
        onClick={() => setOpen((v) => !v)}
      >
        {selectedCats.length === 0 ? (
          <span className="text-muted-foreground py-0.5">-- Chon danh muc --</span>
        ) : (
          selectedCats.map((c) => (
            <span key={c._id} className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 text-xs font-medium">
              {c.name}
              <button type="button" className="hover:text-destructive cursor-pointer leading-none" onClick={(e) => removeCat(c._id, e)}>x</button>
            </span>
          ))
        )}
        <ChevronDown size={14} className={`ml-auto shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-background shadow-lg flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tim danh muc..."
                className="h-8 w-full rounded-md border border-input bg-muted/40 pl-8 pr-7 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/20 placeholder:text-muted-foreground"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
          {/* Tree */}
          <div className="max-h-56 overflow-y-auto p-1">
            {!hasResults ? (
              <p className="px-3 py-3 text-xs text-center text-muted-foreground">Khong tim thay ket qua</p>
            ) : tree.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">Khong co danh muc</p>
            ) : (
              tree.map((node) => renderNode(node))
            )}
          </div>
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
  const { data: supplierRes = {} } = useSuppliers({ limit: 100 });
  const suppliers = supplierRes.data || supplierRes.suppliers || [];

  // Batch-fetch media objects de lay folder info cho thumbnail hover
  const allMediaIds = useMemo(() => [
    ...(form.thumbnailMediaId ? [form.thumbnailMediaId] : []),
    ...(form.imageMediaIds || []),
  ].filter(Boolean), [form.thumbnailMediaId, form.imageMediaIds]);
  const { data: mediaMap = {} } = useMediaByIds(allMediaIds);

  // State quản lý tạo biến thể trực tiếp khi tạo sản phẩm mới
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState([]);
  const [optionInputs, setOptionInputs] = useState({});
  const [generatedVariants, setGeneratedVariants] = useState([]);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkSalePrice, setBulkSalePrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  // Cartesian product generator cho biến thể
  const generateCartesianVariants = (opts, baseSku, basePrice, baseSalePrice, baseStock) => {
    const validOpts = opts.filter((o) => o.name?.trim() && o.values?.length > 0);
    if (validOpts.length === 0) return [];

    const cartesian = (args) => {
      const r = [];
      const max = args.length - 1;
      function helper(arr, i) {
        for (let j = 0; j < args[i].values.length; j++) {
          const a = [...arr, { name: args[i].name.trim(), value: args[i].values[j].trim() }];
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);
      return r;
    };

    const combinations = cartesian(validOpts);
    return combinations.map((attrs, idx) => {
      const displayName = attrs.map((a) => a.value).join(' / ');
      const attrSkuPart = attrs
        .map((a) => a.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6))
        .filter(Boolean)
        .join('-');
      const sku = baseSku
        ? (attrSkuPart ? `${baseSku}-${attrSkuPart}` : `${baseSku}-${idx + 1}`)
        : (attrSkuPart ? `SKU-${attrSkuPart}` : `SKU-${idx + 1}`);

      return {
        attributes: attrs,
        displayName,
        sku,
        price: basePrice ? Number(basePrice) : 0,
        salePrice: baseSalePrice ? Number(baseSalePrice) : 0,
        stock: baseStock ? Number(baseStock) : 0,
      };
    });
  };

  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();

  useEffect(() => {
    const p = productData?.data || productData;
    if (isEdit && p && (p._id || p.name)) {
      setForm({
        name: p.name || '',
        sku: p.sku || '',
        unit: p.unit || 'Cái',
        itemType: p.itemType || 'merchandise',
        categories: (p.categories || []).map((c) => c._id || c),
        brand: p.brand?._id || p.brand || '',
        supplierId: p.supplierId?._id || p.supplierId || '',
        price: p.price || 0,
        salePrice: p.salePrice || 0,
        costPrice: p.costPrice || 0,
        stock: p.stock || 0,
        description: p.description || '',
        status: p.status || 'published',
        isActive: p.isActive ?? true,
        isFeatured: p.isFeatured ?? false,
        isHot: p.isHot ?? false,
        specifications: p.specifications || [],
        options: p.options || [],
        thumbnailMediaId: (typeof (p.thumbnail?.mediaId || p.thumbnail) === 'object'
          ? (p.thumbnail?.mediaId?._id || p.thumbnail?._id)
          : (p.thumbnail?.mediaId || p.thumbnail?._id)) || '',
        thumbnailUrl: p.thumbnail?.url || '',
        imageMediaIds: (p.images || []).map((i) => {
          const mid = i.mediaId || i;
          return typeof mid === 'object' ? mid._id : mid;
        }),
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
      supplierId: form.supplierId || undefined,
      price: Number(form.price),
      salePrice: Number(form.salePrice) || 0,
      costPrice: Number(form.costPrice) || 0,
      stock: Number(form.stock),
      description: form.description,
      status: form.status,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isHot: form.isHot,
      specifications: form.specifications.filter((s) => s.key && s.value),
      options: (!isEdit && hasVariants) ? options.filter(o => o.name?.trim() && o.values?.length > 0) : form.options,
      thumbnailMediaId: form.thumbnailMediaId,
      imageMediaIds: form.imageMediaIds,
    };

    if (!isEdit && hasVariants && generatedVariants.length > 0) {
      payload.variants = generatedVariants.map((v) => ({
        sku: v.sku,
        displayName: v.displayName,
        attributes: v.attributes,
        price: Number(v.price || 0),
        salePrice: Number(v.salePrice || 0),
        stock: Number(v.stock || 0),
      }));
    }

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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-1">
                <label className="text-xs font-medium text-foreground">
                  Mã SKU
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">(Tùy chọn)</span>
                </label>
                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground transition-colors"
                  value={form.sku}
                  onChange={(e) => setField('sku', e.target.value)}
                  placeholder="Mã SKU"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-1">
                <label className="text-xs font-medium text-foreground">
                  Đơn vị tính (ĐVT) <span className="text-destructive ml-0.5">*</span>
                </label>
                <SearchableSelect
                  options={UNIT_OPTIONS}
                  value={form.unit || 'Cái'}
                  onChange={(v) => setField('unit', v)}
                  creatable={true}
                  placeholder="Chọn hoặc gõ ĐVT..."
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-1">
                <label className="text-xs font-medium text-foreground">Tính chất VTHH</label>
                <SearchableSelect
                  options={ITEM_TYPE_OPTIONS}
                  value={form.itemType || 'merchandise'}
                  onChange={(v) => setField('itemType', v)}
                  creatable={false}
                  placeholder="Chọn tính chất..."
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-1">
                <label className="text-xs font-medium text-foreground">Tồn kho <span className="text-destructive ml-0.5">*</span></label>
                <input
                  type="number"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors font-bold"
                  value={form.stock}
                  onChange={(e) => setField('stock', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Giá nhập vốn (Giá gốc)
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">(Quản lý kho/kế toán)</span>
                </label>
                <PriceInput value={form.costPrice} onChange={(v) => setField('costPrice', v)} placeholder="5,000,000" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">
                  Giá niêm yết <span className="text-destructive ml-0.5">*</span>
                  <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(Giá bán)</span>
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

          {/* SECTION: BẬT TẠO BIẾN THỂ CÙNG LÚC KHI TẠO MỚI */}
          {!isEdit && (
            <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Biến thể & Phiên bản sản phẩm</h3>
                  <p className="text-xs text-muted-foreground">Tùy chọn tạo nhiều kích thước, màu sắc cùng lúc (Hoặc để trống tạo sau)</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer bg-muted/50 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                    checked={hasVariants}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setHasVariants(enabled);
                      if (enabled && options.length === 0) {
                        setOptions([{ name: 'Kích thước', values: [] }]);
                      }
                    }}
                  />
                  <span>Sản phẩm này có nhiều phiên bản</span>
                </label>
              </div>

              {hasVariants && (
                <div className="flex flex-col gap-5 pt-1">
                  {/* Quản lý các thuộc tính */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">1. Danh sách thuộc tính (Ví dụ: Kích thước, Màu sắc)</label>
                      <button
                        type="button"
                        className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-primary/10 border border-primary/20 text-primary px-2.5 text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                        onClick={() => setOptions([...options, { name: '', values: [] }])}
                      >
                        <Plus size={13} /> Thêm thuộc tính khác
                      </button>
                    </div>

                    {options.map((opt, optIdx) => (
                      <div key={optIdx} className="p-3.5 rounded-lg border border-border bg-muted/20 flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                          <input
                            className="h-8.5 flex-1 max-w-xs rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring/20 placeholder:text-muted-foreground"
                            placeholder="Tên thuộc tính (VD: Kích thước)"
                            value={opt.name}
                            onChange={(e) => {
                              const copy = [...options];
                              copy[optIdx].name = e.target.value;
                              setOptions(copy);
                            }}
                          />
                          <button
                            type="button"
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer ml-auto"
                            onClick={() => {
                              const copy = options.filter((_, i) => i !== optIdx);
                              setOptions(copy);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Thêm chip giá trị */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {opt.values.map((val, valIdx) => (
                            <span key={valIdx} className="inline-flex items-center gap-1 rounded-md bg-background border border-border px-2 py-1 text-xs font-medium text-foreground shadow-2xs">
                              {val}
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive cursor-pointer ml-0.5"
                                onClick={() => {
                                  const copy = [...options];
                                  copy[optIdx].values = copy[optIdx].values.filter((_, i) => i !== valIdx);
                                  setOptions(copy);
                                }}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}

                          <div className="flex items-center gap-1 flex-1 min-w-[180px]">
                            <input
                              className="h-7 flex-1 rounded-md border border-dashed border-input bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
                              placeholder="Nhập giá trị (VD: Đỏ, Xanh, XL)..."
                              value={optionInputs[optIdx] || ''}
                              onChange={(e) => setOptionInputs({ ...optionInputs, [optIdx]: e.target.value })}
                              onBlur={() => {
                                const val = (optionInputs[optIdx] || '').trim();
                                if (val && !opt.values.includes(val)) {
                                  const copy = [...options];
                                  copy[optIdx].values.push(val);
                                  setOptions(copy);
                                  setOptionInputs({ ...optionInputs, [optIdx]: '' });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                  e.preventDefault();
                                  const val = (optionInputs[optIdx] || '').trim();
                                  if (val && !opt.values.includes(val)) {
                                    const copy = [...options];
                                    copy[optIdx].values.push(val);
                                    setOptions(copy);
                                    setOptionInputs({ ...optionInputs, [optIdx]: '' });
                                  }
                                }
                              }}
                            />
                            {optionInputs[optIdx]?.trim() && (
                              <button
                                type="button"
                                className="h-7 px-2 text-xs rounded bg-primary/10 hover:bg-primary/20 text-primary font-medium cursor-pointer shrink-0 transition-colors"
                                onClick={() => {
                                  const val = (optionInputs[optIdx] || '').trim();
                                  if (val && !opt.values.includes(val)) {
                                    const copy = [...options];
                                    copy[optIdx].values.push(val);
                                    setOptions(copy);
                                    setOptionInputs({ ...optionInputs, [optIdx]: '' });
                                  }
                                }}
                              >
                                + Thêm
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Nút bấm sinh ma trận biến thể */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs font-semibold text-foreground">2. Ma trận phiên bản ({generatedVariants.length} loại)</span>
                    <button
                      type="button"
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                      onClick={() => {
                        // Tự động gộp tất cả các giá trị đang gõ dở trong input mà người dùng quên bấm Enter
                        const latestOpts = options.map((opt, optIdx) => {
                          const pendingVal = (optionInputs[optIdx] || '').trim();
                          if (pendingVal && !opt.values.includes(pendingVal)) {
                            return { ...opt, values: [...opt.values, pendingVal] };
                          }
                          return opt;
                        });
                        setOptions(latestOpts);
                        setOptionInputs({});

                        const vars = generateCartesianVariants(latestOpts, form.sku, form.price, form.salePrice, form.stock);
                        setGeneratedVariants(vars);
                        if (vars.length > 0) toast.success(`Đã tự động sinh ${vars.length} biến thể`);
                        else toast.error('Vui lòng nhập ít nhất 1 tên thuộc tính và 1 giá trị');
                      }}
                    >
                      <Layers size={14} /> Sinh ma trận biến thể
                    </button>
                  </div>

                  {/* Bảng ma trận biến thể */}
                  {generatedVariants.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {/* Hàng Áp dụng hàng loạt */}
                      <div className="p-3 rounded-lg bg-muted/40 border border-border flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-semibold text-foreground shrink-0">Áp dụng cho tất cả:</span>
                        <div className="flex items-center gap-1.5">
                          <PriceInput
                            value={bulkPrice}
                            onChange={(v) => setBulkPrice(v)}
                            placeholder="Giá niêm yết"
                            className="h-8 w-28 text-xs"
                          />
                          <button
                            type="button"
                            className="h-8 px-2.5 rounded-md bg-background border border-border hover:bg-accent font-medium cursor-pointer"
                            onClick={() => {
                              if (!bulkPrice) return;
                              setGeneratedVariants(generatedVariants.map(v => ({ ...v, price: Number(bulkPrice) })));
                              toast.success('Đã áp dụng Giá niêm yết cho tất cả');
                            }}
                          >
                            Áp dụng
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <PriceInput
                            value={bulkSalePrice}
                            onChange={(v) => setBulkSalePrice(v)}
                            placeholder="Giá KM"
                            className="h-8 w-28 text-xs"
                          />
                          <button
                            type="button"
                            className="h-8 px-2.5 rounded-md bg-background border border-border hover:bg-accent font-medium cursor-pointer"
                            onClick={() => {
                              setGeneratedVariants(generatedVariants.map(v => ({ ...v, salePrice: Number(bulkSalePrice || 0) })));
                              toast.success('Đã áp dụng Giá KM cho tất cả');
                            }}
                          >
                            Áp dụng
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={bulkStock}
                            onChange={(e) => setBulkStock(e.target.value)}
                            placeholder="Tồn kho"
                            className="h-8 w-20 rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-ring"
                          />
                          <button
                            type="button"
                            className="h-8 px-2.5 rounded-md bg-background border border-border hover:bg-accent font-medium cursor-pointer"
                            onClick={() => {
                              setGeneratedVariants(generatedVariants.map(v => ({ ...v, stock: Number(bulkStock || 0) })));
                              toast.success('Đã áp dụng Tồn kho cho tất cả');
                            }}
                          >
                            Áp dụng
                          </button>
                        </div>
                      </div>

                      {/* Bảng chi tiết */}
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="bg-muted/80 text-foreground font-semibold">
                            <tr>
                              <th className="px-3 py-2 border-b border-border">#</th>
                              <th className="px-3 py-2 border-b border-border">Tên phiên bản</th>
                              <th className="px-3 py-2 border-b border-border">Mã SKU</th>
                              <th className="px-3 py-2 border-b border-border">Giá niêm yết</th>
                              <th className="px-3 py-2 border-b border-border">Giá KM</th>
                              <th className="px-3 py-2 border-b border-border">Tồn kho</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {generatedVariants.map((v, vIdx) => (
                              <tr key={vIdx} className="hover:bg-muted/20">
                                <td className="px-3 py-2 font-mono text-muted-foreground">{vIdx + 1}</td>
                                <td className="px-3 py-2 font-medium text-foreground">{v.displayName}</td>
                                <td className="px-3 py-2">
                                  <input
                                    className="h-7 w-28 rounded border border-input bg-background px-2 text-xs font-mono outline-none focus:border-ring"
                                    value={v.sku}
                                    onChange={(e) => {
                                      const copy = [...generatedVariants];
                                      copy[vIdx].sku = e.target.value;
                                      setGeneratedVariants(copy);
                                    }}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <PriceInput
                                    value={v.price}
                                    onChange={(val) => {
                                      const copy = [...generatedVariants];
                                      copy[vIdx].price = val;
                                      setGeneratedVariants(copy);
                                    }}
                                    className="h-7 w-28 text-xs"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <PriceInput
                                    value={v.salePrice}
                                    onChange={(val) => {
                                      const copy = [...generatedVariants];
                                      copy[vIdx].salePrice = val;
                                      setGeneratedVariants(copy);
                                    }}
                                    className="h-7 w-28 text-xs"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    className="h-7 w-20 rounded border border-input bg-background px-2 text-xs font-bold outline-none focus:border-ring"
                                    value={v.stock}
                                    onChange={(e) => {
                                      const copy = [...generatedVariants];
                                      copy[vIdx].stock = Number(e.target.value);
                                      setGeneratedVariants(copy);
                                    }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
                  <MediaThumbnailHover media={mediaMap[form.thumbnailMediaId]} className="size-full">
                    <img src={form.thumbnailUrl} alt="thumbnail" className="size-full object-cover" />
                  </MediaThumbnailHover>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground hover:bg-accent cursor-pointer" onClick={() => setPickerMode('thumbnail')}>
                      Thay đổi ảnh
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
                          media={mediaMap[itemId] || null}
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
              <SearchableSelect
                options={(Array.isArray(brands) ? brands : []).map((b) => ({ label: b.name, value: b._id }))}
                value={form.brand}
                onChange={(v) => setField('brand', v)}
                creatable={false}
                placeholder="-- Chọn thương hiệu --"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Nhà Cung Cấp (Procurement)</label>
              <SearchableSelect
                options={(Array.isArray(suppliers) ? suppliers : []).map((s) => ({ label: `${s.name} (${s.code})`, value: s._id }))}
                value={form.supplierId}
                onChange={(v) => setField('supplierId', v)}
                creatable={false}
                placeholder="-- Chọn nhà cung cấp mặc định --"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Trạng thái sản phẩm</label>
              <SearchableSelect
                options={[
                  { label: 'Công khai', value: 'published' },
                  { label: 'Nháp', value: 'draft' },
                  { label: 'Hết hàng', value: 'out_of_stock' },
                ]}
                value={form.status}
                onChange={(v) => setField('status', v)}
                creatable={false}
                placeholder="Chọn trạng thái..."
              />
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
