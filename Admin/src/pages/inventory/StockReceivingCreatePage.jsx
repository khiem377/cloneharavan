import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileCheck, ArrowLeft, Building2, Package, CheckCircle2, Save, Layers, MapPin,
} from '@/components/ui/Icons';
import { inventoryService } from '@/services/inventory.service';
import { useSuppliers } from '@/hooks/useSuppliers';
import { toast } from '@/providers/ToastProvider';
import SearchableSelect from '@/components/ui/SearchableSelect';

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
    e.preventDefault();
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
          <button
            onClick={() => navigate('/stock-receivings')}
            className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileCheck className="h-7 w-7 text-primary" />
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
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                <Building2 className="h-4 w-4 text-primary" /> Thông Tin Chứng Từ Nhập
              </h2>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
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
                <div className="rounded-xl bg-muted/40 p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nhà cung cấp:</span>
                    <span className="font-bold text-foreground">{selectedPo.supplierId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trạng thái PO:</span>
                    <span className="font-semibold text-blue-600">
                      {selectedPo.status === 'partial_received' ? 'Nhập 1 phần' : 'Mới tạo / Chờ nhận'}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Ghi Chú Nhập Kho</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú số xe, số hóa đơn đỏ, người giao hàng..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-2">Tổng Cộng Đợt Nhập</h2>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Số mặt hàng:</span>
                <span className="font-bold">{items.length} mục</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Tổng SL thực nhập đợt này:</span>
                <span className="font-bold font-mono text-emerald-600">{totalRecQty} cái</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold border-t border-border pt-3">
                <span>Giá trị đợt nhập:</span>
                <span className="font-mono text-primary">{totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedPoId}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSubmitting ? 'Đang nhập kho...' : 'Xác Nhận & Nhập Kho'}
              </button>
            </div>
          </div>

          {/* Right Column: Items Table */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" /> Danh Sách Hàng Hóa Thực Nhập
                </h2>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoFillAll}
                    className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Đánh dấu nhập đủ còn lại
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3">Sản phẩm</th>
                      <th className="p-3">Vị trí kệ</th>
                      <th className="p-3 text-center">SL Đặt (PO)</th>
                      <th className="p-3 text-center">Đã nhận trước</th>
                      <th className="p-3 text-center w-24">Thực nhập đợt này</th>
                      <th className="p-3 text-right">Đơn giá</th>
                      <th className="p-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-muted-foreground">
                          Chọn Đơn Mua Hàng (PO) ở bên trái để nạp danh sách sản phẩm
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 align-middle">
                          <td className="p-3">
                            <div className="font-bold text-foreground">{item.productName}</div>
                            <div className="text-[11px] font-mono text-muted-foreground">{item.sku}</div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.location}
                              onChange={(e) => handleUpdateItem(idx, 'location', e.target.value)}
                              className="w-28 rounded border border-input bg-background px-2 py-1 text-xs"
                            />
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-muted-foreground">{item.expectedQty}</td>
                          <td className="p-3 text-center font-mono text-muted-foreground">{item.receivedBefore}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max={item.expectedQty - item.receivedBefore}
                              value={item.receivedQty}
                              onChange={(e) => handleUpdateItem(idx, 'receivedQty', e.target.value)}
                              className="w-full rounded-lg border-2 border-primary/40 bg-background px-2 py-1 text-center font-extrabold text-sm text-emerald-600 focus:outline-none"
                            />
                          </td>
                          <td className="p-3 text-right font-mono">{item.importPrice.toLocaleString('vi-VN')} đ</td>
                          <td className="p-3 text-right font-mono font-bold text-primary">{item.subtotal.toLocaleString('vi-VN')} đ</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
