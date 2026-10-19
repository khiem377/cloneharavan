import React from 'react';
import { Truck } from 'lucide-react';

export default function ShipmentSidebarInfo({ shipment }) {
  if (!shipment) return null;

  return (
    <div className="space-y-4">
      {/* Box Đối tác giao hàng */}
      <div className="p-4 bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] space-y-3">
        <h4 className="font-semibold text-[#212b36] dark:text-foreground pb-2 border-b border-[#dfe3e8] dark:border-border flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-[#0088ff]" /> Đối tác giao hàng
        </h4>
        <div className="space-y-2 text-[12.5px]">
          <div className="flex justify-between">
            <span className="text-[#637381]">Đối tác:</span>
            <span className="font-bold text-[#0088ff]">{shipment.carrierName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#637381]">Khối lượng:</span>
            <span className="font-mono">{shipment.packageInfo?.weight || 500}g</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#637381]">Kích thước:</span>
            <span className="font-mono">
              {shipment.packageInfo?.length || 10}x{shipment.packageInfo?.width || 10}x{shipment.packageInfo?.height || 10}cm
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#637381]">Yêu cầu:</span>
            <span>
              {['CHOXEMHANGKHONGTHU', 'CHOXEMKHONGTHU'].includes(shipment.packageInfo?.requiredNote)
                ? 'Cho xem không thử'
                : ['CHOTHUHANG', 'CHOTHOXEM'].includes(shipment.packageInfo?.requiredNote)
                ? 'Cho xem và thử'
                : shipment.packageInfo?.requiredNote?.includes('KHONG')
                ? 'Không cho xem hàng'
                : 'Theo quy định'}
            </span>
          </div>
        </div>
      </div>

      {/* Box Thông tin thanh toán */}
      <div className="p-4 bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] space-y-3">
        <h4 className="font-semibold text-[#212b36] dark:text-foreground pb-2 border-b border-[#dfe3e8] dark:border-border">
          Thông tin thanh toán
        </h4>
        <div className="space-y-2 text-[12.5px]">
          <div className="flex justify-between">
            <span className="text-[#637381]">Tiền thu hộ COD:</span>
            <span className="font-bold text-[#212b36] font-mono tabular-nums">
              {(shipment.codAmount || 0).toLocaleString('vi-VN')}₫
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#637381]">Phí trả ĐTGH:</span>
            <span className="font-mono tabular-nums text-[#637381]">
              {(shipment.shippingFee || 0).toLocaleString('vi-VN')}₫
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#637381]">Người trả cước:</span>
            <span>{shipment.payer === 'shop' ? 'Shop trả' : 'Khách trả'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
