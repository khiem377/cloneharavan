import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCreatePurchaseOrder } from '@/hooks/useInventory';
import { useSearchInventoryProducts } from '@/hooks/useProducts';
import { inventoryService } from '@/services/inventory.service';
import { warehouseService } from '@/services/warehouse.service';
import { toast } from '@/providers/ToastProvider';

export function usePOCreateForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSupplierId = searchParams.get('supplierId') || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [supplierId, setSupplierId] = useState(initialSupplierId);
  const [warehouseId, setWarehouseId] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [note, setNote] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [items, setItems] = useState([]);
  const [subType, setSubType] = useState('PO_PURCHASE');
  const [referenceDoc, setReferenceDoc] = useState('');

  const [excelHtml, setExcelHtml] = useState('');
  const [loadingExcel, setLoadingExcel] = useState(false);

  useEffect(() => {
    const loadWh = async () => {
      try {
        const whRes = await warehouseService.getWarehouses();
        const list = whRes.data?.data?.data || [];
        setWarehouses(list);
        const def = list.find((w) => w.isDefault) || list[0];
        if (def) setWarehouseId(def._id);
      } catch (err) {
        console.warn('Lỗi tải danh sách kho:', err);
      }
    };
    loadWh();
  }, []);

  const { data: supplierRes = {} } = useSuppliers({ limit: 100, isActive: 'true' });
  const suppliers = supplierRes.data || [];
  const selectedSupplier = suppliers.find((s) => s._id === supplierId);

  const { data: searchResults = [], isLoading: isSearching } = useSearchInventoryProducts(productSearch);
  const createPOMutation = useCreatePurchaseOrder();

  const handleAutoFillReceiveAll = () => {
    const updated = items.map((item) => {
      const exp = Number(item.expectedQty || 1);
      const price = Number(item.importPrice || 0);
      const discount = Number(item.discountAmount || 0);
      return {
        ...item,
        actualQty: exp,
        subtotal: Math.max(0, exp * price - discount),
      };
    });
    setItems(updated);
    toast.success('Đã tự động đánh dấu nhập đủ số lượng theo chứng từ!');
  };

  const handleAddProductOrVariant = (item) => {
    const existingIndex = items.findIndex((i) => i.productId === item._id && i.variantId === item.variantId);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].expectedQty += 1;
      updated[existingIndex].actualQty += 1;
      updated[existingIndex].subtotal = updated[existingIndex].actualQty * updated[existingIndex].importPrice;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: item._id,
          variantId: item.variantId || null,
          sku: item.sku || '',
          productName: item.name,
          unit: item.unit || 'Cái',
          location: 'Kệ A1',
          expectedQty: 1,
          actualQty: 1,
          importPrice: item.costPrice || item.price || 0,
          discountAmount: 0,
          subtotal: item.costPrice || item.price || 0,
        },
      ]);
    }
    setProductSearch('');
  };

  const handleUpdateItem = (index, field, val) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: val };
    if (field === 'actualQty' || field === 'importPrice' || field === 'discountAmount') {
      const qty = Number(item.actualQty || 0);
      const price = Number(item.importPrice || 0);
      const discount = Number(item.discountAmount || 0);
      item.subtotal = Math.max(0, qty * price - discount);
    }
    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalQuantity = items.reduce((acc, i) => acc + Number(i.actualQty || 0), 0);
  const totalAmount = items.reduce((acc, i) => acc + Number(i.subtotal || 0), 0);

  const handleGoToStep2 = async () => {
    if (!supplierId) {
      toast.error('Vui lòng chọn Nhà cung cấp!');
      return;
    }
    if (items.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm / biến thể nhập kho!');
      return;
    }

    try {
      setLoadingExcel(true);
      setCurrentStep(2);
      const res = await inventoryService.previewPOExcel({
        supplierId,
        note,
        deliveryDate,
        items,
      });

      const workbook = XLSX.read(res.data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const html = XLSX.utils.sheet_to_html(worksheet, { id: 'excel-wizard-table' });
      setExcelHtml(html);
    } catch (err) {
      toast.error('Lỗi khi dựng file Excel xem trước: ' + (err.message || 'Có lỗi xảy ra'));
      setCurrentStep(1);
    } finally {
      setLoadingExcel(false);
    }
  };

  const handleSubmit = async (submitStatus) => {
    try {
      await createPOMutation.mutateAsync({
        supplierId,
        warehouseId,
        note,
        deliveryDate,
        status: submitStatus,
        items,
      });

      toast.success(
        submitStatus === 'completed'
          ? 'Đã tạo đơn và nhập kho thành công! Tồn kho đã được tự động cộng.'
          : 'Lưu bản nháp Đơn nhập kho thành công!'
      );
      navigate('/purchase-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn nhập kho');
    }
  };

  return {
    navigate,
    currentStep,
    setCurrentStep,
    supplierId,
    setSupplierId,
    warehouseId,
    setWarehouseId,
    warehouses,
    note,
    setNote,
    deliveryDate,
    setDeliveryDate,
    productSearch,
    setProductSearch,
    items,
    subType,
    setSubType,
    referenceDoc,
    setReferenceDoc,
    excelHtml,
    loadingExcel,
    suppliers,
    selectedSupplier,
    searchResults,
    isSearching,
    createPOMutation,
    totalQuantity,
    totalAmount,
    handleAutoFillReceiveAll,
    handleAddProductOrVariant,
    handleUpdateItem,
    handleRemoveItem,
    handleGoToStep2,
    handleSubmit,
  };
}
