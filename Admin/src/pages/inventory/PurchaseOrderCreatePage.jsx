import React, { useState, useEffect } from 'react';
import {
  FileCheck, Plus, Trash2, Building2, SearchIcon as Search, CheckCircle2,
  ArrowLeft, ArrowRight, Package, FileSpreadsheet, RefreshCw,
  ChevronRightIcon as ChevronRight, ShieldCheck, Save, FileText,
} from '@/components/ui/Icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSuppliers } from '@/hooks/useSuppliers';
import SearchableSelect from '@/components/ui/SearchableSelect';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { useCreatePurchaseOrder } from '@/hooks/useInventory';
import { useSearchInventoryProducts } from '@/hooks/useProducts';
import { inventoryService } from '@/services/inventory.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { toast } from '@/providers/ToastProvider';
import * as XLSX from 'xlsx';

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
    <Input
      type="text"
      className={`h-8 rounded-[6px] text-xs font-mono tabular-nums ${className}`}
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/purchase-orders')}
            className="h-9 w-9 rounded-[6px] border-border text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              Tạo Đơn Nhập Kho Mới
            </h1>
            <p className="text-xs text-muted-foreground">
              Quy trình 3 bước chuẩn hoá: Lập đơn -&gt; Xem trước bảng kê Excel -&gt; Xác nhận chốt đơn
            </p>
          </div>
        </div>
      </div>

      {/* STEPPER PROGRESS BAR */}
      <Card className="rounded-[6px] border border-border shadow-none bg-card p-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 transition-colors active:scale-[0.98] ${
              currentStep === 1 ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              1
            </div>
            <span className="text-xs font-semibold flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> BƯỚC 1: Lập Đơn & Chọn Hàng
            </span>
          </button>

          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (supplierId && items.length > 0) handleGoToStep2();
            }}
            className={`flex items-center gap-2 transition-colors active:scale-[0.98] ${
              currentStep === 2 ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              2
            </div>
            <span className="text-xs font-semibold flex items-center gap-1">
              <FileSpreadsheet className="h-3.5 w-3.5" /> BƯỚC 2: Xem Trước File Excel (.xlsx)
            </span>
          </button>

          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => {
              if (supplierId && items.length > 0) setCurrentStep(3);
            }}
            className={`flex items-center gap-2 transition-colors active:scale-[0.98] ${
              currentStep === 3 ? 'text-emerald-600 font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              3
            </div>
            <span className="text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> BƯỚC 3: Chốt Đơn & Nhập Kho
            </span>
          </button>
        </div>
      </Card>

      {/* BƯỚC 1: LẬP ĐƠN & CHỌN HÀNG */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column: Supplier & Info */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="rounded-[6px] border border-border shadow-none">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Thông Tin Nhà Cung Cấp
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
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
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
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
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Chứng Từ Tham Chiếu</label>
                    <Input
                      type="text"
                      value={referenceDoc}
                      onChange={(e) => setReferenceDoc(e.target.value)}
                      placeholder="Ví dụ: DMH00028, PNK00039..."
                      className="h-9 rounded-[6px] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hẹn Ngày Nhận Hàng</label>
                    <DateTimePicker
                      value={deliveryDate}
                      onChange={(val) => setDeliveryDate(val)}
                      showTime={false}
                      placeholder="Chọn ngày hẹn nhận hàng..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ghi Chú Đơn Nhập</label>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú đợt nhập hàng, số hóa đơn chứng từ..."
                      className="w-full rounded-[6px] border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary Box */}
              <Card className="rounded-[6px] border border-border shadow-none">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-sm font-semibold text-foreground">Tạm Tính Đơn</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tổng số mặt hàng:</span>
                    <span className="font-semibold text-foreground tabular-nums font-mono">{items.length} mục</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tổng SL thực nhập:</span>
                    <span className="font-semibold text-foreground tabular-nums font-mono">{totalQuantity} cái</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2.5">
                    <span>Tổng Giá Trị Đơn:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      {totalAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Autocomplete Search with Variants */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="rounded-[6px] border border-border shadow-none">
                <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Danh Sách Sản Phẩm / Biến Thể Nhập Kho
                  </CardTitle>
                  {items.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoFillReceiveAll}
                      className="h-7 text-xs font-semibold rounded-[6px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 active:scale-[0.98]"
                      title="Tự động điền SL Thực nhập = SL Chứng từ cho tất cả mặt hàng"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Đánh dấu nhập đủ
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Search Bar supporting Variants */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Tìm theo tên sản phẩm, mã SKU hoặc biến thể (Màu sắc, Size)..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-9 h-9 rounded-[6px] text-xs"
                    />

                    {productSearch.trim() && (
                      <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-[6px] border border-border bg-card shadow-md divide-y divide-border/60">
                        {isSearching ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">Đang tìm biến thể sản phẩm...</div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">
                            Không tìm thấy sản phẩm / biến thể nào
                          </div>
                        ) : (
                          searchResults.map((resItem, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleAddProductOrVariant(resItem)}
                              className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors active:scale-[0.99]"
                            >
                              <div>
                                <div className="font-medium text-xs text-foreground">{resItem.name}</div>
                                <div className="text-[11px] text-muted-foreground font-mono tabular-nums">
                                  SKU: {resItem.sku || '-'} | Tồn hiện tại:{' '}
                                  <span className="font-bold text-emerald-600">{resItem.stock || 0}</span>
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
                  <div className="rounded-[6px] border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="text-xs font-semibold text-muted-foreground py-2.5">Sản Phẩm / Biến Thể</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-20">ĐVT</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-24">SL Chứng Từ</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-24">SL Thực Nhập</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-32">Đơn Giá Nhập</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-32">Chiết Khấu (VND)</TableHead>
                          <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-32">Thành Tiền</TableHead>
                          <TableHead className="w-10 py-2.5"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                              Chưa chọn sản phẩm/biến thể nào. Tìm kiếm phía trên để thêm vào đơn.
                            </TableCell>
                          </TableRow>
                        ) : (
                          items.map((item, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/30">
                              <TableCell className="py-2">
                                <div className="font-medium text-xs text-foreground">{item.productName}</div>
                                <div className="text-[11px] text-muted-foreground font-mono tabular-nums">{item.sku}</div>
                              </TableCell>
                              <TableCell className="py-2">
                                <Input
                                  type="text"
                                  value={item.unit}
                                  onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                                  className="h-8 rounded-[6px] text-xs"
                                />
                              </TableCell>
                              <TableCell className="py-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.expectedQty}
                                  onChange={(e) => handleUpdateItem(idx, 'expectedQty', Number(e.target.value))}
                                  className="h-8 rounded-[6px] text-xs font-mono font-semibold tabular-nums"
                                />
                              </TableCell>
                              <TableCell className="py-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.actualQty}
                                  onChange={(e) => handleUpdateItem(idx, 'actualQty', Number(e.target.value))}
                                  className="h-8 rounded-[6px] text-xs font-mono font-semibold tabular-nums text-emerald-600"
                                />
                              </TableCell>
                              <TableCell className="py-2">
                                <PriceInput
                                  value={item.importPrice}
                                  onChange={(val) => handleUpdateItem(idx, 'importPrice', val)}
                                  placeholder="0"
                                />
                              </TableCell>
                              <TableCell className="py-2">
                                <PriceInput
                                  value={item.discountAmount || 0}
                                  onChange={(val) => handleUpdateItem(idx, 'discountAmount', val)}
                                  placeholder="0"
                                  className="text-amber-600 dark:text-amber-400"
                                />
                              </TableCell>
                              <TableCell className="py-2 font-mono font-semibold text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {item.subtotal.toLocaleString('vi-VN')} đ
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="h-7 w-7 rounded-[6px] text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Action Button to Step 2 */}
              <div className="flex justify-end">
                <Button
                  onClick={handleGoToStep2}
                  className="rounded-[6px] bg-primary text-primary-foreground font-semibold px-5 py-2 text-xs flex items-center gap-2 active:scale-[0.98]"
                >
                  <span>Tiếp Theo: Xem Trước File Excel (Bước 2)</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BƯỚC 2: XEM TRƯỚC FILE EXCEL TRỰC TIẾP TRÊN WEB */}
      {currentStep === 2 && (
        <Card className="rounded-[6px] border border-border shadow-none">
          <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-emerald-500/10 text-emerald-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  BƯỚC 2: Xem Trước Phân Tích Bảng Excel (.xlsx)
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  File Excel Mẫu 01-VT được điền dữ liệu tự động cho Nhà cung cấp và các mặt hàng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="h-8 rounded-[6px] text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Quay Lại Chỉnh Sửa
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentStep(3)}
                className="h-8 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-[0.98]"
              >
                <span>Tiếp Theo: Chốt Đơn (Bước 3)</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Rendered Excel Table */}
            <div className="overflow-auto p-4 bg-background border border-border rounded-[6px]">
              {loadingExcel ? (
                <div className="flex py-12 items-center justify-center gap-2 text-muted-foreground text-xs">
                  <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  <span>Đang dựng dữ liệu vào mẫu file Excel...</span>
                </div>
              ) : (
                <div
                  className="excel-wizard-preview border border-border rounded-[6px] p-4 bg-card text-foreground"
                  dangerouslySetInnerHTML={{ __html: excelHtml }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* BƯỚC 3: CHỐT ĐƠN & XÁC NHẬN NHẬP KHO */}
      {currentStep === 3 && (
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="text-center pb-4 border-b border-border">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-2 mx-auto">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">BƯỚC 3: Chốt Đơn Nhập Kho</CardTitle>
              <p className="text-xs text-muted-foreground">
                Lựa chọn Lưu bản nháp hoặc Xác nhận chính thức nhập kho hệ thống
              </p>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2.5 bg-muted/30 p-4 rounded-[6px] border border-border text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nhà cung cấp:</span>
                  <span className="font-bold text-foreground">{selectedSupplier?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hẹn ngày nhận:</span>
                  <span className="font-medium text-foreground">{deliveryDate || 'Hôm nay'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng số mặt hàng:</span>
                  <span className="font-mono font-bold text-foreground tabular-nums">{items.length} loại sản phẩm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng số lượng thực đếm:</span>
                  <span className="font-mono font-bold text-emerald-600 tabular-nums">{totalQuantity} cái</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2.5 text-sm">
                  <span className="font-bold text-foreground">Tổng Giá Trị Nghiệm Thu:</span>
                  <span className="font-mono font-bold text-emerald-600 tabular-nums text-base">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="h-8 rounded-[6px] text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Quay Lại Bảng Excel
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSubmit('draft')}
                    disabled={createPOMutation.isPending}
                    className="h-8 rounded-[6px] text-xs font-medium active:scale-[0.98]"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" /> Lưu Bản Nháp
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmit('completed')}
                    disabled={createPOMutation.isPending}
                    className="h-8 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-[0.98]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    {createPOMutation.isPending ? 'Đang Xử Lý...' : 'Xác Nhận Tạo Đơn & Nhập Kho'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
