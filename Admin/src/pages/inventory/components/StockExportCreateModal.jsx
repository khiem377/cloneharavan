import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Trash2,
  X,
  PackageCheck,
} from '@/components/ui/Icons';
import { useSearchInventoryProducts } from '@/hooks/useProducts';
import { useCreateStockExport } from '@/hooks/useInventory';
import orderService from '@/services/order.service';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { toast } from '@/providers/ToastProvider';

export default function StockExportCreateModal({
  isOpen,
  onClose,
  warehouses = [],
  initialOrderId = null,
  initialOrderCode = null,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    type: 'sale',
    warehouseId: '',
    orderId: '',
    orderCode: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    note: '',
    items: [],
  });

  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [selectedOrderInfo, setSelectedOrderInfo] = useState(null);
  const [orderSearchKeyword, setOrderSearchKeyword] = useState('');
  const [isSearchingOrder, setIsSearchingOrder] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const createMutation = useCreateStockExport();
  const searchProducts = useSearchInventoryProducts(productSearch).data || [];

  const defaultWh = warehouses.find((w) => w.isDefault)?._id || warehouses[0]?._id || '';

  const loadEligibleOrders = async () => {
    try {
      setIsSearchingOrder(true);
      // Chỉ tải các đơn hàng trước khi shipping (CONFIRMED - Đã duyệt / Chờ xuất kho, PENDING - Chờ duyệt)
      const res = await orderService.getAllOrders({
        status: 'PENDING,CONFIRMED',
        limit: 50,
      });
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.orders || res.data?.data || res.orders || []);
      const validOrders = rawList.filter((o) => {
        const st = (o.orderStatus || '').toUpperCase();
        return st === 'CONFIRMED' || st === 'PENDING';
      });
      setEligibleOrders(validOrders);
    } catch (err) {
      console.warn('Lỗi tải danh sách đơn hàng chờ xuất:', err);
    } finally {
      setIsSearchingOrder(false);
    }
  };

  const handleSelectOrder = (order) => {
    if (!order) {
      setSelectedOrderInfo(null);
      setFormData((prev) => ({
        ...prev,
        orderId: '',
        orderCode: '',
      }));
      return;
    }

    const st = (order.orderStatus || '').toUpperCase();
    if (st !== 'CONFIRMED' && st !== 'PENDING') {
      toast.error(`Đơn hàng #${order.orderCode} có trạng thái "${order.orderStatus}". Chỉ được tạo phiếu xuất cho đơn Chờ duyệt hoặc Đã duyệt!`);
      return;
    }

    setSelectedOrderInfo(order);
    const recName = order.shippingAddress?.fullName || 'Khách hàng';
    const recPhone = order.shippingAddress?.phone || '';
    const recAddr = [
      order.shippingAddress?.detailAddress,
      order.shippingAddress?.ward,
      order.shippingAddress?.district,
      order.shippingAddress?.province,
    ]
      .filter(Boolean)
      .join(', ');

    const orderItems = (order.items || []).map((it) => ({
      productId: it.productId?._id || it.productId,
      variantId: it.variantId?._id || it.variantId || null,
      sku: it.sku || '',
      productName: it.productName || 'Sản phẩm',
      unit: 'Cái',
      quantity: Number(it.quantity) || 1,
      exportPrice: Number(it.unitPrice || it.price || 0),
      subtotal: (Number(it.quantity) || 1) * Number(it.unitPrice || it.price || 0),
    }));

    setFormData((prev) => ({
      ...prev,
      type: 'sale',
      orderId: order._id,
      orderCode: order.orderCode,
      recipientName: recName,
      recipientPhone: recPhone,
      recipientAddress: recAddr,
      note: `Xuất kho giao hàng cho đơn #${order.orderCode}`,
      items: orderItems,
    }));

    toast.success(`Đã tự động nạp ${orderItems.length} sản phẩm từ đơn hàng #${order.orderCode}!`);
  };

  const handleSearchOrder = async (keyword) => {
    const q = (keyword || orderSearchKeyword || '').trim();
    if (!q) {
      loadEligibleOrders();
      return;
    }
    try {
      setIsSearchingOrder(true);
      const res = await orderService.getAllOrders({
        search: q,
        limit: 10,
      });
      const list = Array.isArray(res.data) ? res.data : (res.data?.orders || res.data?.data || res.orders || []);
      const foundOrder = list.find(
        (o) => o.orderCode?.toLowerCase() === q.toLowerCase() || o._id === q
      ) || list[0];

      if (!foundOrder) {
        toast.error(`Không tìm thấy đơn hàng nào khớp với "${q}"`);
        return;
      }

      const st = (foundOrder.orderStatus || '').toUpperCase();
      if (st === 'CANCELLED') {
        toast.error(`Đơn hàng #${foundOrder.orderCode} đã bị HỦY, không thể tạo lệnh xuất kho!`);
        return;
      }
      if (st === 'DELIVERED') {
        toast.error(`Đơn hàng #${foundOrder.orderCode} đã GIAO THÀNH CÔNG, không thể xuất kho lại!`);
        return;
      }
      if (st === 'SHIPPING') {
        toast.error(`Đơn hàng #${foundOrder.orderCode} ĐANG GIAO HÀNG (đã hoàn tất xuất kho trước đó)!`);
        return;
      }
      if (st === 'RETURNED') {
        toast.error(`Đơn hàng #${foundOrder.orderCode} đã HOÀN TRẢ, không thể tạo lệnh xuất kho!`);
        return;
      }

      handleSelectOrder(foundOrder);
    } catch (err) {
      toast.error('Lỗi tra cứu đơn hàng: ' + (err.message || ''));
    } finally {
      setIsSearchingOrder(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: 'sale',
        warehouseId: defaultWh,
        orderId: '',
        orderCode: '',
        recipientName: '',
        recipientPhone: '',
        recipientAddress: '',
        note: '',
        items: [],
      });
      setSelectedOrderInfo(null);
      setOrderSearchKeyword(initialOrderCode || '');
      setProductSearch('');
      loadEligibleOrders();

      if (initialOrderId || initialOrderCode) {
        orderService
          .getOrderById(initialOrderId || initialOrderCode)
          .then((res) => {
            const ord = res.data?.order || res.data || res.order;
            if (ord) handleSelectOrder(ord);
          })
          .catch(() => {});
      }
    }
  }, [isOpen, defaultWh, initialOrderId, initialOrderCode]);

  const handleAddProduct = (prod) => {
    const existingIndex = formData.items.findIndex(
      (i) => i.productId === prod._id && i.variantId === prod.variantId
    );
    if (existingIndex > -1) {
      const updated = [...formData.items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].exportPrice;
      setFormData({ ...formData, items: updated });
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            productId: prod._id,
            variantId: prod.variantId || null,
            sku: prod.sku || '',
            productName: prod.name,
            unit: 'Cái',
            quantity: 1,
            exportPrice: prod.price || 0,
            subtotal: prod.price || 0,
          },
        ],
      });
    }
    setProductSearch('');
  };

  const handleUpdateItem = (index, field, val) => {
    const updated = [...formData.items];
    const item = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'exportPrice') {
      item.subtotal = Number(item.quantity || 0) * Number(item.exportPrice || 0);
    }
    updated[index] = item;
    setFormData({ ...formData, items: updated });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm xuất kho!');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast.success('Khởi tạo Lệnh xuất kho thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu xuất');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-[6px] border border-border bg-card p-6 shadow-xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-primary" /> Tạo Lệnh Xuất Kho Mới
          </h2>
          <button onClick={onClose} className="rounded-[4px] p-1 text-muted-foreground hover:bg-muted cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Box Chọn / Nhập mã đơn hàng xuất bán */}
          {formData.type === 'sale' && (
            <div className="rounded-[6px] border border-blue-200 bg-blue-50/60 dark:bg-blue-950/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <PackageCheck className="size-4 text-blue-600" />
                  Đơn Hàng Chờ Xuất Kho (Chỉ nhận đơn Chờ duyệt & Đã duyệt - trước khi giao hàng)
                </label>
                {selectedOrderInfo && (
                  <button
                    type="button"
                    onClick={() => handleSelectOrder(null)}
                    className="text-[11px] text-destructive hover:underline font-semibold cursor-pointer"
                  >
                    Hủy liên kết đơn
                  </button>
                )}
              </div>

              {selectedOrderInfo ? (
                <div className="flex items-center justify-between bg-background p-3 rounded-[6px] border border-blue-200 text-xs">
                  <div>
                    <span className="font-bold text-blue-600 font-mono text-sm">#{selectedOrderInfo.orderCode}</span>
                    <span className="text-muted-foreground ml-3">
                      Khách: <strong className="text-foreground">{selectedOrderInfo.shippingAddress?.fullName}</strong> ({selectedOrderInfo.shippingAddress?.phone})
                    </span>
                    <span className="ml-3 font-mono text-emerald-600 font-bold">
                      {(selectedOrderInfo.pricing?.totalAmount || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-[4px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[11px] font-bold font-mono">
                    {selectedOrderInfo.orderStatus === 'CONFIRMED' ? 'Đã duyệt / Chờ xuất' : 'Chờ duyệt'}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Nhập mã đơn (VD: ORD-20261027-9ZY50)..."
                      value={orderSearchKeyword}
                      onChange={(e) => setOrderSearchKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchOrder();
                        }
                      }}
                      className="h-8 flex-1 rounded-[6px] border border-input bg-background px-3 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleSearchOrder()}
                      disabled={isSearchingOrder}
                      className="h-8 px-3 rounded-[6px] bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                    >
                      {isSearchingOrder ? '...' : 'Nạp Đơn'}
                    </button>
                  </div>

                  <select
                    value={formData.orderId || ''}
                    onChange={(e) => {
                      const ord = eligibleOrders.find((o) => o._id === e.target.value);
                      handleSelectOrder(ord);
                    }}
                    className="h-8 px-2.5 text-xs bg-background rounded-[6px] border border-input focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="">-- Chọn đơn chờ xuất kho ({eligibleOrders.length} đơn) --</option>
                    {eligibleOrders.map((o) => (
                      <option key={o._id} value={o._id}>
                        #{o.orderCode} - {o.shippingAddress?.fullName || 'Khách'} [{o.orderStatus === 'CONFIRMED' ? 'Đã duyệt' : 'Chờ duyệt'}]
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Form Thông tin chung */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Kho Xuất Hàng *</label>
              <select
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full h-8 px-2.5 text-xs bg-background rounded-[6px] border border-input focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} {w.isDefault ? '(Kho mặc định)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Loại Xuất Kho</label>
              <SearchableSelect
                options={[
                  { label: 'Xuất bán hàng', value: 'sale' },
                  { label: 'Xuất chuyển kho nội bộ', value: 'transfer' },
                  { label: 'Xuất tiêu dùng nội bộ', value: 'internal_use' },
                  { label: 'Xuất hủy / Hao hụt / Hết hạn', value: 'damage_expired' },
                  { label: 'Xuất hàng mẫu / Quà tặng sự kiện', value: 'sample_gift' },
                  { label: 'Xuất trả nhà cung cấp', value: 'return_supplier' },
                  { label: 'Xuất khác', value: 'other' },
                ]}
                value={formData.type}
                onChange={(val) => setFormData({ ...formData, type: val })}
                creatable={false}
                placeholder="Chọn loại xuất..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Người Nhận</label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                placeholder="Tên khách hàng / người nhận"
                className="w-full h-8 rounded-[6px] border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Số Điện Thoại</label>
              <input
                type="text"
                value={formData.recipientPhone}
                onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                placeholder="09xx..."
                className="w-full h-8 rounded-[6px] border border-input bg-background px-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Địa Chỉ Nhận Hàng</label>
              <input
                type="text"
                value={formData.recipientAddress}
                onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                placeholder="Số nhà, đường, phường, quận..."
                className="w-full rounded-[6px] border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Ghi Chú</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Ghi chú xuất kho..."
                className="w-full rounded-[6px] border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Tìm kiếm & thêm sản phẩm thủ công */}
          <div className="relative pt-1">
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Thêm sản phẩm / biến thể (nếu cần)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Gõ tên hoặc mã SKU sản phẩm..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full rounded-[6px] border border-input bg-background pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {productSearch.trim() && (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-[6px] border border-border bg-card shadow-md divide-y divide-border/60">
                {searchProducts.map((prod, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleAddProduct(prod)}
                    className="flex items-center justify-between p-2.5 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-xs text-foreground">{prod.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono tabular-nums">
                        SKU: {prod.sku || '-'} | Tồn: <span className="font-bold text-emerald-600">{prod.stock || 0}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-primary font-mono">Thêm</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danh sách mặt hàng xuất */}
          <div className="overflow-x-auto rounded-[6px] border border-border shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-semibold text-muted-foreground">
                <tr>
                  <th className="p-2.5">Sản Phẩm</th>
                  <th className="p-2.5 w-24">Số Lượng</th>
                  <th className="p-2.5 w-32">Đơn Giá</th>
                  <th className="p-2.5 w-32">Thành Tiền</th>
                  <th className="p-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {formData.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">
                      Chưa có sản phẩm nào. Chọn đơn hàng phía trên hoặc tìm kiếm sản phẩm để thêm vào.
                    </td>
                  </tr>
                ) : (
                  formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-foreground">
                        <div>{item.productName}</div>
                        {item.sku && <span className="text-[11px] text-muted-foreground font-mono">SKU: {item.sku}</span>}
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full rounded-[4px] border border-input bg-background px-2 py-1 text-xs font-mono tabular-nums"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          value={item.exportPrice}
                          onChange={(e) => handleUpdateItem(idx, 'exportPrice', Number(e.target.value))}
                          className="w-full rounded-[4px] border border-input bg-background px-2 py-1 text-xs font-mono tabular-nums"
                        />
                      </td>
                      <td className="p-2.5 font-semibold text-emerald-600 font-mono tabular-nums">
                        {item.subtotal.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="rounded-[4px] p-1 text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground font-mono">
              Tổng số lượng: <strong className="text-foreground">{formData.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)}</strong> |
              Tổng giá trị: <strong className="text-emerald-600">{formData.items.reduce((s, i) => s + (Number(i.subtotal) || 0), 0).toLocaleString('vi-VN')} đ</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[6px] border border-input px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted active:scale-[0.98] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-[6px] bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98] cursor-pointer"
              >
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo Lệnh Xuất Kho'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
