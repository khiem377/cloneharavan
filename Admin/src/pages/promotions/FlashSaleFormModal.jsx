import { useState, useEffect } from 'react';
import { X, Image, Plus, Trash2, Search, Loader2, Sparkles } from '@/components/ui/Icons';
import { flashSaleService } from '@/services/flashSale.service';
import { productService } from '@/services/product.service';
import { toast } from '@/providers/ToastProvider';
import MediaPickerModal from '@/components/ui/MediaPickerModal';

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

      return {
        productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
        productName: typeof item.productId === 'object' ? item.productId.name : 'Sản phẩm',
        productImage: typeof item.productId === 'object' ? item.productId.thumbnail?.url : '',
        variantId: item.variantId ? (typeof item.variantId === 'object' ? item.variantId._id : item.variantId) : null,
        variantName: item.variantId ? (typeof item.variantId === 'object' ? (item.variantId.nameOverride || item.variantId.sku) : '') : '',
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
        setSearchResults(res.data.data || []);
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
      toast.error('Sản phẩm đã có trong danh sách Flash Sale');
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
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">
              {isEdit ? 'Chỉnh sửa Flash Sale' : 'Tạo chương trình Flash Sale mới'}
            </h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Tên chương trình <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                  placeholder="VD: Flash Sale Giờ Vàng 12h - 14h..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Thời gian bắt đầu <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Thời gian kết thúc <span className="text-destructive">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Mô tả chương trình</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:border-ring resize-none"
                  placeholder="Mô tả chi tiết ưu đãi Flash Sale..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Banner chương trình</label>
                {banner?.url ? (
                  <div className="relative h-32 rounded-lg border border-border overflow-hidden group">
                    <img src={banner.url} alt="banner" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/70 text-white text-xs font-medium rounded-md backdrop-blur-xs hover:bg-black transition-colors cursor-pointer"
                    >
                      Đổi banner
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="w-full h-24 border-2 border-dashed border-border hover:border-primary/50 rounded-lg flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Image className="size-5" />
                    <span className="text-xs">Chọn ảnh banner từ thư viện media</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 md:col-span-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium text-foreground cursor-pointer">
                  Kích hoạt chương trình Flash Sale này
                </label>
              </div>
            </div>

            <div className="border-t border-border pt-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Danh sách sản phẩm Flash Sale ({items.length})
                </h3>

                {items.length > 0 && (
                  <div className="flex items-center gap-2 bg-muted/60 p-2 rounded-lg border border-border flex-wrap">
                    <span className="text-xs text-muted-foreground font-medium">Áp dụng nhanh tất cả:</span>
                    <select
                      className="h-8 px-2 rounded border border-input bg-background text-xs font-medium outline-none focus:border-ring cursor-pointer"
                      value={bulkDiscountType}
                      onChange={(e) => setBulkDiscountType(e.target.value)}
                    >
                      <option value="percent">Giảm theo %</option>
                      <option value="fixed_discount">Giảm bớt số tiền (đ)</option>
                      <option value="fixed_price">Set giá Flash Sale cố định (đ)</option>
                    </select>
                    <input
                      type="number"
                      className="w-28 h-8 px-2 rounded border border-input bg-background font-mono text-xs font-semibold outline-none focus:border-ring"
                      placeholder="Nhập giá trị..."
                      value={bulkDiscountValue}
                      onChange={(e) => setBulkDiscountValue(Number(e.target.value))}
                    />
                    <button
                      type="button"
                      onClick={handleApplyBulkDiscount}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="size-3.5" /> Áp dụng
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    className="w-full pl-9 pr-3 h-9 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
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
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-popover shadow-lg py-1">
                    {searchResults.map((prod) => (
                      <div
                        key={prod._id}
                        onClick={() => handleSelectProduct(prod)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors cursor-pointer"
                      >
                        {prod.thumbnail?.url ? (
                          <img src={prod.thumbnail.url} alt="" className="size-8 object-cover rounded border border-border" />
                        ) : (
                          <div className="size-8 rounded bg-muted flex items-center justify-center text-xs">SP</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{prod.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Giá: {(prod.salePrice || prod.price || 0).toLocaleString('vi-VN')}đ | Tồn: {prod.stock || 0}
                          </p>
                        </div>
                        <Plus className="size-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-lg text-muted-foreground text-xs">
                  Chưa có sản phẩm nào. Hãy gõ tên sản phẩm ở trên để thêm vào Flash Sale.
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="px-3 py-2.5">Sản phẩm</th>
                        <th className="px-3 py-2.5 w-24">Giá gốc</th>
                        <th className="px-3 py-2.5 w-36">Loại giảm</th>
                        <th className="px-3 py-2.5 w-28">Giá trị giảm</th>
                        <th className="px-3 py-2.5 w-32 font-semibold text-emerald-600">Giá Flash Sale</th>
                        <th className="px-3 py-2.5 w-20 text-center">Số suất</th>
                        <th className="px-3 py-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              {item.productImage ? (
                                <img src={item.productImage} alt="" className="size-8 object-cover rounded border border-border shrink-0" />
                              ) : (
                                <div className="size-8 rounded bg-muted shrink-0" />
                              )}
                              <div className="truncate max-w-xs">
                                <p className="font-medium text-foreground truncate">{item.productName}</p>
                                {item.variantName && <p className="text-[10px] text-muted-foreground">{item.variantName}</p>}
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-2 font-mono font-medium text-muted-foreground whitespace-nowrap">
                            {item.originalPrice.toLocaleString('vi-VN')}đ
                          </td>

                          <td className="px-3 py-2">
                            <select
                              className="w-full h-7 px-1.5 rounded border border-input bg-background text-xs font-medium outline-none focus:border-ring cursor-pointer"
                              value={item.discountType}
                              onChange={(e) => handleDiscountTypeChange(idx, e.target.value)}
                            >
                              <option value="percent">Giảm %</option>
                              <option value="fixed_discount">Giảm bớt (đ)</option>
                              <option value="fixed_price">Giá cố định (đ)</option>
                            </select>
                          </td>

                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              className="w-full h-7 px-2 rounded border border-input bg-background font-mono font-semibold text-xs text-foreground outline-none focus:border-ring"
                              value={item.discountValue}
                              onChange={(e) => handleDiscountValueChange(idx, e.target.value)}
                            />
                          </td>

                          <td className="px-3 py-2 font-mono font-bold text-emerald-600 whitespace-nowrap">
                            {item.flashSalePrice.toLocaleString('vi-VN')}đ
                          </td>

                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={1}
                              className="w-full h-7 px-1.5 rounded border border-input bg-background font-mono text-xs outline-none focus:border-ring text-center"
                              value={item.stockLimit}
                              onChange={(e) => handleStockChange(idx, e.target.value)}
                            />
                          </td>

                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? 'Cập nhật Flash Sale' : 'Tạo Flash Sale'}
              </button>
            </div>
          </form>
        </div>
      </div>

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
