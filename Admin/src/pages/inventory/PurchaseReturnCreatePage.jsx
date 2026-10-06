import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, RotateCcw, SearchIcon as Search, Trash2, Building2,
  DollarSign,
} from '@/components/ui/Icons';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProducts } from '@/hooks/useProducts';
import { usePurchaseOrders, useCreatePurchaseReturn } from '@/hooks/useInventory';
import { toast } from '@/providers/ToastProvider';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';

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
    if (e && e.preventDefault) e.preventDefault();
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/purchase-returns')}
            className="h-9 w-9 rounded-[6px] border-border text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-destructive" />
              Tạo phiếu trả hàng nhập cho Nhà cung cấp
            </h1>
            <p className="text-xs text-muted-foreground">
              Quy trình chuẩn: Chọn NCC, Nhập sản phẩm, Ghi nhận chi phí & Hoàn tiền
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/purchase-returns')}
            className="h-8 rounded-[6px] text-xs"
          >
            Hủy Bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            variant="destructive"
            size="sm"
            className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98] transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            {createMutation.isPending ? 'Đang Xử Lý...' : 'Xác Nhận & Trả Hàng'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Form Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Chọn Nhà Cung Cấp & Kho */}
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> 1. Thông Tin Nhà Cung Cấp & Kho Xuất
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
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
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Kho Xuất Trả</label>
                  <Input
                    type="text"
                    readOnly
                    value="Kho Thành Phẩm SHOP"
                    className="h-9 rounded-[6px] text-xs bg-muted text-muted-foreground font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ghi Chú Đợt Trả Hàng</label>
                <Input
                  type="text"
                  placeholder="Lý do xuất trả NCC (Ví dụ: Hàng lỗi trầy xước từ đợt PO #PO-1002...)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-9 rounded-[6px] text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Danh sách Sản Phẩm Xuất Trả */}
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold text-foreground">2. Danh Sách Sản Phẩm Xuất Trả</CardTitle>
              <span className="text-xs text-muted-foreground font-medium tabular-nums font-mono">
                Đã chọn: {returnItems.length} mặt hàng
              </span>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Tim kiem san pham */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm sản phẩm theo tên hoặc mã SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9 h-9 rounded-[6px] text-xs"
                />

                {productSearch && products.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-[6px] border border-border bg-card shadow-md max-h-48 overflow-auto p-1.5 space-y-1">
                    {products.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => {
                          handleAddItem(p);
                          setProductSearch('');
                        }}
                        className="flex items-center justify-between p-2 rounded-[4px] hover:bg-muted cursor-pointer text-xs transition-colors"
                      >
                        <div>
                          <span className="font-medium text-foreground">{p.name}</span>
                          <span className="ml-2 font-mono text-muted-foreground text-[11px]">({p.productCode})</span>
                        </div>
                        <span className="text-xs font-bold text-primary font-mono tabular-nums">Tồn: {p.stock || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Table sản phẩm */}
              <div className="rounded-[6px] border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-muted-foreground py-2.5">Sản phẩm</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-20 text-center">SL Trả</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-32 text-right">Đơn giá xuất trả</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 w-40">Lý do lỗi</TableHead>
                      <TableHead className="w-10 py-2.5 text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                          Chưa có sản phẩm nào được chọn. Gõ tên sản phẩm vào ô tìm kiếm ở trên để thêm vào danh sách.
                        </TableCell>
                      </TableRow>
                    ) : (
                      returnItems.map((item, idx) => (
                        <TableRow key={item.productId} className="hover:bg-muted/30">
                          <TableCell className="py-2">
                            <div className="font-medium text-xs text-foreground">{item.productName}</div>
                            <div className="font-mono text-[11px] text-muted-foreground tabular-nums">{item.sku}</div>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                              className="h-8 rounded-[6px] text-xs text-center font-mono font-bold tabular-nums"
                            />
                          </TableCell>
                          <TableCell className="py-2">
                            <Input
                              type="number"
                              min="0"
                              value={item.returnPrice}
                              onChange={(e) => handleItemChange(idx, 'returnPrice', Number(e.target.value))}
                              className="h-8 rounded-[6px] text-xs text-right font-mono font-semibold tabular-nums"
                            />
                          </TableCell>
                          <TableCell className="py-2">
                            <Input
                              type="text"
                              value={item.reason}
                              onChange={(e) => handleItemChange(idx, 'reason', e.target.value)}
                              className="h-8 rounded-[6px] text-xs"
                            />
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <Button
                              type="button"
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
        </div>

        {/* Right 1 Column: Summary & Payment */}
        <div className="space-y-6">
          <Card className="rounded-[6px] border border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" /> 3. Chi Phí & Thanh Toán Hoàn Tiền
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Chi phi phat sinh */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Chi Phí Trả Hàng Phát Sinh (VND)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Ví dụ: 200000"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="h-9 rounded-[6px] text-xs font-mono tabular-nums"
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Chi phí bốc xếp, vận chuyển phát sinh
                </span>
              </div>

              {/* Trang thai hoan tien tu NCC */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="block text-xs font-medium text-muted-foreground">Trạng Thái Thanh Toán NCC</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2.5 rounded-[6px] border border-border hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="refund"
                      value="unpaid"
                      checked={refundStatus === 'unpaid'}
                      onChange={() => setRefundStatus('unpaid')}
                    />
                    <span>Ghi nhận vào Công nợ NCC (Thu sau)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2.5 rounded-[6px] border border-border hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="refund"
                      value="paid"
                      checked={refundStatus === 'paid'}
                      onChange={() => setRefundStatus('paid')}
                    />
                    <span>Đã thu tiền từ NCC ngay</span>
                  </label>
                </div>
              </div>

              {/* Phuong thuc thanh toan neu da thu */}
              {refundStatus === 'paid' && (
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-medium text-muted-foreground">Hình Thức Thu Tiền</label>
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
              <div className="space-y-2 pt-3 border-t border-border text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tổng giá trị hàng trả:</span>
                  <span className="font-mono font-semibold text-foreground tabular-nums">
                    {calculateSubtotal().toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Trừ chi phí trả hàng:</span>
                  <span className="font-mono font-semibold text-destructive tabular-nums">
                    -{Number(shippingFee || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-border text-foreground">
                  <span>NCC Phải Hoàn Trả:</span>
                  <span className="font-mono font-bold text-destructive tabular-nums text-base">
                    {calculateTotalRefund().toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="destructive"
                disabled={createMutation.isPending}
                className="w-full h-9 rounded-[6px] font-semibold text-xs active:scale-[0.98] transition-all"
              >
                {createMutation.isPending ? 'Đang Khởi Tạo...' : '4. Xác Nhận Trả Hàng Kho'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
