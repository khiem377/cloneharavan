import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, RotateCcw, SearchIcon as Search, Plus, Trash2, Building2,
  DollarSign, FileSpreadsheet, QrCode, CreditCard, Wallet, CheckCircle2,
} from '@/components/ui/Icons';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProducts } from '@/hooks/useProducts';
import { usePurchaseOrders, useCreatePurchaseReturn } from '@/hooks/useInventory';
import { toast } from '@/providers/ToastProvider';
import SearchableSelect from '@/components/ui/SearchableSelect';

export default function PurchaseReturnCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poIdQuery = searchParams.get('poId');

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [note, setNote] = useState('');
  const [shippingFee, setShippingFee] = useState(0); // Chi phí phát sinh trả hàng
  const [refundStatus, setRefundStatus] = useState('unpaid'); // unpaid | paid
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash | transfer | card
  const [returnItems, setReturnItems] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const { data: productsData } = useProducts({ search: productSearch, limit: 10 });
  const { data: poListData } = usePurchaseOrders({ limit: 100 });
  const createMutation = useCreatePurchaseReturn();

  const suppliers = suppliersData?.data || suppliersData?.suppliers || [];
  const products = productsData?.products || productsData?.data || [];
  const poList = poListData?.orders || poListData?.data || [];

  // Nếu chọn trả hàng từ 1 Đơn Nhập Kho (PO) có sẵn
  useEffect(() => {
    if (poIdQuery && poList.length > 0) {
      const matchedPo = poList.find((p) => p._id === poIdQuery);
      if (matchedPo) {
        setSelectedSupplierId(matchedPo.supplierId?._id || matchedPo.supplierId);
        setNote(`Xuất trả hàng từ đơn nhập kho ${matchedPo.poNumber}`);

        const preloaded = matchedPo.items.map((i) => ({
          productId: i.productId?._id || i.productId,
          sku: i.sku || 'SKU-001',
          productName: i.productName,
          unit: i.unit || 'Cái',
          quantity: i.actualQty || i.expectedQty || 1,
          returnPrice: i.importPrice || 0,
          reason: 'Hàng không đúng quy cách / Không đạt chất lượng',
        }));
        setReturnItems(preloaded);
      }
    }
  }, [poIdQuery, poList]);

  const handleAddItem = (prod) => {
    if (returnItems.some((i) => i.productId === prod._id)) {
      toast.info('Sản phẩm đã có trong danh sách xuất trả');
      return;
    }
    setReturnItems([
      ...returnItems,
      {
        productId: prod._id,
        sku: prod.productCode || 'SKU-UNKNOWN',
        productName: prod.name,
        unit: 'Cái',
        quantity: 1,
        returnPrice: prod.price || 0,
        reason: 'Hàng lỗi / Không đạt chất lượng',
      },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...returnItems];
    updated[index][field] = value;
    setReturnItems(updated);
  };

  const handleRemoveItem = (index) => {
    setReturnItems(returnItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () =>
    returnItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.returnPrice || 0), 0);

  const calculateTotalRefund = () => Math.max(0, calculateSubtotal() - Number(shippingFee || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      toast.error('Vui lòng chọn Nhà cung cấp');
      return;
    }
    if (returnItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm xuất trả');
      return;
    }

    const payload = {
      poId: poIdQuery || null,
      supplierId: selectedSupplierId,
      note,
      refundStatus,
      refundAmount: refundStatus === 'paid' ? calculateTotalRefund() : 0,
      items: returnItems,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Tạo phiếu trả hàng nhập cho nhà cung cấp thành công!');
        navigate('/purchase-returns');
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu trả');
      },
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/purchase-returns')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-input bg-background text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Tạo phiếu trả hàng nhập cho Nhà cung cấp
            </h1>
            <p className="text-xs text-muted-foreground">
              Quy trình 4 bước chuẩn Haravan ERP: Chọn NCC, Nhập sản phẩm, Ghi nhận chi phí & Hoàn tiền
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/purchase-returns')}
            className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-md disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            {createMutation.isPending ? 'Đang Xử Lý...' : 'Xác Nhận & Trả Hàng'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Form Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Chọn Nhà Cung Cấp & Kho */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> 1. Thông Tin Nhà Cung Cấp & Kho Xuất
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Nhà Cung Cấp <span className="text-destructive">*</span>
                </label>
                <SearchableSelect
                  options={suppliers.map((s) => ({
                    label: `${s.name} (${s.code || s.taxCode || 'NCC'})`,
                    value: s._id,
                  }))}
                  value={selectedSupplierId}
                  onChange={(val) => setSelectedSupplierId(val)}
                  creatable={false}
                  placeholder="-- Chọn Nhà Cung Cấp --"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Kho Xuất Trả</label>
                <input
                  type="text"
                  readOnly
                  value="Kho Thành Phẩm EGA"
                  className="w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-xs font-semibold text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Ghi Chú Đợt Trả Hàng</label>
              <input
                type="text"
                placeholder="Lý do xuất trả NCC (Ví dụ: Hàng lỗi trầy xước từ đợt PO #PO-1002...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Card 2: Danh sách Sản Phẩm Xuất Trả */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">2. Danh Sách Sản Phẩm Xuất Trả</h3>
              <span className="text-xs text-muted-foreground font-medium">
                Đã chọn: {returnItems.length} mặt hàng
              </span>
            </div>

            {/* Tim kiem san pham */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên hoặc mã SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />

              {productSearch && products.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-xl max-h-48 overflow-auto p-2 space-y-1">
                  {products.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => {
                        handleAddItem(p);
                        setProductSearch('');
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer text-xs"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{p.name}</span>
                        <span className="ml-2 font-mono text-muted-foreground">({p.productCode})</span>
                      </div>
                      <span className="text-xs font-bold text-primary">Tồn: {p.stock || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Table sản phẩm */}
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 font-semibold border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-3">Sản phẩm</th>
                    <th className="p-3 w-20 text-center">SL Trả</th>
                    <th className="p-3 w-32 text-right">Đơn giá xuất trả</th>
                    <th className="p-3 w-36">Lý do lỗi</th>
                    <th className="p-3 w-12 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {returnItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        Chưa có sản phẩm nào được chọn. Gõ tên sản phẩm vào ô tìm kiếm ở trên để thêm vào danh sách.
                      </td>
                    </tr>
                  ) : (
                    returnItems.map((item, idx) => (
                      <tr key={item.productId} className="align-middle">
                        <td className="p-3">
                          <div className="font-semibold text-foreground">{item.productName}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{item.sku}</div>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full rounded-lg border border-input px-2 py-1 text-xs text-center font-bold"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={item.returnPrice}
                            onChange={(e) => handleItemChange(idx, 'returnPrice', Number(e.target.value))}
                            className="w-full rounded-lg border border-input px-2 py-1 text-xs text-right font-mono"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.reason}
                            onChange={(e) => handleItemChange(idx, 'reason', e.target.value)}
                            className="w-full rounded-lg border border-input px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-destructive hover:opacity-80 p-1"
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
        </div>

        {/* Right 1 Column: Summary & Payment (Matching Haravan Step 3 & 4) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" /> 3. Chi Phí & Thanh Toán Hoàn Tiền
            </h3>

            {/* Chi phi phat sinh */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Chi Phí Trả Hàng Phát Sinh (VND)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ví dụ: Tiền bốc xếp 200,000đ"
                value={shippingFee}
                onChange={(e) => setShippingFee(Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Chi phí bốc xếp, vận chuyển phát sinh trong quá trình trả hàng
              </span>
            </div>

            {/* Trang thai hoan tien tu NCC */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="block text-xs font-bold text-foreground">Trạng Thái Thanh Toán NCC</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-xl border border-border hover:bg-muted">
                  <input
                    type="radio"
                    name="refund"
                    value="unpaid"
                    checked={refundStatus === 'unpaid'}
                    onChange={() => setRefundStatus('unpaid')}
                  />
                  <span>Ghi nhận vào Công nợ NCC (Thu tiền sau)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-xl border border-border hover:bg-muted">
                  <input
                    type="radio"
                    name="refund"
                    value="paid"
                    checked={refundStatus === 'paid'}
                    onChange={() => setRefundStatus('paid')}
                  />
                  <span>Đã thu tiền từ Nhà cung cấp ngay</span>
                </label>
              </div>
            </div>

            {/* Phuong thuc thanh toan neu da thu */}
            {refundStatus === 'paid' && (
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-foreground">Hình Thức Thu Tiền</label>
                <SearchableSelect
                  options={[
                    { label: 'Tiền mặt', value: 'cash' },
                    { label: 'Chuyển khoản ngân hàng', value: 'transfer' },
                    { label: 'Quẹt thẻ POS', value: 'card' },
                  ]}
                  value={paymentMethod}
                  onChange={(val) => setPaymentMethod(val)}
                  creatable={false}
                  placeholder="Chọn hình thức..."
                />
              </div>
            )}

            {/* General Calculations Breakdown */}
            <div className="space-y-2 pt-4 border-t border-border text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Tổng giá trị hàng trả:</span>
                <span className="font-mono font-bold text-foreground">
                  {calculateSubtotal().toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Trừ chi phí trả hàng:</span>
                <span className="font-mono font-bold text-destructive">
                  -{Number(shippingFee || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-border text-foreground">
                <span>NCC Phải Hoàn Trả:</span>
                <span className="font-mono font-extrabold text-destructive">
                  {calculateTotalRefund().toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-bold text-xs hover:bg-destructive/90 transition-colors shadow-md disabled:opacity-50"
            >
              {createMutation.isPending ? 'Đang Khởi Tạo...' : '4. Xác Nhận Trả Hàng Kho'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
