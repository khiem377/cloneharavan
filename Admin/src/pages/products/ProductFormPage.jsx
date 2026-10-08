import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Layers } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import { useProduct, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useMediaByIds } from '@/hooks/useMedia';
import { useCategories } from '@/hooks/useCategories';
import { useAllBrands } from '@/hooks/useBrands';
import { useSuppliers } from '@/hooks/useSuppliers';
import RichTextEditor from '@/components/ui/RichTextEditor';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { arrayMove } from '@dnd-kit/sortable';

import ProductBasicInfoCard from './components/ProductBasicInfoCard';
import ProductVariantsGeneratorCard from './components/ProductVariantsGeneratorCard';
import ProductSpecsEditorCard from './components/ProductSpecsEditorCard';
import ProductMediaCard from './components/ProductMediaCard';
import ProductClassificationSidebar from './components/ProductClassificationSidebar';

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

/**
 * Product Create / Edit Form Page
 */
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

  // Batch-fetch media objects
  const allMediaIds = useMemo(
    () =>
      [
        ...(form.thumbnailMediaId ? [form.thumbnailMediaId] : []),
        ...(form.imageMediaIds || []),
      ].filter(Boolean),
    [form.thumbnailMediaId, form.imageMediaIds]
  );
  const { data: mediaMap = {} } = useMediaByIds(allMediaIds);

  // Variant generator state
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState([]);
  const [optionInputs, setOptionInputs] = useState({});
  const [generatedVariants, setGeneratedVariants] = useState([]);
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkSalePrice, setBulkSalePrice] = useState('');
  const [bulkStock, setBulkStock] = useState('');

  // Cartesian product generator
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
        .map((a) =>
          a.value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .toUpperCase()
            .slice(0, 6)
        )
        .filter(Boolean)
        .join('-');
      const sku = baseSku
        ? attrSkuPart
          ? `${baseSku}-${attrSkuPart}`
          : `${baseSku}-${idx + 1}`
        : attrSkuPart
        ? `SKU-${attrSkuPart}`
        : `SKU-${idx + 1}`;

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
      const rawThumb = p.thumbnail;
      const thumbUrl =
        (typeof rawThumb === 'string' ? rawThumb : rawThumb?.url) ||
        (typeof p.thumbnailUrl === 'string' ? p.thumbnailUrl : '') ||
        '';
      const thumbMediaId =
        p.thumbnailMediaId?._id ||
        p.thumbnailMediaId ||
        rawThumb?.mediaId?._id ||
        rawThumb?.mediaId ||
        '';

      const rawImages = Array.isArray(p.images) ? p.images : [];
      const imgUrls = rawImages
        .map((img) => (typeof img === 'string' ? img : img?.url))
        .filter(Boolean);
      const imgMediaIds = (p.imageMediaIds || rawImages)
        .map((img) => img?.mediaId?._id || img?.mediaId || img?._id || '')
        .filter(Boolean);

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
        stock: p.stock ?? 0,
        description: p.description || '',
        status: p.status || 'published',
        isActive: p.isActive !== undefined ? p.isActive : true,
        isFeatured: Boolean(p.isFeatured),
        isHot: Boolean(p.isHot),
        specifications: p.specifications || [],
        options: p.options || [],
        thumbnailMediaId: thumbMediaId,
        thumbnailUrl: thumbUrl,
        imageMediaIds: imgMediaIds,
        imageUrls: imgUrls,
      });
    }
  }, [isEdit, productData]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addSpecRow = () => {
    setForm((f) => ({
      ...f,
      specifications: [...f.specifications, { key: '', value: '' }],
    }));
  };

  const updateSpecRow = (idx, key, value) => {
    setForm((f) => {
      const copy = [...f.specifications];
      copy[idx] = { key, value };
      return { ...f, specifications: copy };
    });
  };

  const removeSpecRow = (idx) => {
    setForm((f) => ({
      ...f,
      specifications: f.specifications.filter((_, i) => i !== idx),
    }));
  };

  const handleMediaPick = (selected) => {
    if (pickerMode === 'thumbnail') {
      const item = Array.isArray(selected) ? selected[0] : selected;
      if (item) {
        setForm((f) => ({
          ...f,
          thumbnailMediaId: item._id,
          thumbnailUrl: item.url,
        }));
      }
    } else if (pickerMode === 'images') {
      const items = Array.isArray(selected) ? selected : [selected];
      const newIds = items.map((i) => i._id);
      const newUrls = items.map((i) => i.url);
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
      unit: form.unit || 'Cái',
      itemType: form.itemType || 'merchandise',
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
      options:
        !isEdit && hasVariants
          ? options.filter((o) => o.name?.trim() && o.values?.length > 0)
          : form.options,
      thumbnailMediaId: form.thumbnailMediaId || undefined,
      thumbnailUrl: form.thumbnailUrl || undefined,
      imageMediaIds: form.imageMediaIds.filter(Boolean),
      imageUrls: form.imageUrls.filter(Boolean),
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
      onSuccess: () => {
        toast.success(isEdit ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công');
        navigate('/products');
      },
      onError: (e) => toast.error(e.response?.data?.message || 'Lỗi lưu sản phẩm'),
    };

    if (isEdit) updateMut.mutate({ id, data: payload }, opts);
    else createMut.mutate(payload, opts);
  };

  const isMutating = createMut.isPending || updateMut.isPending;

  if (isEdit && productLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-6 w-full max-w-6xl mx-auto min-h-full bg-background text-foreground">
      {/* Sticky Header Bar */}
      <div className="sticky -top-3 sm:-top-6 z-30 -mt-3 sm:-mt-6 -mx-3 sm:-mx-6 px-4 sm:px-6 py-3 bg-background border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/products')}
            className="h-8 w-8 rounded-[6px] border-border text-muted-foreground hover:bg-accent hover:text-foreground shrink-0 cursor-pointer"
            title="Quay lại danh sách"
          >
            <ArrowLeft size={16} />
          </Button>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-[6px] text-xs font-semibold text-primary border-primary/30 hover:bg-primary/5 active:scale-[0.98] cursor-pointer"
              onClick={() => navigate(`/products/${id}/variants`)}
            >
              <Layers size={14} className="mr-1.5" /> <span className="hidden sm:inline">Quản lý</span> biến thể
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="h-8 rounded-[6px] bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            onClick={handleSubmit}
            disabled={isMutating}
          >
            {isMutating ? <Loader2 size={13} className="animate-spin mr-1.5" /> : null}
            {isEdit ? 'Cập nhật' : 'Tạo sản phẩm'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Basic Info, Variants, Description, Specs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ProductBasicInfoCard
            form={form}
            setField={setField}
            discountMode={discountMode}
            setDiscountMode={setDiscountMode}
          />

          {!isEdit && (
            <ProductVariantsGeneratorCard
              hasVariants={hasVariants}
              setHasVariants={setHasVariants}
              options={options}
              setOptions={setOptions}
              optionInputs={optionInputs}
              setOptionInputs={setOptionInputs}
              generatedVariants={generatedVariants}
              setGeneratedVariants={setGeneratedVariants}
              bulkPrice={bulkPrice}
              setBulkPrice={setBulkPrice}
              bulkSalePrice={bulkSalePrice}
              setBulkSalePrice={setBulkSalePrice}
              bulkStock={bulkStock}
              setBulkStock={setBulkStock}
              generateCartesianVariants={generateCartesianVariants}
              form={form}
            />
          )}

          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">Mô tả sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <RichTextEditor
                value={form.description}
                onChange={(v) => setField('description', v)}
              />
            </CardContent>
          </Card>

          <ProductSpecsEditorCard
            specifications={form.specifications}
            addSpecRow={addSpecRow}
            updateSpecRow={updateSpecRow}
            removeSpecRow={removeSpecRow}
          />
        </div>

        {/* Right 1 Col: Media & Classification */}
        <div className="flex flex-col gap-6">
          <ProductMediaCard
            form={form}
            setForm={setForm}
            mediaMap={mediaMap}
            setPickerMode={setPickerMode}
            removeGalleryImage={removeGalleryImage}
            handleDragEndGallery={handleDragEndGallery}
          />

          <ProductClassificationSidebar
            form={form}
            setField={setField}
            categories={categories}
            brands={brands}
            suppliers={suppliers}
          />
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
