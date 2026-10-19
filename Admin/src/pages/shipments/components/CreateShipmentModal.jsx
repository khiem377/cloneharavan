import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/providers/ToastProvider';
import shipmentService from '@/services/shipment.service';
import storeSettingService from '@/services/storeSetting.service';
import warehouseService from '@/services/warehouse.service';
import AddCustomCarrierModal from './AddCustomCarrierModal';
import ShipmentPackageForm from './ShipmentPackageForm';
import { X, CheckCircle2 } from 'lucide-react';

export default function CreateShipmentModal({ isOpen, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [deliveryType, setDeliveryType] = useState('carrier'); // 'carrier' | 'self_delivery'
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [connectedCarriers, setConnectedCarriers] = useState([]);
  const [customCarriers, setCustomCarriers] = useState([
    { code: 'shipper_internal', name: 'Shipper cửa hàng' },
    { code: 'xe_om', name: 'Xe ôm / Giao ngoài' },
  ]);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedCarrierCode, setSelectedCarrierCode] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [codAmount, setCodAmount] = useState(0);
  const [weight, setWeight] = useState(500);
  const [dimensions, setDimensions] = useState({ length: 20, width: 15, height: 10 });
  const [requiredNote, setRequiredNote] = useState('CHOXEMHANGKHONGTHU');
  const [note, setNote] = useState('');
  const [payer, setPayer] = useState('shop');

  const applyOrderToForm = (ord) => {
    if (!ord) return;
    const isCOD = ord.paymentMethod === 'COD' && ord.paymentStatus !== 'PAID';
    setCodAmount(isCOD ? ord.pricing?.totalAmount || 0 : 0);
    setShippingFee(ord.pricing?.finalShippingFee ?? ord.pricing?.shippingFee ?? 0);
    const pkg = ord.packageInfo || {};
    setWeight(pkg.weight || (ord.items || []).reduce((acc, it) => acc + ((Number(it.quantity) || 1) * 300), 200));
    setDimensions({ length: pkg.length || 20, width: pkg.width || 15, height: pkg.height || 10 });
  };

  useEffect(() => {
    if (!isOpen) return;
    const loadData = async () => {
      try {
        const [ordersRes, carriersRes, whRes] = await Promise.all([
          shipmentService.getEligibleOrders(),
          storeSettingService.getShippingProviders(),
          warehouseService.getWarehouses().catch(() => ({ data: [] })),
        ]);
        const eligible = ordersRes.data?.data || ordersRes.data || [];
        setOrders(Array.isArray(eligible) ? eligible : []);
        if (eligible.length > 0) {
          setSelectedOrderId(eligible[0]._id);
          applyOrderToForm(eligible[0]);
        }

        const carriersList = carriersRes.data?.data || carriersRes.data || [];
        const connected = (Array.isArray(carriersList) ? carriersList : []).filter((c) => c.status === 'connected');
        setConnectedCarriers(connected);
        const defaultCarrier = connected.find((c) => c.isDefault) || connected[0];
        if (defaultCarrier && deliveryType === 'carrier') {
          setSelectedCarrierCode(defaultCarrier.code);
        }

        const rawWh = whRes.data?.data;
        const whList = Array.isArray(rawWh?.data) ? rawWh.data : Array.isArray(rawWh) ? rawWh : Array.isArray(whRes.data) ? whRes.data : [];
        setWarehouses(whList);
        const defaultWh = whList.find((w) => w.isDefault) || whList[0];
        if (defaultWh) setSelectedWarehouseId(defaultWh._id);
      } catch (err) {
        toast.error('Lỗi tải dữ liệu giao hàng: ' + err.message);
      }
    };
    loadData();
  }, [isOpen]);

  const currentOrder = orders.find((o) => o._id === selectedOrderId);

  const handleOrderChange = (orderId) => {
    setSelectedOrderId(orderId);
    applyOrderToForm(orders.find((o) => o._id === orderId));
  };

  const handleSwitchTab = (type) => {
    setDeliveryType(type);
    if (type === 'carrier') {
      const def = connectedCarriers.find((c) => c.isDefault) || connectedCarriers[0];
      if (def) setSelectedCarrierCode(def.code);
      setShippingFee(currentOrder?.pricing?.finalShippingFee ?? currentOrder?.pricing?.shippingFee ?? 0);
    } else {
      if (customCarriers.length > 0) setSelectedCarrierCode(customCarriers[0].code);
      setShippingFee(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) return toast.error('Vui lòng chọn đơn hàng');
    try {
      setSubmitting(true);
      const isCarrier = deliveryType === 'carrier';
      const carrierObj = isCarrier
        ? connectedCarriers.find((c) => c.code === selectedCarrierCode)
        : customCarriers.find((c) => c.code === selectedCarrierCode) || { name: 'Tự giao hàng' };

      const res = await shipmentService.createShipment({
        orderId: selectedOrderId,
        deliveryType,
        carrierCode: selectedCarrierCode || (isCarrier ? 'viettelpost' : 'self_delivery'),
        carrierName: carrierObj?.name,
        shippingFee: Number(shippingFee),
        warehouseId: selectedWarehouseId || null,
        codAmount: Number(codAmount),
        payer,
        packageInfo: { weight: Number(weight), ...dimensions, requiredNote, note },
      });
      toast.success(res.message || 'Đã tạo vận đơn thành công!');
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#dfe3e8] dark:border-border">
          <h3 className="text-[15px] font-semibold text-[#212b36] dark:text-foreground">Tạo vận đơn / Giao hàng</h3>
          <button type="button" onClick={onClose} className="p-1 text-[#637381] hover:text-[#212b36] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Chọn đơn hàng */}
          <div className="space-y-1">
            <label className="text-[12.5px] font-medium text-[#212b36] dark:text-foreground">Chọn đơn hàng cần giao*</label>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full h-8 px-2.5 rounded-[6px] border border-[#dfe3e8] dark:border-border bg-white dark:bg-muted text-[12.5px] font-mono"
              required
            >
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.orderCode} - {o.shippingAddress?.fullName} ({o.shippingAddress?.phone}) - {o.pricing?.totalAmount?.toLocaleString('vi-VN')}₫
                </option>
              ))}
            </select>
          </div>

          {/* 2 Tabs chuẩn Sapo: Cổng vận chuyển & Tự giao hàng */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleSwitchTab('carrier')}
              className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                deliveryType === 'carrier'
                  ? 'border-[#0088ff] text-[#0088ff] bg-[#f0f7ff] dark:bg-sky-950/40'
                  : 'border-[#dfe3e8] dark:border-border text-[#637381]'
              }`}
            >
              {deliveryType === 'carrier' && <CheckCircle2 className="w-3.5 h-3.5 fill-[#0088ff] text-white" />}
              <span>Cổng vận chuyển</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('self_delivery')}
              className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
                deliveryType === 'self_delivery'
                  ? 'border-[#0088ff] text-[#0088ff] bg-[#f0f7ff] dark:bg-sky-950/40'
                  : 'border-[#dfe3e8] dark:border-border text-[#637381]'
              }`}
            >
              {deliveryType === 'self_delivery' && <CheckCircle2 className="w-3.5 h-3.5 fill-[#0088ff] text-white" />}
              <span>Tự giao hàng</span>
            </button>
          </div>

          {/* Sapo Package Form */}
          <ShipmentPackageForm
            deliveryType={deliveryType}
            currentOrder={currentOrder}
            warehouses={warehouses}
            selectedWarehouseId={selectedWarehouseId}
            setSelectedWarehouseId={setSelectedWarehouseId}
            codAmount={codAmount}
            setCodAmount={setCodAmount}
            weight={weight}
            setWeight={setWeight}
            dimensions={dimensions}
            setDimensions={setDimensions}
            requiredNote={requiredNote}
            setRequiredNote={setRequiredNote}
            note={note}
            setNote={setNote}
            payer={payer}
            setPayer={setPayer}
            selectedCarrierCode={selectedCarrierCode}
            setSelectedCarrierCode={setSelectedCarrierCode}
            connectedCarriers={connectedCarriers}
            customCarriers={customCarriers}
            shippingFee={shippingFee}
            setShippingFee={setShippingFee}
            onAddNewCustomCarrier={() => setIsAddCustomOpen(true)}
          />

          {/* Action buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-[6px] text-[13px] cursor-pointer">
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting || orders.length === 0}
              className="rounded-[6px] text-[13px] bg-[#0088ff] hover:bg-[#0077e6] text-white cursor-pointer active:scale-[0.98]"
            >
              {submitting ? 'Đang tạo...' : 'Tạo đơn và giao hàng'}
            </Button>
          </div>
        </form>
      </div>

      <AddCustomCarrierModal
        isOpen={isAddCustomOpen}
        onClose={() => setIsAddCustomOpen(false)}
        onAdd={(newC) => {
          setCustomCarriers((prev) => [...prev, newC]);
          setSelectedCarrierCode(newC.code);
          toast.success(`Đã thêm đối tác ${newC.name}`);
        }}
      />
    </div>
  );
}
