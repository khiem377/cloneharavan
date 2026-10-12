import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trash2,
  Search,
} from 'lucide-react';
import { useSearchInventoryProducts } from '@/hooks/useProducts';
import { useCreateCombo, useUpdateCombo, useAiSuggestComboPricing, useAiSuggestBundles } from '@/hooks/useCombos';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PromotionDateRangePicker from '@/components/ui/PromotionDateRangePicker';

export default function ComboFormModal({ isOpen, onClose, initialData = null, onSuccess }) {
  if (!isOpen) return null;

  const isEditing = !!initialData;
  const createMutation = useCreateCombo();
  const updateMutation = useUpdateCombo();
  const aiSuggestMutation = useAiSuggestComboPricing();
  const aiSuggestBundlesMutation = useAiSuggestBundles();
  const [aiSuggestionData, setAiSuggestionData] = useState(null);
  const [suggestedBundles, setSuggestedBundles] = useState([]);

  // Helper for 30-day default
  const defaultEndDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  };

  // Form states
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [isCustomCode, setIsCustomCode] = useState(!!initialData?.code);
  const [description, setDescription] = useState(initialData?.description || '');
  const [startDate, setStartDate] = useState(
    initialData?.startDate
      ? new Date(initialData.startDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate
      ? new Date(initialData.endDate).toISOString().slice(0, 10)
      : defaultEndDate()
  );
  const [isUnlimitedTime, setIsUnlimitedTime] = useState(
    initialData ? !initialData?.endDate : false
  );
  const [usageLimit, setUsageLimit] = useState(initialData?.usageLimit || 0);

  // Items in Combo: [{ productId, name, sku, thumbnail, stock, originalPrice, quantity }]
  const [selectedItems, setSelectedItems] = useState(
    initialData?.items?.map((it) => ({
      productId: it.productId?._id || it.productId,
      name: it.productId?.name || 'Sản phẩm',
      sku: it.productId?.sku || it.sku || '',
      thumbnail: it.productId?.thumbnail?.url || (typeof it.productId?.thumbnail === 'string' ? it.productId?.thumbnail : '') || '',
      stock: it.productId?.stock ?? 0,
      originalPrice: it.originalPrice ?? it.productId?.price ?? 0,
      quantity: it.quantity || 1,
    })) || []
  );

  // Pricing states
  const [pricingStrategy, setPricingStrategy] = useState(initialData?.pricingStrategy || 'fixed_price'); // 'fixed_price' | 'discount'
  const [discountType, setDiscountType] = useState(initialData?.discountType || 'amount'); // 'amount' | 'percent'
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue || 0);
  const [comboPriceInput, setComboPriceInput] = useState(
    initialData?.comboPrice !== undefined ? String(initialData.comboPrice) : ''
  );

  // Product Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: searchResults = [], isLoading: isSearching } = useSearchInventoryProducts(searchQuery);

  // Calculate total original price of selected items
  const totalOriginalPrice = useMemo(() => {
    return selectedItems.reduce((acc, it) => acc + (Number(it.originalPrice) || 0) * (Number(it.quantity) || 1), 0);
  }, [selectedItems]);

  // Calculate final combo price & savings
  const { finalComboPrice, savingsAmount, savingsPercent } = useMemo(() => {
    let finalPrice = 0;
    if (pricingStrategy === 'discount') {
      const val = Number(discountValue) || 0;
      if (discountType === 'percent') {
        const discountAmt = Math.round((totalOriginalPrice * val) / 100);
        finalPrice = Math.max(0, totalOriginalPrice - discountAmt);
      } else {
        finalPrice = Math.max(0, totalOriginalPrice - val);
      }
    } else {
      finalPrice = comboPriceInput === '' ? totalOriginalPrice : Number(comboPriceInput) || 0;
    }

    const diff = Math.max(0, totalOriginalPrice - finalPrice);
    const pct = totalOriginalPrice > 0 ? Math.round((diff / totalOriginalPrice) * 100) : 0;

    return {
      finalComboPrice: finalPrice,
      savingsAmount: diff,
      savingsPercent: pct,
    };
  }, [pricingStrategy, discountType, discountValue, comboPriceInput, totalOriginalPrice]);

  // Calculate dynamic virtual stock
  const { virtualStock, limitingProduct } = useMemo(() => {
    if (selectedItems.length === 0) return { virtualStock: 0, limitingProduct: null };

    let minStock = Infinity;
    let bottleneck = null;

    for (const it of selectedItems) {
      const currentStock = Number(it.stock) || 0;
      const reqQty = Number(it.quantity) || 1;
      const possible = Math.floor(currentStock / reqQty);

      if (possible < minStock) {
        minStock = possible;
        bottleneck = it;
      }
    }

    return {
      virtualStock: minStock === Infinity ? 0 : Math.max(0, minStock),
      limitingProduct: bottleneck,
    };
  }, [selectedItems]);

  // When adding products
  const handleSelectProduct = (product) => {
    const existingIndex = selectedItems.findIndex((it) => it.productId === product._id);
    if (existingIndex > -1) {
      // Increment quantity
      setSelectedItems((prev) =>
        prev.map((it, idx) => (idx === existingIndex ? { ...it, quantity: it.quantity + 1 } : it))
      );
      toast.info(`Đã tăng số lượng ${product.name} trong combo`);
    } else {
      const price = product.cachedPrice ?? product.price ?? 0;
      const thumbUrl = (typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail?.url) || '';
      setSelectedItems((prev) => [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku || '',
          thumbnail: thumbUrl,
          stock: product.stock || 0,
          originalPrice: price,
          quantity: 1,
        },
      ]);
      toast.success(`Đã thêm ${product.name} vào combo`);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuantityChange = (index, delta) => {
    setSelectedItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it;
        const newQty = Math.max(1, (it.quantity || 1) + delta);
        return { ...it, quantity: newQty };
      })
    );
  };

  // AI Pricing Suggestions
  const handleTriggerAiSuggestion = async () => {
    if (selectedItems.length < 2) {
      return toast.warning('Vui lòng chọn ít nhất 2 sản phẩm vào combo để AI phân tích và định giá');
    }
    try {
      const result = await aiSuggestMutation.mutateAsync({
        items: selectedItems.map((it) => ({
          productId: it.productId,
          name: it.name,
          originalPrice: it.originalPrice,
          quantity: it.quantity,
        })),
        totalOriginalPrice,
        comboName: name.trim() || undefined,
      });
      setAiSuggestionData(result);
      toast.success('AI Gemini đã phân tích xong và đưa ra các chiến lược định giá!');
    } catch (err) {
      toast.error('Không thể lấy gợi ý AI lúc này, vui lòng thử lại');
    }
  };

  const handleApplyAiOption = (option) => {
    setPricingStrategy('fixed_price');
    setComboPriceInput(String(option.suggestedPrice));
    toast.success(`Đã áp dụng ${option.label}: ${Number(option.suggestedPrice).toLocaleString('vi-VN')} đ (-${option.discountPercent}%)`);
  };

  const handleApplyAiName = (suggestedTitle) => {
    if (suggestedTitle) {
      setName(suggestedTitle);
      toast.success('Đã áp dụng tên combo do AI đề xuất');
    }
  };

  const handleLoadAiBundles = async () => {
    try {
      const bundles = await aiSuggestBundlesMutation.mutateAsync();
      if (!bundles || bundles.length === 0) {
        toast.info('Chưa có đủ sản phẩm trong kho để tạo combo tự động');
        return;
      }
      setSuggestedBundles(bundles);
      toast.success(`Đã gợi ý ${bundles.length} gói combo tiềm năng`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải gợi ý combo lúc này');
    }
  };

  const handleApplyBundle = (b) => {
    setName(b.name);
    setDescription(b.description || '');
    setSelectedItems(b.items || []);
    setPricingStrategy('fixed_price');
    setComboPriceInput(String(b.suggestedPrice));
    setSuggestedBundles([]);
    toast.success(`Đã áp dụng ${b.name}`);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error('Vui lòng nhập tên combo sản phẩm');
    }

    if (selectedItems.length < 2) {
      return toast.error('Một combo phải có ít nhất 2 sản phẩm');
    }

    if (finalComboPrice <= 0) {
      return toast.error('Giá bán của combo phải lớn hơn 0đ');
    }

    if (finalComboPrice > totalOriginalPrice) {
      if (!window.confirm('Giá combo đang cao hơn tổng giá gốc của các sản phẩm. Bạn có chắc chắn muốn lưu?')) {
        return;
      }
    }

    const payload = {
      name: name.trim(),
      code: isCustomCode && code.trim() ? code.trim().toUpperCase() : undefined,
      description: description.trim(),
      pricingStrategy,
      discountType: pricingStrategy === 'discount' ? discountType : undefined,
      discountValue: pricingStrategy === 'discount' ? Number(discountValue) : 0,
      comboPrice: finalComboPrice,
      totalOriginalPrice,
      items: selectedItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        originalPrice: it.originalPrice,
      })),
      startDate: startDate || new Date(),
      endDate: isUnlimitedTime ? null : endDate || null,
      usageLimit: Number(usageLimit) || 0,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: initialData._id, data: payload });
        toast.success('Cập nhật combo sản phẩm thành công');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Tạo combo sản phẩm mới thành công');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lưu combo thất bại, vui lòng kiểm tra lại');
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-5xl xl:max-w-6xl rounded-[8px] border border-border bg-card text-card-foreground shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isEditing ? 'Chỉnh sửa combo' : 'Tạo combo sản phẩm'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Đóng gói sản phẩm thành gói ưu đãi, tính tồn kho động & định giá
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isCustomCode ? (
              <button
                type="button"
                onClick={() => setIsCustomCode(true)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-primary/20 bg-primary/5 cursor-pointer active:scale-[0.98] transition-transform"
              >
                # Nhập mã tùy chỉnh
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="MÃ COMBO..."
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="h-7 w-32 px-2 text-xs font-mono uppercase bg-background rounded-[6px] border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCode(false);
                    setCode('');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground p-1"
                  title="Để hệ thống tự sinh mã"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Thông tin cơ bản
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Tên combo sản phẩm <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Ví dụ: Combo Siêu Tiết Kiệm Mùa Hè (3 Áo Thun + 1 Quần Short)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 rounded-[6px] text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Thời gian áp dụng
                </label>
                <PromotionDateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  isUnlimited={isUnlimitedTime}
                  onChange={({ startDate: s, endDate: e, isUnlimited: unl }) => {
                    setStartDate(s);
                    setEndDate(e || '');
                    setIsUnlimitedTime(unl);
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Giới hạn số lần sử dụng</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0 = Không giới hạn số lần bán"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="h-9 rounded-[6px] text-xs font-mono tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Mô tả / Ghi chú ưu đãi</label>
                <Input
                  type="text"
                  placeholder="Ưu đãi áp dụng cho khách mua gói combo trọn bộ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 rounded-[6px] text-xs"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* KHỐI 2: CHỌN SẢN PHẨM VÀO COMBO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sản phẩm trong combo ({selectedItems.length})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Chọn các sản phẩm thành phần cấu thành nên gói combo (tối thiểu 2 sản phẩm)
                </p>
              </div>

              {/* Tồn kho combo khả dụng hoặc Nút Gợi ý tạo combo */}
              {selectedItems.length >= 2 ? (
                <div className="flex items-center gap-2 rounded-[6px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Tồn kho combo khả dụng:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {virtualStock} bộ
                  </span>
                  {limitingProduct && (
                    <span className="text-[10px] text-muted-foreground font-normal">
                      (Giới hạn bởi: {limitingProduct.name.slice(0, 16)}...)
                    </span>
                  )}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadAiBundles}
                  disabled={aiSuggestBundlesMutation.isPending}
                  className="h-7 text-xs border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-semibold cursor-pointer active:scale-[0.98] transition-transform"
                >
                  {aiSuggestBundlesMutation.isPending ? 'Đang phân tích kho...' : 'AI gợi ý tạo combo'}
                </Button>
              )}
            </div>

            {/* Ô tìm kiếm sản phẩm */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Gõ tên hoặc mã SKU sản phẩm để thêm vào combo..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="pl-9 h-9 rounded-[6px] text-xs"
                />
                {isSearching && (
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground animate-pulse">
                    Đang tìm...
                  </span>
                )}
              </div>

              {/* Dropdown kết quả tìm kiếm */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto rounded-[6px] border border-border bg-popover shadow-md divide-y divide-border">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      Không tìm thấy sản phẩm phù hợp với từ khóa "{searchQuery}"
                    </div>
                  ) : (
                    searchResults.map((product) => {
                      const thumb = (typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail?.url) || '';
                      const price = product.cachedPrice ?? product.price ?? 0;
                      return (
                        <div
                          key={product._id}
                          onClick={() => handleSelectProduct(product)}
                          className="flex items-center justify-between p-2.5 hover:bg-muted/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={product.name}
                                className="size-8 rounded-[4px] border border-border object-cover shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className={`size-8 rounded-[4px] border border-border bg-muted items-center justify-center font-bold text-xs uppercase text-muted-foreground shrink-0 ${
                                thumb ? 'hidden' : 'flex'
                              }`}
                            >
                              {product.name ? product.name.charAt(0) : 'P'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">{product.name}</p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                                <span>SKU: {product.sku || '—'}</span>
                                <span>•</span>
                                <span>Tồn: {product.stock || 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-foreground font-mono tabular-nums">
                              {price.toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* DANH SÁCH GỢI Ý COMBO KHI FORM TRỐNG */}
            {suggestedBundles.length > 0 && selectedItems.length === 0 && (
              <div className="rounded-[6px] border border-primary/30 bg-primary/5 p-3.5 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-primary">
                      Gợi ý gói combo từ kho hàng:
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Chọn gói combo bên dưới để tự động điền sản phẩm và giá bán tối ưu
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSuggestedBundles([])}
                    className="text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                    title="Đóng gợi ý"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {suggestedBundles.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-[6px] border border-border bg-background p-3 flex flex-col justify-between space-y-2.5 hover:border-primary/50 transition-colors shadow-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <Badge variant="outline" className="text-[10px] font-semibold rounded-[4px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                            {b.strategyLabel}
                          </Badge>
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            -{b.discountPercent}%
                          </span>
                        </div>
                        <p className="text-xs font-bold text-foreground line-clamp-2">
                          {b.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {b.description}
                        </p>

                        <div className="space-y-1 pt-1 border-t border-border">
                          {b.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                              {it.thumbnail ? (
                                <img
                                  src={it.thumbnail}
                                  alt={it.name}
                                  className="size-5 rounded-[2px] object-cover shrink-0 border border-border"
                                />
                              ) : (
                                <div className="size-5 rounded-[2px] bg-muted text-[9px] font-bold flex items-center justify-center shrink-0 border border-border">
                                  {it.name ? it.name.charAt(0) : 'P'}
                                </div>
                              )}
                              <span className="truncate text-foreground/90 flex-1">{it.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border space-y-2">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-[10px] text-muted-foreground line-through font-mono">
                            {Number(b.totalOriginalPrice).toLocaleString('vi-VN')} đ
                          </span>
                          <span className="font-mono font-bold text-primary">
                            {Number(b.suggestedPrice).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleApplyBundle(b)}
                          className="h-7 w-full text-xs rounded-[4px] font-semibold active:scale-[0.98] transition-transform cursor-pointer"
                        >
                          Sử dụng combo này
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bảng danh sách sản phẩm trong combo */}
            <div className="rounded-[6px] border border-border overflow-hidden bg-background">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Ảnh</th>
                    <th className="py-2.5 px-3">Sản phẩm</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá gốc</th>
                    <th className="py-2.5 px-3 text-center w-36">SL trong combo</th>
                    <th className="py-2.5 px-3 text-right">Thành tiền gốc</th>
                    <th className="py-2.5 px-3 text-center w-12">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-7 px-4 text-center">
                        <div className="max-w-md mx-auto space-y-2.5">
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            Chưa có sản phẩm nào trong combo. Gõ tên hoặc SKU ở trên để thêm sản phẩm, hoặc dùng AI để đề xuất gói combo tối ưu từ kho hàng.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLoadAiBundles}
                            disabled={aiSuggestBundlesMutation.isPending}
                            className="h-7 text-xs border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-semibold cursor-pointer active:scale-[0.98] transition-transform"
                          >
                            {aiSuggestBundlesMutation.isPending ? 'Đang quét kho hàng...' : 'AI gợi ý tạo combo'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((item, index) => {
                      const itemTotal = (item.originalPrice || 0) * (item.quantity || 1);
                      return (
                        <tr key={item.productId || index} className="hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 px-3 text-center">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="size-8 rounded-[4px] border border-border object-cover mx-auto"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className={`size-8 rounded-[4px] border border-border bg-muted items-center justify-center font-bold text-xs uppercase text-muted-foreground mx-auto ${
                                item.thumbnail ? 'hidden' : 'flex'
                              }`}
                            >
                              {item.name ? item.name.charAt(0) : 'P'}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-foreground line-clamp-1">{item.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                              <span>SKU: {item.sku || '—'}</span>
                              <span>•</span>
                              <span>Tồn kho: {item.stock}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                            {Number(item.originalPrice).toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(index, -1)}
                                className="size-6 rounded-[4px] border border-border bg-muted flex items-center justify-center text-foreground hover:bg-accent active:scale-[0.98] transition-transform"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-bold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(index, 1)}
                                className="size-6 rounded-[4px] border border-border bg-muted flex items-center justify-center text-foreground hover:bg-accent active:scale-[0.98] transition-transform"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-foreground">
                            {itemTotal.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 rounded-[4px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* DÒNG TỔNG TIỀN GỐC - ĐÚNG THEO YÊU CẦU CỦA USER */}
                {selectedItems.length > 0 && (
                  <tfoot className="bg-muted/40 border-t border-border font-medium">
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-right font-semibold text-foreground">
                        Tổng giá trị gốc của các sản phẩm:
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-sm text-foreground tabular-nums">
                        {totalOriginalPrice.toLocaleString('vi-VN')} đ
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* KHỐI 3: ĐỊNH GIÁ COMBO & GỢI Ý MỨC GIÁ HỢP LÝ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Thiết lập Giá bán Combo & Mức ưu đãi
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Đưa ra mức giá combo hợp lý dựa trên tổng giá trị gốc của sản phẩm
                </p>
              </div>

              {/* Action buttons & Segmented control chuyển đổi Giá cố định vs Giảm giá */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTriggerAiSuggestion}
                  disabled={aiSuggestMutation.isPending || selectedItems.length < 2}
                  className="h-7 text-xs border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-semibold cursor-pointer active:scale-[0.98] transition-transform"
                >
                  {aiSuggestMutation.isPending ? 'AI đang phân tích...' : 'AI gợi ý giá bán'}
                </Button>

                <div className="flex rounded-[6px] border border-border p-0.5 bg-muted">
                  <button
                    type="button"
                    onClick={() => setPricingStrategy('fixed_price')}
                    className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all ${
                      pricingStrategy === 'fixed_price'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Giá trị combo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingStrategy('discount')}
                    className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-all ${
                      pricingStrategy === 'discount'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Giảm giá
                  </button>
                </div>
              </div>
            </div>

            {/* AI GEMINI RECOMMENDATION BOX */}
            {aiSuggestionData && (
              <div className="rounded-[6px] border border-primary/30 bg-primary/5 p-3.5 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-primary">
                      Gợi ý từ Trợ lý AI:
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-foreground">
                        {aiSuggestionData.marketingTitle}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyAiName(aiSuggestionData.marketingTitle)}
                        className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                      >
                        [Dùng tên này]
                      </button>
                    </div>
                    {aiSuggestionData.slogan && (
                      <p className="text-[11px] text-muted-foreground italic">
                        "{aiSuggestionData.slogan}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAiSuggestionData(null)}
                    className="text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                    title="Đóng gợi ý AI"
                  >
                    <X size={14} />
                  </button>
                </div>

                {aiSuggestionData.analysis && (
                  <p className="text-xs text-foreground/80 bg-background/80 p-2 rounded-[4px] border border-border/60">
                    <strong>Phân tích chiến lược:</strong> {aiSuggestionData.analysis}
                  </p>
                )}

                {/* 3 Strategy cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                  {aiSuggestionData.options?.map((opt, idx) => {
                    const isBest = opt.strategy === 'best_choice' || idx === 0;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-[6px] border flex flex-col justify-between transition-all ${
                          isBest
                            ? 'border-primary bg-background shadow-xs ring-1 ring-primary/40'
                            : 'border-border bg-background hover:border-primary/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">
                              {opt.label}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-mono rounded-[4px] px-1.5 py-0 ${
                                isBest
                                  ? 'bg-primary/10 text-primary border-primary/30'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}
                            >
                              -{opt.discountPercent}%
                            </Badge>
                          </div>
                          <div className="text-sm font-mono font-bold text-primary tabular-nums">
                            {Number(opt.suggestedPrice).toLocaleString('vi-VN')} đ
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Tiết kiệm: {Number(opt.savingsAmount).toLocaleString('vi-VN')} đ
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 pt-0.5">
                            {opt.reason}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant={isBest ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleApplyAiOption(opt)}
                          className="mt-2.5 h-7 w-full text-xs rounded-[4px] font-semibold active:scale-[0.98] transition-transform cursor-pointer"
                        >
                          Áp dụng giá này
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input theo chiến lược định giá */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {pricingStrategy === 'fixed_price' ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    Giá bán thực tế của Combo <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="Nhập giá bán combo..."
                      value={comboPriceInput}
                      onChange={(e) => setComboPriceInput(e.target.value)}
                      className="h-10 rounded-[6px] text-sm font-mono font-bold tabular-nums pr-10"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-semibold">
                      đ
                    </span>
                  </div>

                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    Mức giảm giá so với Tổng tiền gốc <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="h-10 px-2 text-xs rounded-[6px] border border-input bg-background font-semibold cursor-pointer"
                    >
                      <option value="amount">Tiền mặt (đ)</option>
                      <option value="percent">Phần trăm (%)</option>
                    </select>
                    <div className="col-span-2 relative">
                      <Input
                        type="number"
                        min="0"
                        placeholder={discountType === 'percent' ? 'Ví dụ: 15' : 'Ví dụ: 50000'}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value) || 0))}
                        className="h-10 rounded-[6px] text-sm font-mono font-bold tabular-nums pr-10"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-semibold">
                        {discountType === 'percent' ? '%' : 'đ'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD TỔNG KẾT & SO SÁNH GIÁ (TIẾT KIỆM) */}
              <div className="rounded-[6px] border border-border bg-muted/30 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tổng giá trị gốc:</span>
                  <span className="font-mono text-muted-foreground line-through tabular-nums">
                    {totalOriginalPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Giá bán gói combo:</span>
                  <span className="font-mono font-bold text-base text-primary tabular-nums">
                    {finalComboPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Khách tiết kiệm được:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {savingsAmount.toLocaleString('vi-VN')} đ
                    </span>
                    <Badge variant="outline" className="rounded-[4px] text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-1.5 py-0">
                      -{savingsPercent}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 py-3.5 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-[6px] text-xs h-8"
            disabled={isSubmitting}
          >
            Hủy
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedItems.length < 2}
            className="rounded-[6px] text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform font-semibold"
          >
            {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật combo' : 'Tạo combo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
