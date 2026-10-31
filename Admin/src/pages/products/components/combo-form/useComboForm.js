import { useState, useMemo } from 'react';
import { useSearchInventoryProducts } from '@/hooks/useProducts';
import { useCreateCombo, useUpdateCombo, useAiSuggestComboPricing, useAiSuggestBundles } from '@/hooks/useCombos';
import { toast } from '@/providers/ToastProvider';

export function useComboForm({ initialData, onSuccess, onClose }) {
  const isEditing = !!initialData;
  const createMutation = useCreateCombo();
  const updateMutation = useUpdateCombo();
  const aiSuggestMutation = useAiSuggestComboPricing();
  const aiSuggestBundlesMutation = useAiSuggestBundles();
  const [aiSuggestionData, setAiSuggestionData] = useState(null);
  const [suggestedBundles, setSuggestedBundles] = useState([]);

  const defaultEndDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  };

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

  const [pricingStrategy, setPricingStrategy] = useState(initialData?.pricingStrategy || 'fixed_price');
  const [discountType, setDiscountType] = useState(initialData?.discountType || 'amount');
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue || 0);
  const [comboPriceInput, setComboPriceInput] = useState(
    initialData?.comboPrice !== undefined ? String(initialData.comboPrice) : ''
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: searchResults = [], isLoading: isSearching } = useSearchInventoryProducts(searchQuery);

  const totalOriginalPrice = useMemo(() => {
    return selectedItems.reduce((acc, it) => acc + (Number(it.originalPrice) || 0) * (Number(it.quantity) || 1), 0);
  }, [selectedItems]);

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

  const handleSelectProduct = (product) => {
    const existingIndex = selectedItems.findIndex((it) => it.productId === product._id);
    if (existingIndex > -1) {
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

  return {
    isEditing,
    name,
    setName,
    code,
    setCode,
    isCustomCode,
    setIsCustomCode,
    description,
    setDescription,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isUnlimitedTime,
    setIsUnlimitedTime,
    usageLimit,
    setUsageLimit,
    selectedItems,
    pricingStrategy,
    setPricingStrategy,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    comboPriceInput,
    setComboPriceInput,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    searchResults,
    isSearching,
    totalOriginalPrice,
    finalComboPrice,
    savingsAmount,
    savingsPercent,
    virtualStock,
    limitingProduct,
    handleSelectProduct,
    handleRemoveItem,
    handleQuantityChange,
    handleTriggerAiSuggestion,
    isAiSuggestingPricing: aiSuggestMutation.isPending,
    aiSuggestionData,
    setAiSuggestionData,
    handleApplyAiOption,
    handleApplyAiName,
    suggestedBundles,
    setSuggestedBundles,
    handleLoadAiBundles,
    isAiSuggestingBundles: aiSuggestBundlesMutation.isPending,
    handleApplyBundle,
    handleSubmit,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
}
