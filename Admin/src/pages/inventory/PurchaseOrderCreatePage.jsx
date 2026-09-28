import React, { useState, useEffect } from 'react';
import {
  FileCheck, Plus, Trash2, Building2, SearchIcon as Search, CheckCircle2,
  ArrowLeft, ArrowRight, Package, FileSpreadsheet, RefreshCw, Printer,
  ChevronRightIcon as ChevronRight, ShieldCheck, Save, FileText,
} from '@/components/ui/Icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSuppliers } from '@/hooks/useSuppliers';
import SearchableSelect from '@/components/ui/SearchableSelect';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { useCreatePurchaseOrder } from '@/hooks/useInventory';
import { useSearchInventoryProducts } from '@/hooks/useProducts';
import { inventoryService } from '@/services/inventory.service';
function formatVND(val) {
  if (!val && val !== 0) return '';
  return Number(val).toLocaleString('vi-VN');
}

function parseVND(str) {
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
      className={className}
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}

export default function PurchaseOrderCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSupplierId = searchParams.get('supplierId') || '';

  // Wizard Step State (1: Điền Đơn, 2: Preview Excel, 3: Chốt Nhập Kho)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [supplierId, setSupplierId] = useState(initialSupplierId);
  const [note, setNote] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [items, setItems] = useState([]);

  // Step 2 Excel Preview State
  const [excelHtml, setExcelHtml] = useState('');
  const [loadingExcel, setLoadingExcel] = useState(false);

  // Fetch Suppliers & Search Products / Variants
  const { data: supplierRes = {} } = useSuppliers({ limit: 100, isActive: 'true' });
  const suppliers = supplierRes.data || [];
  const selectedSupplier = suppliers.find((s) => s._id === supplierId);

  const { data: searchResults = [], isLoading: isSearching } = useSearchInventoryProducts(productSearch);

  const createPOMutation = useCreatePurchaseOrder();

  const [subType, setSubType] = useState('PO_PURCHASE'); // 'PO_PURCHASE' | 'CUSTOMER_RETURN' | 'OTHER_IMPORT'
  const [referenceDoc, setReferenceDoc] = useState('');

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

  // Load Step 2 Excel Preview
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

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/purchase-orders')}
            className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileCheck className="h-7 w-7 text-primary" />
              Tạo Đơn Nhập Kho Mới
            </h1>
            <p className="text-sm text-muted-foreground">
              Quy trình 3 bước bán tự động: Lập đơn ➔ Xem trước file Excel ➔ Xác nhận chốt đơn
            </p>
          </div>
        </div>
      </div>

      {/* STEPPER PROGRESS BAR */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Step 1 */}
          <div
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 cursor-pointer ${currentStep === 1 ? 'text-primary font-bold' : 'text-muted-foreground'
              }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${currentStep === 1 ? 'bg-primary text-primary-foreground shadow' : 'bg-muted text-muted-foreground'
                }`}
            >
              1
            </div>
            <span className="text-sm font-semibold flex items-center gap-1">
              <FileText className="h-4 w-4" /> BƯỚC 1: Lập Đơn & Chọn Hàng
            </span>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground" />

          {/* Step 2 */}
          <div
            onClick={() => {
              if (supplierId && items.length > 0) handleGoToStep2();
            }}
            className={`flex items-center gap-2 cursor-pointer ${currentStep === 2 ? 'text-primary font-bold' : 'text-muted-foreground'
              }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${currentStep === 2 ? 'bg-primary text-primary-foreground shadow' : 'bg-muted text-muted-foreground'
                }`}
            >
              2
            </div>
            <span className="text-sm font-semibold flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4" /> BƯỚC 2: Xem Trước File Excel (.xlsx)
            </span>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground" />

          {/* Step 3 */}
          <div
            onClick={() => {
              if (supplierId && items.length > 0) setCurrentStep(3);
            }}
            className={`flex items-center gap-2 cursor-pointer ${currentStep === 3 ? 'text-emerald-600 font-bold' : 'text-muted-foreground'
              }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${currentStep === 3 ? 'bg-emerald-600 text-white shadow' : 'bg-muted text-muted-foreground'
                }`}
            >
              3
            </div>
            <span className="text-sm font-semibold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> BƯỚC 3: Chốt Đơn & Nhập Kho
            </span>
          </div>
        </div>
      </div>

      {/* BƯỚC 1: LẬP ĐƠN & CHỌN HÀNG */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column: Supplier & Info */}
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  Thông Tin Nhà Cung Cấp
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Loại Phiếu Nhập Kho <span className="text-destructive">*</span>
                  </label>
                  <SearchableSelect
                    options={[
                      { label: 'Nhập kho mua hàng (PO)', value: 'PO_PURCHASE' },
                      { label: 'Hàng bán bị trả lại', value: 'CUSTOMER_RETURN' },
                      { label: 'Nhập kho khác / Tăng kho', value: 'OTHER_IMPORT' },
                    ]}
                    value={subType}
                    onChange={(val) => setSubType(val)}
                    creatable={false}
                    placeholder="Chọn loại phiếu..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Chọn Nhà Cung Cấp <span className="text-destructive">*</span>
                  </label>
                  <SearchableSelect
                    options={suppliers.map((sup) => ({
                      label: `${sup.name} (${sup.code})`,
                      value: sup._id,
                    }))}
                    value={supplierId}
                    onChange={(val) => setSupplierId(val)}
                    creatable={false}
                    placeholder="-- Chọn nhà cung cấp --"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Chứng Từ Tham Chiếu</label>
                  <input
                    type="text"
                    value={referenceDoc}
                    onChange={(e) => setReferenceDoc(e.target.value)}
                    placeholder="Ví dụ: DMH00028, PNK00039..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Hẹn Ngày Nhận Hàng</label>
                  <DateTimePicker
                    value={deliveryDate}
                    onChange={(val) => setDeliveryDate(val)}
                    showTime={false}
                    placeholder="Chọn ngày hẹn nhận hàng..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Ghi Chú Đơn Nhập</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú đợt nhập hàng, số hóa đơn chứng từ..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Summary Box */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
                <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">Tạm Tính Đơn</h2>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng số mặt hàng:</span>
                  <span className="font-semibold text-foreground">{items.length} mục</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng SL thực nhập:</span>
                  <span className="font-semibold text-foreground">{totalQuantity} cái</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground border-t border-border pt-3">
                  <span>Tổng Giá Trị Đơn:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Autocomplete Search with Variants */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Danh Sách Sản Phẩm / Biến Thể Nhập Kho
                  </h2>
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAutoFillReceiveAll}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="Tự động điền SL Thực nhập = SL Chứng từ cho tất cả mặt hàng"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đánh dấu nhập đủ
                    </button>
                  )}
                </div>

                {/* Search Bar supporting Variants */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="text"
                    placeholder="Tìm theo tên sản phẩm, mã SKU hoặc biến thể (Màu sắc, Size)..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  {productSearch.trim() && (
                    <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg divide-y divide-border/60">
                      {isSearching ? (
                        <div className="p-3 text-center text-sm text-muted-foreground">Đang tìm biến thể sản phẩm...</div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-3 text-center text-sm text-muted-foreground">
                          Không tìm thấy sản phẩm / biến thể nào
                        </div>
                      ) : (
                        searchResults.map((resItem, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleAddProductOrVariant(resItem)}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="font-semibold text-sm text-foreground">{resItem.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                SKU: {resItem.sku || '-'} | Tồn hiện tại: <span className="font-bold text-emerald-600">{resItem.stock || 0}</span>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-primary flex items-center gap-1">
                              <Plus className="h-3.5 w-3.5" /> Thêm Hàng
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="p-3">Sản Phẩm / Biến Thể</th>
                        <th className="p-3 w-20">ĐVT</th>
                        <th className="p-3 w-24">SL Chứng Từ</th>
                        <th className="p-3 w-24">SL Thực Nhập</th>
                        <th className="p-3 w-32">Đơn Giá Nhập</th>
                        <th className="p-3 w-32">Chiết Khấu (VND)</th>
                        <th className="p-3 w-32">Thành Tiền</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                            Chưa chọn sản phẩm/biến thể nào. Tìm kiếm phía trên để thêm vào đơn.
                          </td>
                        </tr>
                      ) : (
                        items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="p-3">
                              <div className="font-medium text-foreground">{item.productName}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{item.sku}</div>
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                                className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                min="1"
                                value={item.expectedQty}
                                onChange={(e) => handleUpdateItem(idx, 'expectedQty', Number(e.target.value))}
                                className="w-full rounded border border-input bg-background px-2 py-1 text-xs font-semibold"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                min="0"
                                value={item.actualQty}
                                onChange={(e) => handleUpdateItem(idx, 'actualQty', Number(e.target.value))}
                                className="w-full rounded border border-input bg-background px-2 py-1 text-xs font-semibold text-emerald-600"
                              />
                            </td>
                            <td className="p-3">
                              <PriceInput
                                value={item.importPrice}
                                onChange={(val) => handleUpdateItem(idx, 'importPrice', val)}
                                className="w-full rounded border border-input bg-background px-2 py-1 text-xs font-mono font-semibold"
                                placeholder="0"
                              />
                            </td>
                            <td className="p-3">
                              <PriceInput
                                value={item.discountAmount || 0}
                                onChange={(val) => handleUpdateItem(idx, 'discountAmount', val)}
                                className="w-full rounded border border-input bg-background px-2 py-1 text-xs font-mono font-semibold text-amber-600 dark:text-amber-400"
                                placeholder="0"
                              />
                            </td>
                            <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                              {item.subtotal.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                className="rounded p-1 text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Button to Step 2 */}
              <div className="flex justify-end">
                <button
                  onClick={handleGoToStep2}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
                >
                  <span>Tiếp Theo: Xem Trước File Excel (Bước 2)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BƯỚC 2: XEM TRƯỚC FILE EXCEL TRỰC TIẾP TRÊN WEB */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">BƯỚC 2: Xem Trước Phân Tích Bảng Excel (.xlsx)</h2>
                  <p className="text-xs text-muted-foreground">
                    File Excel Mẫu 01-VT được điền dữ liệu tự động cho Nhà cung cấp và các mặt hàng
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" /> Quay Lại Chỉnh Sửa
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 transition-all"
                >
                  <span>Tiếp Theo: Chốt Đơn (Bước 3)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Rendered Excel Table */}
            <div className="overflow-auto p-4 bg-background border border-border rounded-xl">
              {loadingExcel ? (
                <div className="flex py-12 items-center justify-center gap-3 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  <span>Đang dựng dữ liệu vào mẫu file Excel...</span>
                </div>
              ) : (
                <div
                  className="excel-wizard-preview border border-border rounded-lg p-6 bg-card text-foreground"
                  dangerouslySetInnerHTML={{ __html: excelHtml }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* BƯỚC 3: CHỐT ĐƠN & XÁC NHẬN NHẬP KHO */}
      {currentStep === 3 && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6">
            <div className="text-center border-b border-border pb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-2">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-foreground">BƯỚC 3: Chốt Đơn Nhập Kho</h2>
              <p className="text-xs text-muted-foreground">
                Lựa chọn Lưu bản nháp hoặc Xác nhận chính thức nhập kho hệ thống
              </p>
            </div>

            <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nhà cung cấp:</span>
                <span className="font-bold text-foreground">{selectedSupplier?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hẹn ngày nhận:</span>
                <span className="font-semibold text-foreground">{deliveryDate || 'Hôm nay'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng số mặt hàng:</span>
                <span className="font-bold text-foreground">{items.length} loại sản phẩm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng số lượng thực đếm:</span>
                <span className="font-bold text-emerald-600">{totalQuantity} cái</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <span className="font-bold text-foreground">Tổng Giá Trị Nghiệm Thu:</span>
                <span className="font-bold text-emerald-600 font-mono text-lg">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-input px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" /> Quay Lại Bảng Excel
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={createPOMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> Lưu Bản Nháp (Draft)
                </button>
                <button
                  onClick={() => handleSubmit('completed')}
                  disabled={createPOMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {createPOMutation.isPending ? 'Đang Xử Lý...' : 'Xác Nhận Tạo Đơn & Nhập Kho Ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .excel-wizard-preview table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Times New Roman', serif, sans-serif;
          font-size: 13px;
        }
        .excel-wizard-preview td, .excel-wizard-preview th {
          border: 1px solid var(--border, #e2e8f0);
          padding: 8px 12px;
          min-width: 80px;
          white-space: pre-wrap;
        }
        .excel-wizard-preview tr:nth-child(even) {
          background-color: rgba(0,0,0, 0.02);
        }
      `}</style>
    </div>
  );
}
