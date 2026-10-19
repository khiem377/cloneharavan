import React from 'react';
import PartnerSelectDropdown from './PartnerSelectDropdown';
import { Pencil } from 'lucide-react';

export default function ShipmentPackageForm({
  deliveryType,
  currentOrder,
  warehouses,
  selectedWarehouseId,
  setSelectedWarehouseId,
  codAmount,
  setCodAmount,
  weight,
  setWeight,
  dimensions,
  setDimensions,
  requiredNote,
  setRequiredNote,
  note,
  setNote,
  payer,
  setPayer,
  selectedCarrierCode,
  setSelectedCarrierCode,
  connectedCarriers,
  customCarriers,
  shippingFee,
  setShippingFee,
  onAddNewCustomCarrier,
}) {
  return (
    <div className="border border-[#dfe3e8] dark:border-border rounded-[6px] p-4 bg-white dark:bg-card space-y-3.5 text-[12.5px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cột trái (Left column) */}
        <div className="space-y-3">
          {/* Địa chỉ lấy hàng */}
          <div>
            <label className="font-medium text-[#212b36] dark:text-foreground">Địa chỉ lấy hàng</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full h-8 px-2.5 rounded-[6px] border border-[#dfe3e8] dark:border-border bg-white dark:bg-muted mt-1 text-[12.5px]"
            >
              {(Array.isArray(warehouses) ? warehouses : []).map((w) => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
              {(!Array.isArray(warehouses) || warehouses.length === 0) && <option value="">Cửa hàng chính</option>}
            </select>
          </div>

          {/* Tiền thu hộ COD */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-medium text-[#212b36] dark:text-foreground">Tiền thu hộ COD</label>
              {Number(codAmount) > 100000000 && deliveryType === 'carrier' && (
                <span className="text-[10.5px] text-amber-600 font-medium">Hãng giới hạn tối đa 100tr</span>
              )}
            </div>
            <div className="relative mt-1">
              <input
                type="text"
                value={codAmount ? Number(codAmount).toLocaleString('vi-VN') : (codAmount === 0 ? '0' : '')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setCodAmount(raw ? Number(raw) : 0);
                }}
                className={`w-full h-8 pl-2.5 pr-6 rounded-[6px] border font-mono tabular-nums text-[12.5px] ${
                  Number(codAmount) > 100000000 && deliveryType === 'carrier'
                    ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                    : 'border-[#dfe3e8] dark:border-border'
                }`}
              />
              <span className="absolute right-2.5 top-1.5 text-[12px] text-[#637381]">₫</span>
            </div>
            {Number(codAmount) > 100000000 && deliveryType === 'carrier' && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                Lưu ý: Hãng vận chuyển quy định tiền thu hộ COD tối đa 100.000.000₫. Vui lòng hạ số tiền COD hoặc chuyển sang "Tự giao hàng".
              </p>
            )}
          </div>

          {/* Kích thước Dài - Rộng - Cao */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Dài', key: 'length' },
              { label: 'Rộng', key: 'width' },
              { label: 'Cao', key: 'height' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-[11.5px] text-[#637381]">{label}</label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    value={dimensions[key]}
                    onChange={(e) => setDimensions({ ...dimensions, [key]: e.target.value })}
                    className="w-full h-8 pl-2 pr-6 rounded-[6px] border border-[#dfe3e8] dark:border-border font-mono text-[12px]"
                  />
                  <span className="absolute right-1.5 top-1.5 text-[11px] text-[#919eab]">cm</span>
                </div>
              </div>
            ))}
          </div>

          {/* Yêu cầu giao hàng */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-medium text-[#212b36] dark:text-foreground">Yêu cầu giao hàng</label>
              <span className="text-[11px] text-[#919eab]">0/255</span>
            </div>
            <select
              value={requiredNote}
              onChange={(e) => setRequiredNote(e.target.value)}
              className="w-full h-8 px-2.5 rounded-[6px] border border-[#dfe3e8] dark:border-border bg-white dark:bg-muted mt-1 text-[12.5px]"
            >
              <option value="CHOXEMHANGKHONGTHU">Cho xem hàng không cho thử</option>
              <option value="CHOTHUHANG">Cho xem hàng, cho thử</option>
              <option value="KHONGCHOXEMHANG">Không cho xem hàng</option>
            </select>
          </div>

          {/* Chọn đối tác */}
          <div>
            <label className="font-medium text-[#212b36] dark:text-foreground">Chọn đối tác</label>
            <div className="mt-1">
              <PartnerSelectDropdown
                selectedCode={selectedCarrierCode}
                onSelect={(code) => setSelectedCarrierCode(code)}
                partners={deliveryType === 'carrier' ? connectedCarriers : customCarriers}
                onAddNew={deliveryType === 'self_delivery' ? onAddNewCustomCarrier : null}
                placeholder={deliveryType === 'carrier' ? 'Chọn hãng vận chuyển' : 'Chọn đối tác'}
              />
            </div>
          </div>
        </div>

        {/* Cột phải (Right column) */}
        <div className="space-y-3">
          {/* Địa chỉ giao hàng */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-medium text-[#212b36] dark:text-foreground">Địa chỉ giao hàng</label>
              <Pencil className="w-3.5 h-3.5 text-[#919eab] cursor-pointer hover:text-[#212b36]" />
            </div>
            <div className="p-2 border border-[#dfe3e8] dark:border-border rounded-[6px] bg-[#fafbfb] dark:bg-muted/40 text-[12px] text-[#637381] mt-1 min-h-[32px] flex items-center">
              {currentOrder?.shippingAddress
                ? `${currentOrder.shippingAddress.fullName} - ${currentOrder.shippingAddress.phone} (${currentOrder.shippingAddress.detailAddress || ''}, ${currentOrder.shippingAddress.province || ''})`
                : 'Chưa có địa chỉ giao hàng'}
            </div>
          </div>

          {/* Khối lượng */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-medium text-[#212b36] dark:text-foreground">Khối lượng</label>
              {Number(weight) >= 1000 && (
                <span className="text-[11px] font-mono text-[#0088ff] bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.2 rounded font-medium">
                  ~{(Number(weight) / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} kg
                </span>
              )}
            </div>
            <div className="relative mt-1">
              <input
                type="text"
                value={weight ? Number(weight).toLocaleString('vi-VN') : (weight === 0 ? '0' : '')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setWeight(raw ? Number(raw) : 0);
                }}
                className="w-full h-8 pl-2.5 pr-8 rounded-[6px] border border-[#dfe3e8] dark:border-border font-mono tabular-nums text-[12.5px]"
              />
              <span className="absolute right-2.5 top-1.5 text-[12px] text-[#637381]">g</span>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="font-medium text-[#212b36] dark:text-foreground">Ghi chú</label>
            <input
              type="text"
              placeholder="Nhập ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-8 px-2.5 rounded-[6px] border border-[#dfe3e8] dark:border-border text-[12.5px] mt-1"
            />
          </div>

          {/* Người trả phí */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-medium text-[#212b36] dark:text-foreground">Người trả phí</label>
              {payer === 'receiver' && (
                <span className="text-[10.5px] text-amber-600 font-medium">Khách sẽ bị thu cước riêng</span>
              )}
            </div>
            <div className="flex items-center gap-5 h-8 mt-1 text-[12.5px]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="formPayer" checked={payer === 'shop'} onChange={() => setPayer('shop')} />
                <span>Shop trả (khuyên dùng)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="formPayer" checked={payer === 'receiver'} onChange={() => setPayer('receiver')} />
                <span>Khách trả</span>
              </label>
            </div>
          </div>

          {/* Phí vận chuyển */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-medium text-[#212b36] dark:text-foreground">Phí vận chuyển</label>
              {currentOrder?.pricing?.finalShippingFee != null && (
                <span className="text-[11px] text-[#637381]">
                  Khách trả: {Number(currentOrder.pricing.finalShippingFee).toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
            <div className="relative mt-1">
              <input
                type="text"
                disabled={deliveryType === 'carrier'}
                value={shippingFee ? Number(shippingFee).toLocaleString('vi-VN') : (shippingFee === 0 ? '0' : '')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setShippingFee(raw ? Number(raw) : 0);
                }}
                className="w-full h-8 pl-2.5 pr-6 rounded-[6px] border border-[#dfe3e8] dark:border-border font-mono tabular-nums text-[12.5px] disabled:bg-[#f4f6f8] dark:disabled:bg-muted"
              />
              <span className="absolute right-2.5 top-1.5 text-[12px] text-[#637381]">₫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dòng tổng kết Sapo */}
      <div className="pt-3 flex justify-between items-center text-[13px] font-medium text-[#212b36] dark:text-foreground border-t border-[#dfe3e8] dark:border-border">
        <span>Tiền thu hộ COD: <strong className="font-mono text-[#0088ff]">{Number(codAmount || 0).toLocaleString('vi-VN')}₫</strong></span>
        <span>Phí vận chuyển: <strong className="font-mono">{Number(shippingFee || 0).toLocaleString('vi-VN')}₫</strong></span>
      </div>
    </div>
  );
}
