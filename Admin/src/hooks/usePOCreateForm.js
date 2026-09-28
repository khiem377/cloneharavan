import { useState } from 'react';

/**
 * usePOCreateForm — tách state logic khỏi PurchaseOrderCreatePage.
 * 
 * Gom 9 useState liên quan nhau vào 1 hook:
 *   currentStep, supplierId, note, deliveryDate, productSearch,
 *   items, excelHtml, loadingExcel, subType, referenceDoc
 */
export function usePOCreateForm(initialSupplierId = '') {
  // Wizard step (1: form, 2: preview, 3: confirm)
  const [currentStep, setCurrentStep] = useState(1);

  // Core form fields
  const [supplierId, setSupplierId] = useState(initialSupplierId);
  const [note, setNote] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [subType, setSubType] = useState('PO_PURCHASE');
  const [referenceDoc, setReferenceDoc] = useState('');

  // Items table
  const [items, setItems] = useState([]);

  // Product search input
  const [productSearch, setProductSearch] = useState('');

  // Excel preview state (step 2)
  const [excelHtml, setExcelHtml] = useState('');
  const [loadingExcel, setLoadingExcel] = useState(false);

  // ── Item helpers ─────────────────────────────────────────────────────────────
  const addItem = (item) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item._id && i.variantId === item.variantId
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          expectedQty: updated[existingIndex].expectedQty + 1,
          actualQty:   updated[existingIndex].actualQty   + 1,
          subtotal: (updated[existingIndex].actualQty + 1) * updated[existingIndex].importPrice,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId:   item._id,
          variantId:   item.variantId || null,
          sku:         item.sku || '',
          productName: item.name,
          unit:        item.unit || 'Cái',
          location:    'Kệ A1',
          expectedQty: 1,
          actualQty:   1,
          importPrice: item.costPrice || item.price || 0,
          discountAmount: 0,
          subtotal:    item.costPrice || item.price || 0,
        },
      ];
    });
    setProductSearch('');
  };

  const updateItem = (index, field, val) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: val };
      if (['actualQty', 'importPrice', 'discountAmount'].includes(field)) {
        const qty      = Number(item.actualQty || 0);
        const price    = Number(item.importPrice || 0);
        const discount = Number(item.discountAmount || 0);
        item.subtotal  = Math.max(0, qty * price - discount);
      }
      updated[index] = item;
      return updated;
    });
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const autoFillAll = () => {
    setItems((prev) =>
      prev.map((item) => {
        const exp      = Number(item.expectedQty || 1);
        const price    = Number(item.importPrice || 0);
        const discount = Number(item.discountAmount || 0);
        return { ...item, actualQty: exp, subtotal: Math.max(0, exp * price - discount) };
      })
    );
  };

  // ── Computed ─────────────────────────────────────────────────────────────────
  const totalQuantity = items.reduce((acc, i) => acc + Number(i.actualQty || 0), 0);
  const totalAmount   = items.reduce((acc, i) => acc + Number(i.subtotal  || 0), 0);

  return {
    // Step
    currentStep, setCurrentStep,
    // Form
    supplierId, setSupplierId,
    note, setNote,
    deliveryDate, setDeliveryDate,
    subType, setSubType,
    referenceDoc, setReferenceDoc,
    // Items
    items, setItems,
    addItem, updateItem, removeItem, autoFillAll,
    // Search
    productSearch, setProductSearch,
    // Excel preview
    excelHtml, setExcelHtml,
    loadingExcel, setLoadingExcel,
    // Computed
    totalQuantity, totalAmount,
  };
}

export default usePOCreateForm;
