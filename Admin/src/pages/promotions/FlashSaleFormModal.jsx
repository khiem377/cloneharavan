import { useState, useEffect } from 'react';
import { X, Image, Plus, Trash2, Search, Loader2, Sparkles } from '@/components/ui/Icons';
import { flashSaleService } from '@/services/flashSale.service';
import { productService } from '@/services/product.service';
import { productVariantService } from '@/services/productVariant.service';
import { toast } from '@/providers/ToastProvider';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function FlashSaleFormModal({ flashSale, onClose, onSuccess }) {
  const isEdit = !!flashSale;

  const [name, setName] = useState(flashSale?.name || '');
  const [description, setDescription] = useState(flashSale?.description || '');
  const [startDate, setStartDate] = useState(
    flashSale?.startDate ? new Date(flashSale.startDate).toISOString().slice(0, 16) : ''
  );
  const [endDate, setEndDate] = useState(
    flashSale?.endDate ? new Date(flashSale.endDate).toISOString().slice(0, 16) : ''
  );
  const [isActive, setIsActive] = useState(flashSale?.isActive ?? true);
  const [banner, setBanner] = useState(flashSale?.banner || null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const [items, setItems] = useState(
    flashSale?.items?.map((item) => {
      const orig = item.originalPrice || 0;
      const fsPrice = item.flashSalePrice || 0;
      const pct = orig > 0 ? Math.round(((orig - fsPrice) / orig) * 100) : 0;

      let vName = '';
      if (item.variantId) {
        if (typeof item.variantId === 'object') {
          vName = item.variantId.attributes?.map(a => `${a.name}: ${a.value}`).join(', ') || item.variantId.sku || item.variantId.nameOverride || '';
        } else {
          vName = item.variantId;
        }
      }

      const invStock = typeof item.productId === 'object'
        ? (item.variantId && typeof item.variantId === 'object' ? item.variantId.stock : item.productId?.stock)
        : null;
      const allSold = typeof item.productId === 'object'
        ? (item.variantId && typeof item.variantId === 'object' ? item.variantId.sold : item.productId?.sold || 0)
        : 0;

      return {
        productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
        productName: typeof item.productId === 'object' ? item.productId.name : 'Sản phẩm',
        productImage: typeof item.productId === 'object' ? item.productId.thumbnail?.url : '',
        variantId: item.variantId ? (typeof item.variantId === 'object' ? item.variantId._id : item.variantId) : null,
        variantName: vName,
        inventoryStock: invStock,
        totalSold: allSold,
        originalPrice: orig,
        discountType: 'percent',
        discountValue: pct,
        flashSalePrice: fsPrice,
        stockLimit: item.stockLimit || 10,
        soldCount: item.soldCount || 0,
      };
    }) || []
  );

  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bulkDiscountType, setBulkDiscountType] = useState('percent');
  const [bulkDiscountValue, setBulkDiscountValue] = useState(30);

  useEffect(() => {
    if (!productSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await productService.getAll({ search: productSearch, limit: 10 });
        const products = res.data.data || [];
        const productsWithVariants = await Promise.all(
          products.map(async (prod) => {
            try {
              const varRes = await productVariantService.getByProduct(prod._id);
              const variants = varRes.data?.data || varRes.data || [];
              return { ...prod, variants: Array.isArray(variants) ? variants : [] };
            } catch {
              return { ...prod, variants: [] };
            }
          })
        );
        setSearchResults(productsWithVariants);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const calculateFinalPrice = (orig, type, val) => {
    if (type === 'percent') {
      const pct = Math.max(0, Math.min(99, Number(val) || 0));
      return Math.round(orig * (1 - pct / 100));
    }
    if (type === 'fixed_discount') {
      const disc = Math.max(0, Number(val) || 0);
      return Math.max(0, orig - disc);
    }
    if (type === 'fixed_price') {
      const price = Math.max(0, Number(val) || 0);
      return Math.min(orig, price);
    }
    return orig;
  };

  const handleSelectProduct = (product) => {
    const exists = items.some((i) => i.productId === product._id && !i.variantId);
    if (exists) {
      toast.error('Sản phẩm gốc này đã có trong danh sách Flash Sale');
      return;
    }

    const price = product.salePrice || product.price || 0;
    const defaultPct = 30;
    const fsPrice = Math.round(price * (1 - defaultPct / 100));

    const newItem = {
      productId: product._id,
      productName: product.name,
      productImage: product.thumbnail?.url || '',
      variantId: null,
      variantName: '',
      inventoryStock: product.stock ?? 0,
      totalSold: product.sold ?? 0,
      originalPrice: price,
      discountType: 'percent',
      discountValue: defaultPct,
      flashSalePrice: fsPrice,
      stockLimit: Math.min(product.stock || 10, 20),
      soldCount: 0,
    };

    setItems((prev) => [...prev, newItem]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleSelectVariant = (product, variant) => {
    const exists = items.some((i) => i.productId === product._id && i.variantId === variant._id);
    if (exists) {
      toast.error('Biến thể này đã có trong danh sách Flash Sale');
      return;
    }

    const price = variant.price || product.salePrice || product.price || 0;
    const defaultPct = 30;
    const fsPrice = Math.round(price * (1 - defaultPct / 100));

    const attrString = variant.attributes?.map((a) => `${a.name}: ${a.value}`).join(', ') || variant.sku || 'Biến thể';

    const newItem = {
      productId: product._id,
      productName: product.name,
      productImage: variant.image?.url || product.thumbnail?.url || '',
      variantId: variant._id,
      variantName: attrString,
      inventoryStock: variant.stock ?? product.stock ?? 0,
      totalSold: variant.sold ?? product.sold ?? 0,
      originalPrice: price,
      discountType: 'percent',
      discountValue: defaultPct,
      flashSalePrice: fsPrice,
      stockLimit: Math.min(variant.stock || 10, 20),
      soldCount: 0,
    };

    setItems((prev) => [...prev, newItem]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleDiscountTypeChange = (index, type) => {
    setItems((prev) => {
      const next = [...prev];
      const item = next[index];
      let val = item.discountValue;
      if (type === 'percent') val = 30;
      if (type === 'fixed_discount') val = 50000;
      if (type === 'fixed_price') val = Math.round(item.originalPrice * 0.7);

      const fsPrice = calculateFinalPrice(item.originalPrice, type, val);
      next[index] = { ...item, discountType: type, discountValue: val, flashSalePrice: fsPrice };
      return next;
    });
  };

  const handleDiscountValueChange = (index, val) => {
    const numVal = Number(val) || 0;
    setItems((prev) => {
      const next = [...prev];
      const item = next[index];
      const fsPrice = calculateFinalPrice(item.originalPrice, item.discountType, numVal);
      next[index] = { ...item, discountValue: numVal, flashSalePrice: fsPrice };
      return next;
    });
  };

  const handleStockChange = (index, val) => {
    const stockVal = Number(val) || 1;
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], stockLimit: stockVal };
      return next;
    });
  };

  const handleApplyBulkDiscount = () => {
    if (bulkDiscountValue < 0) {
      toast.error('Giá trị giảm không hợp lệ');
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        const fsPrice = calculateFinalPrice(item.originalPrice, bulkDiscountType, bulkDiscountValue);
        return {
          ...item,
          discountType: bulkDiscountType,
          discountValue: bulkDiscountValue,
          flashSalePrice: fsPrice,
        };
      })
    );
    toast.success('Đã áp dụng giảm giá cho tất cả sản phẩm');
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error('Vui lòng nhập tên chương trình');
    if (!startDate) return toast.error('Vui lòng chọn thời gian bắt đầu');
    if (!endDate) return toast.error('Vui lòng chọn thời gian kết thúc');
    if (new Date(endDate) <= new Date(startDate)) return toast.error('Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
    if (items.length === 0) return toast.error('Vui lòng thêm ít nhất 1 sản phẩm tham gia');

    for (const item of items) {
      if (item.flashSalePrice >= item.originalPrice) {
        return toast.error(`Giá Flash Sale của "${item.productName}" phải nhỏ hơn giá gốc`);
      }
      if (item.stockLimit <= 0) {
        return toast.error(`Số lượng mở bán của "${item.productName}" phải lớn hơn 0`);
      }
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      bannerMediaId: banner?.mediaId || banner?._id || null,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId || null,
        originalPrice: i.originalPrice,
        flashSalePrice: i.flashSalePrice,
        stockLimit: i.stockLimit,
      })),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await flashSaleService.update(flashSale._id, payload);
        toast.success('Đã cập nhật chương trình Flash Sale');
      } else {
        await flashSaleService.create(payload);
        toast.success('Đã tạo chương trình Flash Sale thành công');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu chương trình');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 rounded-[6px] border border-border">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">
              {isEdit ? 'Chỉnh sửa Flash Sale' : 'Tạo chương trình Flash Sale mới'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
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
                  <div className="relative h-32 rounded-[6px] border border-border overflow-hidden group">
                    <MediaThumbnailHover media={banner}>
                      <img src={banner.url} alt="banner" className="size-full object-cover" />
                    </MediaThumbnailHover>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowMediaPicker(true)}
                      className="absolute bottom-2 right-2 h-7 px-2.5 bg-black/75 text-white text-xs font-medium rounded-[4px] hover:bg-black"
                    >
                      Đổi banner
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMediaPicker(true)}
                    className="w-full h-20 border-dashed border-border hover:border-primary/50 rounded-[6px] flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Image className="size-5" />
                    <span className="text-xs font-normal">Chọn ảnh banner từ thư viện media</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 md:col-span-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded-[4px] border-input text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-foreground cursor-pointer select-none">
                  Kích hoạt chương trình Flash Sale này
                </label>
              </div>
            </div>

            <div className="border-t border-border pt-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Danh sách sản phẩm Flash Sale ({items.length})
                </h3>

                {items.length > 0 && (
                  <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-[6px] border border-border flex-wrap">
                    <span className="text-xs text-muted-foreground font-medium">Áp dụng nhanh:</span>
                    <select
                      className="h-8 px-2 rounded-[4px] border border-input bg-background text-xs font-medium outline-none focus:border-ring cursor-pointer"
                      value={bulkDiscountType}
                      onChange={(e) => setBulkDiscountType(e.target.value)}
                    >
                      <option value="percent">Giảm theo %</option>
                      <option value="fixed_discount">Giảm bớt số tiền (đ)</option>
                      <option value="fixed_price">Set giá Flash Sale cố định (đ)</option>
                    </select>
                    <Input
                      type="number"
                      className="w-28 h-8 px-2 rounded-[4px] font-mono text-xs font-semibold"
                      placeholder="Nhập giá trị..."
                      value={bulkDiscountValue}
                      onChange={(e) => setBulkDiscountValue(Number(e.target.value))}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApplyBulkDiscount}
                      className="h-8 px-3 rounded-[4px] text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Sparkles className="size-3.5 mr-1" /> Áp dụng
                    </Button>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    className="h-9 pl-9 pr-3 rounded-[6px]"
                    placeholder="Tìm kiếm và chọn sản phẩm thêm vào Flash Sale..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                  />
                  {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />}
                </div>

                {showProductDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-[6px] border border-border bg-popover shadow-sm py-1">
                    {searchResults.map((prod) => (
                      <div key={prod._id} className="border-b border-border/40 last:border-0">
                        <div
                          onClick={() => handleSelectProduct(prod)}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                        >
                          {prod.thumbnail?.url ? (
                            <img src={prod.thumbnail.url} alt="" className="size-8 object-cover rounded-[4px] border border-border shrink-0" />
                          ) : (
                            <div className="size-8 rounded-[4px] bg-muted flex items-center justify-center text-xs shrink-0">SP</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {prod.name} {prod.variants?.length > 0 && <span className="text-[11px] text-muted-foreground font-normal">(SP Gốc)</span>}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                              Giá gốc: {(prod.salePrice || prod.price || 0).toLocaleString('vi-VN')}đ | Tồn: {prod.stock || 0}
                            </p>
                          </div>
                          <Plus className="size-4 text-muted-foreground" />
                        </div>

                        {prod.variants?.map((v) => {
                          const attrStr = v.attributes?.map((a) => `${a.name}: ${a.value}`).join(', ') || v.sku || 'Biến thể';
                          return (
                            <div
                              key={v._id}
                              onClick={() => handleSelectVariant(prod, v)}
                              className="flex items-center gap-3 pl-8 pr-3 py-1.5 hover:bg-primary/10 transition-colors cursor-pointer bg-muted/20 border-t border-border/30 text-xs"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate text-xs">↳ Biến thể: {attrStr}</p>
                                <p className="text-[11px] font-mono text-muted-foreground tabular-nums">
                                  SKU: {v.sku || '—'} | Giá: {(v.price || prod.price || 0).toLocaleString('vi-VN')}đ | Tồn: {v.stock ?? 0}
                                </p>
                              </div>
                              <Plus className="size-3.5 text-primary" />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-[6px] text-muted-foreground text-xs">
                  Chưa có sản phẩm nào. Hãy gõ tên sản phẩm ở trên để thêm vào Flash Sale.
                </div>
              ) : (
                <div className="border border-border rounded-[6px] overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="border-b border-border">
                        <TableHead className="px-3 py-2 text-xs">Sản phẩm</TableHead>
                        <TableHead className="px-3 py-2 text-xs w-24">Giá gốc</TableHead>
                        <TableHead className="px-3 py-2 text-xs w-32">Loại giảm</TableHead>
                        <TableHead className="px-3 py-2 text-xs w-24">Mức giảm</TableHead>
                        <TableHead className="px-3 py-2 text-xs w-28 text-emerald-600 font-semibold">Giá FS</TableHead>
                        <TableHead className="px-3 py-2 text-xs w-20 text-center">Tồn kho</TableHead>
                        <TableHead className="px-3 py-2 text-xs w-24 text-center">Suất FS</TableHead>
                        <TableHead className="px-3 py-2 text-xs w-20 text-center">Đã bán FS</TableHead>
                        <TableHead className="px-3 py-2 text-xs w-24 text-center">Còn lại FS</TableHead>
                        <TableHead className="px-3 py-2 text-xs w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, idx) => {
                        const fsRemaining = Math.max(0, (item.stockLimit || 0) - (item.soldCount || 0));
                        const isOverStock = item.inventoryStock !== null && item.inventoryStock !== undefined && item.stockLimit > item.inventoryStock;
                        return (
                          <TableRow key={idx} className="border-b border-border/50">
                            <TableCell className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                {item.productImage ? (
                                  <img src={item.productImage} alt="" className="size-8 object-cover rounded-[4px] border border-border shrink-0" />
                                ) : (
                                  <div className="size-8 rounded-[4px] bg-muted shrink-0" />
                                )}
                                <div className="truncate max-w-xs">
                                  <p className="font-medium text-foreground text-xs truncate">{item.productName}</p>
                                  {item.variantName && (
                                    <p className="text-[11px] font-semibold text-primary truncate">↳ Biến thể: {item.variantName}</p>
                                  )}
                                  <p className="text-[10px] text-muted-foreground font-mono tabular-nums">Tổng bán shop: <span className="font-medium text-foreground">{item.totalSold ?? 0}</span></p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="px-3 py-2 font-mono font-medium text-muted-foreground tabular-nums whitespace-nowrap text-xs">
                              {item.originalPrice.toLocaleString('vi-VN')}đ
                            </TableCell>

                            <TableCell className="px-3 py-2">
                              <select
                                className="w-full h-7 px-1.5 rounded-[4px] border border-input bg-background text-xs font-medium outline-none focus:border-ring cursor-pointer"
                                value={item.discountType}
                                onChange={(e) => handleDiscountTypeChange(idx, e.target.value)}
                              >
                                <option value="percent">Giảm %</option>
                                <option value="fixed_discount">Giảm bớt (đ)</option>
                                <option value="fixed_price">Giá cố định (đ)</option>
                              </select>
                            </TableCell>

                            <TableCell className="px-3 py-2">
                              <Input
                                type="number"
                                min={0}
                                className="w-full h-7 px-2 rounded-[4px] font-mono font-semibold text-xs"
                                value={item.discountValue}
                                onChange={(e) => handleDiscountValueChange(idx, e.target.value)}
                              />
                            </TableCell>

                            <TableCell className="px-3 py-2 font-mono font-bold text-emerald-600 tabular-nums whitespace-nowrap text-xs">
                              {item.flashSalePrice.toLocaleString('vi-VN')}đ
                            </TableCell>

                            <TableCell className="px-3 py-2 text-center font-mono tabular-nums text-xs">
                              <span className="font-semibold text-foreground">
                                {item.inventoryStock !== null && item.inventoryStock !== undefined ? item.inventoryStock : '—'}
                              </span>
                            </TableCell>

                            <TableCell className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <Input
                                  type="number"
                                  min={1}
                                  className={`w-16 h-7 px-1.5 rounded-[4px] font-mono text-xs text-center ${isOverStock ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold' : ''}`}
                                  value={item.stockLimit}
                                  onChange={(e) => handleStockChange(idx, e.target.value)}
                                />
                                {isOverStock && (
                                  <span className="text-[10px] text-amber-600 whitespace-nowrap font-medium" title="Số suất vượt quá số lượng trong kho thực tế">
                                    Vượt tồn
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="px-3 py-2 text-center font-mono tabular-nums text-xs">
                              <Badge variant="outline" className="rounded-[4px] px-1.5 py-0 font-medium text-[11px] bg-blue-500/10 text-blue-600 border-blue-500/20">
                                {item.soldCount || 0}
                              </Badge>
                            </TableCell>

                            <TableCell className="px-3 py-2 text-center font-mono tabular-nums text-xs">
                              <Badge variant="outline" className={`rounded-[4px] px-1.5 py-0 font-medium text-[11px] ${fsRemaining === 0 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                                {fsRemaining}
                              </Badge>
                            </TableCell>

                            <TableCell className="px-3 py-2 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(idx)}
                                className="size-7 rounded-[4px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2 bg-transparent">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={saving}
                className="h-9 rounded-[6px]"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-9 rounded-[6px] active:scale-[0.98] transition-transform"
              >
                {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
                {isEdit ? 'Cập nhật Flash Sale' : 'Tạo Flash Sale'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showMediaPicker && (
        <MediaPickerModal
          onSelect={(item) => {
            setBanner(item);
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </>
  );
}
