import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileCheck, ArrowLeft, Building2, Package, CheckCircle2,
} from '@/components/ui/Icons';
import { inventoryService } from '@/services/inventory.service';
import { toast } from '@/providers/ToastProvider';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';

export default function StockReceivingCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poIdFromUrl = searchParams.get('poId');

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPoId, setSelectedPoId] = useState(poIdFromUrl || '');
  const [selectedPo, setSelectedPo] = useState(null);

  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pending POs
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await inventoryService.getPurchaseOrders({ limit: 100 });
        const orders = res.data?.orders || res.data?.data || [];
        // Only allow POs that are in receiving workflow (inspecting, arrived, in_transit, partial_received)
        const eligibleStatuses = ['inspecting', 'arrived', 'in_transit', 'partial_received'];
        setPurchaseOrders(orders.filter((o) => eligibleStatuses.includes(o.status)));
      } catch (err) {
        toast.error('Không thể tải danh sách Đơn mua hàng');
      }
    };
    fetchOrders();
  }, []);

  // When PO selected, auto populate items
  useEffect(() => {
    if (!selectedPoId) {
      setSelectedPo(null);
      setItems([]);
      return;
    }

    const foundPo = purchaseOrders.find((o) => o._id === selectedPoId);
    if (foundPo) {
      setSelectedPo(foundPo);
      const mappedItems = (foundPo.items || []).map((item) => {
        const exp = item.expectedQty || 1;
        const recBefore = item.receivedQty || 0;
        const remaining = Math.max(0, exp - recBefore);

        return {
          productId: item.productId,
          variantId: item.variantId || null,
          sku: item.sku || '',
          productName: item.productName,
          unit: item.unit || 'Cái',
          location: 'Kho Tổng - Kệ A1',
          expectedQty: exp,
          receivedBefore: recBefore,
          receivedQty: remaining,
          importPrice: item.importPrice || 0,
          subtotal: remaining * (item.importPrice || 0),
        };
      });
      setItems(mappedItems);
    }
  }, [selectedPoId, purchaseOrders]);

  const handleUpdateItem = (index, field, val) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: val };
    if (field === 'receivedQty' || field === 'importPrice') {
      const q = Number(item.receivedQty || 0);
      const p = Number(item.importPrice || 0);
      item.subtotal = q * p;
    }
    updated[index] = item;
    setItems(updated);
  };

  const handleAutoFillAll = () => {
    const updated = items.map((i) => {
      const remaining = Math.max(0, i.expectedQty - i.receivedBefore);
      return {
        ...i,
        receivedQty: remaining,
        subtotal: remaining * i.importPrice,
      };
    });
    setItems(updated);
    toast.success('Đã tự động điền nhập đủ toàn bộ số lượng đợt này!');
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedPoId) {
      toast.error('Vui lòng chọn Đơn Mua Hàng (PO) cần nhập kho');
      return;
    }

    const activeItems = items.filter((i) => Number(i.receivedQty || 0) > 0);
    if (activeItems.length === 0) {
      toast.error('Số lượng thực nhập đợt này phải lớn hơn 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await inventoryService.createStockReceiving({
        purchaseOrderId: selectedPoId,
        note,
        items: activeItems,
      });

      toast.success('Lập Phiếu Nhập Kho thành công! Tồn kho đã tự động được cộng.');
      navigate('/stock-receivings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi khi lập Phiếu Nhập Kho');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRecQty = items.reduce((acc, i) => acc + Number(i.receivedQty || 0), 0);
  const totalAmount = items.reduce((acc, i) => acc + Number(i.subtotal || 0), 0);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/stock-receivings')}
            className="h-9 w-9 rounded-[6px] border-border text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              Lập Phiếu Nhập Kho Thực Tế (PNK)
            </h1>
            <p className="text-xs text-muted-foreground">
              Nhận hàng thực tế từ Đơn Mua Hàng (PO) và ghi nhận Thẻ kho trực tiếp
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Information */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="rounded-[6px] border border-border shadow-none">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Thông Tin Chứng Từ Nhập
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Chọn Đơn Mua Hàng Tham Chiếu (PO) <span className="text-destructive">*</span>
                  </label>
                  <SearchableSelect
                    options={purchaseOrders.map((po) => ({
                      label: `${po.poNumber} - ${po.supplierId?.name || 'NCC'} [${po.status === 'inspecting' ? 'Đang kiểm hàng' : po.status === 'in_transit' ? 'Đang vận chuyển' : 'Đang thực hiện'}]`,
                      value: po._id,
                    }))}
                    value={selectedPoId}
                    onChange={(val) => setSelectedPoId(val)}
                    creatable={false}
                    placeholder="-- Chọn Đơn Mua Hàng (PO) --"
                  />
                </div>

                {selectedPo && (
                  <div className="rounded-[6px] bg-muted/40 p-3 space-y-1.5 text-xs border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nhà cung cấp:</span>
                      <span className="font-semibold text-foreground">{selectedPo.supplierId?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái PO:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {selectedPo.status === 'partial_received' ? 'Nhập 1 phần' : 'Mới tạo / Chờ nhận'}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ghi Chú Nhập Kho</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú số xe, số hóa đơn đỏ, người giao hàng..."
                    className="w-full rounded-[6px] border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="rounded-[6px] border border-border shadow-none">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-semibold text-foreground">Tổng Cộng Đợt Nhập</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Số mặt hàng:</span>
                  <span className="font-semibold font-mono tabular-nums">{items.length} mục</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tổng SL thực nhập đợt này:</span>
                  <span className="font-semibold font-mono text-emerald-600 tabular-nums">{totalRecQty} cái</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-border pt-3">
                  <span>Giá trị đợt nhập:</span>
                  <span className="font-mono text-primary tabular-nums">{totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedPoId}
                  className="w-full h-9 rounded-[6px] bg-primary text-primary-foreground text-xs font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  {isSubmitting ? 'Đang nhập kho...' : 'Xác Nhận & Nhập Kho'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Items Table */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="rounded-[6px] border border-border shadow-none">
              <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" /> Danh Sách Hàng Hóa Thực Nhập
                </CardTitle>
                {items.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFillAll}
                    className="h-7 text-xs font-semibold rounded-[6px] border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 active:scale-[0.98]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Đánh dấu nhập đủ còn lại
                  </Button>
                )}
              </CardHeader>

              <CardContent className="pt-4">
                <div className="rounded-[6px] border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="text-xs font-semibold text-muted-foreground py-2.5">Sản phẩm</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground py-2.5">Vị trí kệ</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 text-center">SL Đặt (PO)</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 text-center">Đã nhận trước</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 text-center w-24">Thực nhập</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 text-right">Đơn giá</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground py-2.5 text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-10 text-center text-xs text-muted-foreground">
                            Chọn Đơn Mua Hàng (PO) ở bên trái để nạp danh sách sản phẩm
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30">
                            <TableCell className="py-2">
                              <div className="font-medium text-xs text-foreground">{item.productName}</div>
                              <div className="text-[11px] font-mono text-muted-foreground tabular-nums">{item.sku}</div>
                            </TableCell>
                            <TableCell className="py-2">
                              <Input
                                type="text"
                                value={item.location}
                                onChange={(e) => handleUpdateItem(idx, 'location', e.target.value)}
                                className="w-28 h-8 rounded-[6px] text-xs"
                              />
                            </TableCell>
                            <TableCell className="py-2 text-center font-mono font-semibold text-muted-foreground tabular-nums text-xs">
                              {item.expectedQty}
                            </TableCell>
                            <TableCell className="py-2 text-center font-mono font-semibold text-muted-foreground tabular-nums text-xs">
                              {item.receivedBefore}
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              <Input
                                type="number"
                                min="0"
                                max={item.expectedQty - item.receivedBefore}
                                value={item.receivedQty}
                                onChange={(e) => handleUpdateItem(idx, 'receivedQty', e.target.value)}
                                className="w-20 h-8 rounded-[6px] text-center font-mono font-bold text-xs text-emerald-600 tabular-nums mx-auto"
                              />
                            </TableCell>
                            <TableCell className="py-2 text-right font-mono text-xs tabular-nums">
                              {item.importPrice.toLocaleString('vi-VN')} đ
                            </TableCell>
                            <TableCell className="py-2 text-right font-mono font-semibold text-xs text-primary tabular-nums">
                              {item.subtotal.toLocaleString('vi-VN')} đ
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
        </div>
      </form>
    </div>
  );
}
