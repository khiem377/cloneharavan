import { useState, useEffect } from 'react';
import { flashSaleService } from '@/services/flashSale.service';
import { productService } from '@/services/product.service';
import { productVariantService } from '@/services/productVariant.service';
import { toast } from '@/providers/ToastProvider';
import {
  calculateFinalPrice,
  mapInitialFlashSaleItems,
  createItemFromProduct,
  createItemFromVariant,
} from './flashSaleUtils';

export function useFlashSaleForm({ flashSale, onClose, onSuccess }) {
  const isEdit = Boolean(flashSale);

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

  const [items, setItems] = useState(() => mapInitialFlashSaleItems(flashSale?.items || []));

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

  const handleSelectProduct = (product) => {
    const exists = items.some((i) => i.productId === product._id && !i.variantId);
    if (exists) {
      toast.error('Sản phẩm gốc này đã có trong danh sách Flash Sale');
      return;
    }
    const newItem = createItemFromProduct(product, 30);
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
    const newItem = createItemFromVariant(product, variant, 30);
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

  return {
    isEdit,
    name,
    setName,
    description,
    setDescription,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isActive,
    setIsActive,
    banner,
    setBanner,
    showMediaPicker,
    setShowMediaPicker,
    items,
    productSearch,
    setProductSearch,
    searchResults,
    searching,
    showProductDropdown,
    setShowProductDropdown,
    saving,
    bulkDiscountType,
    setBulkDiscountType,
    bulkDiscountValue,
    setBulkDiscountValue,
    handleSelectProduct,
    handleSelectVariant,
    handleDiscountTypeChange,
    handleDiscountValueChange,
    handleStockChange,
    handleApplyBulkDiscount,
    handleRemoveItem,
    handleSubmit,
  };
}
