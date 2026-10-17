import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/providers/ToastProvider';
import storeSettingService from '@/services/storeSetting.service';
import { Info, X } from 'lucide-react';

export default function ShippingRulesTab({ initialData, onRefresh }) {
  const [shipping, setShipping] = useState(
    initialData?.shipping || {
      weightType: 'product',
      customWeight: 500,
      length: 10,
      width: 10,
      height: 10,
      deliveryRequirement: 'allow_check_no_try',
      defaultNote: '',
      syncOrderNote: false,
      syncReturnedStatus: false,
      syncCancelledStatus: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const handleChange = (field, val) => {
    setShipping((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await storeSettingService.updateSettings('shipping', shipping);
      toast.success('Đã lưu cấu hình vận chuyển thành công!');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Lỗi lưu cấu hình: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. TOP LIGHT BLUE BANNER (SAPO 100%) */}
      {showBanner && (
        <div className="bg-[#e8f2fe] dark:bg-blue-950/40 border border-[#b3d7ff] dark:border-blue-900/60 rounded-[6px] p-4 flex items-start justify-between gap-3 text-[13px] text-[#004b87] dark:text-blue-200">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#0088ff] dark:text-[#38bdf8] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Tạo đơn xong - Giao hàng ngay!</span>
              <span className="text-[#004b87] dark:text-blue-200 leading-relaxed">
                Hãy cài đặt ứng dụng Giao hàng tự động để tiết kiệm thời gian, chốt đơn nhanh gấp bội{' '}
                <a href="#app" className="underline font-medium hover:text-[#002e6e] dark:hover:text-blue-100">
                  tại đây
                </a>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="text-[#0088ff] dark:text-[#38bdf8] hover:text-[#002e6e] dark:hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. THÔNG TIN GÓI HÀNG MẶC ĐỊNH (SAPO 100%) */}
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#212b36] dark:text-foreground">Thông tin gói hàng mặc định</h3>
          <p className="text-[13px] text-[#637381] dark:text-muted-foreground mt-1 leading-relaxed">
            Các thông tin cấu hình này sẽ áp dụng cho toàn bộ các đơn đẩy vận chuyển. Bạn có thể thay đổi thông tin này tại màn hình đẩy đơn. Kích thước mặc định: 10 × 10 × 10 cm.
          </p>
        </div>

        {/* Khối lượng */}
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-[#212b36] dark:text-foreground flex items-center gap-1">
            Khối lượng <Info className="w-3.5 h-3.5 text-[#637381] dark:text-muted-foreground" />
          </label>
          <div className="space-y-2 text-[13px] text-[#212b36] dark:text-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="weightType"
                value="product"
                checked={shipping.weightType === 'product'}
                onChange={() => handleChange('weightType', 'product')}
                className="text-[#0088ff]"
              />
              <span>Theo sản phẩm trong đơn hàng</span>
            </label>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="weightType"
                  value="custom"
                  checked={shipping.weightType === 'custom'}
                  onChange={() => handleChange('weightType', 'custom')}
                  className="text-[#0088ff]"
                />
                <span>Tùy chỉnh:</span>
              </label>
              {shipping.weightType === 'custom' && (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min="1"
                    value={shipping.customWeight || ''}
                    onChange={(e) => handleChange('customWeight', Number(e.target.value))}
                    className="w-24 h-8 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground font-mono focus:border-[#0088ff]"
                  />
                  <span className="text-[13px] text-[#637381] dark:text-muted-foreground">gram</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preset standard box sizes */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-muted-foreground font-medium text-[12px]">Kích thước hộp mẫu:</span>
            {[
              { label: 'Hộp áo (25×15×5 cm)', l: 25, w: 15, h: 5 },
              { label: 'Hộp giày (33×20×12 cm)', l: 33, w: 20, h: 12 },
              { label: 'Hộp mỹ phẩm (15×10×5 cm)', l: 15, w: 10, h: 5 },
              { label: 'Hộp túi xách (30×25×15 cm)', l: 30, w: 25, h: 15 },
            ].map((box) => (
              <button
                key={box.label}
                type="button"
                onClick={() => {
                  setShipping((prev) => ({
                    ...prev,
                    length: box.l,
                    width: box.w,
                    height: box.h,
                  }));
                }}
                className="px-2.5 py-1 rounded-[4px] border border-border bg-muted/40 hover:bg-muted text-foreground text-[11.5px] font-medium transition-colors cursor-pointer active:scale-[0.98]"
              >
                {box.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Inputs: Dài x Rộng x Cao x Yêu cầu giao hàng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">Dài</label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                value={shipping.length || 10}
                onChange={(e) => handleChange('length', Number(e.target.value))}
                className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground font-mono pr-8 focus:border-[#0088ff]"
              />
              <span className="absolute right-3 top-2 text-[12px] text-[#637381] dark:text-muted-foreground">cm</span>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">Rộng</label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                value={shipping.width || 10}
                onChange={(e) => handleChange('width', Number(e.target.value))}
                className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground font-mono pr-8 focus:border-[#0088ff]"
              />
              <span className="absolute right-3 top-2 text-[12px] text-[#637381] dark:text-muted-foreground">cm</span>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">Cao</label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                value={shipping.height || 10}
                onChange={(e) => handleChange('height', Number(e.target.value))}
                className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground font-mono pr-8 focus:border-[#0088ff]"
              />
              <span className="absolute right-3 top-2 text-[12px] text-[#637381] dark:text-muted-foreground">cm</span>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">Yêu cầu giao hàng</label>
            <select
              value={shipping.deliveryRequirement || 'allow_check_no_try'}
              onChange={(e) => handleChange('deliveryRequirement', e.target.value)}
              className="w-full h-9 text-[13px] border border-[#c4cdd5] dark:border-border rounded-[4px] px-2.5 bg-white dark:bg-background text-[#212b36] dark:text-foreground focus:outline-none focus:border-[#0088ff]"
            >
              <option value="allow_check_no_try">Cho xem hàng không cho thử</option>
              <option value="allow_try">Cho thử hàng</option>
              <option value="no_check">Không cho xem hàng</option>
            </select>
          </div>
        </div>

        {/* Ghi chú */}
        <div className="pt-2">
          <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">Ghi chú</label>
          <div className="relative">
            <textarea
              rows={3}
              maxLength={255}
              value={shipping.defaultNote || ''}
              onChange={(e) => handleChange('defaultNote', e.target.value)}
              placeholder="Nhập ghi chú cho gói hàng mặc định"
              className="w-full text-[13px] p-3 border border-[#c4cdd5] dark:border-border rounded-[4px] bg-white dark:bg-background text-[#212b36] dark:text-foreground focus:outline-none focus:border-[#0088ff] placeholder-[#919eab] dark:placeholder-muted-foreground"
            />
            <span className="absolute right-3 bottom-2.5 text-[11px] font-mono text-[#919eab] dark:text-muted-foreground">
              {(shipping.defaultNote || '').length}/255
            </span>
          </div>
        </div>

        {/* 3 CHECKBOXES SAPO 100% */}
        <div className="pt-4 border-t border-[#f4f6f8] dark:border-border space-y-3.5 text-[13px]">
          <label className="flex items-start gap-2.5 cursor-pointer text-[#212b36] dark:text-foreground">
            <input
              type="checkbox"
              checked={shipping.syncOrderNote || false}
              onChange={(e) => handleChange('syncOrderNote', e.target.checked)}
              className="mt-0.5 rounded-[3px] text-[#0088ff]"
            />
            <div>
              <span className="font-medium">Tự động đồng bộ ghi chú đơn hàng sang ghi chú giao hàng</span>
              <p className="text-[12px] text-[#637381] dark:text-muted-foreground mt-0.5 leading-relaxed">
                Khi tạo đơn vận chuyển, hệ thống sẽ tự động điền Ghi chú giao hàng bằng nội dung trong Ghi chú đơn hàng.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer text-[#212b36] dark:text-foreground">
            <input
              type="checkbox"
              checked={shipping.syncReturnedStatus || false}
              onChange={(e) => handleChange('syncReturnedStatus', e.target.checked)}
              className="mt-0.5 rounded-[3px] text-[#0088ff]"
            />
            <div>
              <span className="font-medium">Tự động đồng bộ trạng thái "Đã hoàn hàng" với đối tác vận chuyển tích hợp</span>
              <p className="text-[12px] text-[#637381] dark:text-muted-foreground mt-0.5 leading-relaxed">
                Khi bật tính năng này, các đơn không giao được hàng của đối tác giao hàng tích hợp ở trạng thái chuyển hoàn thành công, hệ thống sẽ tự động nhập kho toàn bộ sản phẩm. Nếu không bật tính năng này, các đơn sẽ được treo ở trạng thái "Chờ xác nhận hoàn hàng" để cửa hàng xác nhận hoàn kho thủ công.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer text-[#212b36] dark:text-foreground">
            <input
              type="checkbox"
              checked={shipping.syncCancelledStatus !== false}
              onChange={(e) => handleChange('syncCancelledStatus', e.target.checked)}
              className="mt-0.5 rounded-[3px] text-[#0088ff]"
            />
            <div>
              <span className="font-medium">Tự động đồng bộ trạng thái "Hủy giao hàng" với đối tác vận chuyển tích hợp khi đơn ở trạng thái "Chờ lấy hàng"</span>
              <p className="text-[12px] text-[#637381] dark:text-muted-foreground mt-0.5 leading-relaxed">
                Khi bật tính năng này, với các đơn đang ở trạng thái "Chờ lấy hàng" nếu hãng vận chuyển huỷ đơn, hệ thống sẽ chuyển đơn về trạng thái "Huỷ giao hàng". Nếu không bật tính năng này, các đơn sẽ được treo ở trạng thái "Chờ xác nhận hoàn hàng" để cửa hàng xác nhận hoàn kho thủ công.
              </p>
            </div>
          </label>
        </div>

        {/* BOTTOM NOTE SAPO 100% */}
        <div className="pt-2 text-[12px] text-[#637381] dark:text-muted-foreground flex items-center gap-1.5 italic">
          <Info className="w-3.5 h-3.5 text-[#0088ff] shrink-0" />
          <span>
            Lưu ý: Các thông tin cấu hình sẽ áp dụng cho toàn bộ các đơn đẩy vận chuyển. Bạn có thể thay đổi các thông tin này tại màn hình đẩy đơn.
          </span>
        </div>
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#0088ff] hover:bg-[#0077e6] text-white px-5 py-2 rounded-[4px] text-[13px] font-medium shadow-xs active:scale-[0.98] transition-transform"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
}
