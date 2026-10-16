import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/providers/ToastProvider';
import storeSettingService from '@/services/storeSetting.service';
import LogoUploadSection from './LogoUploadSection';
import AddressApiSelect from './AddressApiSelect';
import GhtkSpecialAddressInput from './GhtkSpecialAddressInput';

export default function GeneralSettingsTab({ initialData, onRefresh }) {
  const [formData, setFormData] = useState({
    storeInfo: initialData?.storeInfo || {},
    standards: initialData?.standards || {},
    orderCode: initialData?.orderCode || { prefix: '#', suffix: '', currentNumber: 1000 },
  });
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [autoOpenWard, setAutoOpenWard] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        storeInfo: initialData.storeInfo || {},
        standards: initialData.standards || {},
        orderCode: initialData.orderCode || { prefix: '#', suffix: '', currentNumber: 1000 },
      });
    }
  }, [initialData]);

  const handleStoreChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      storeInfo: { ...prev.storeInfo, [field]: val },
    }));
  };

  const handleAddressChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      storeInfo: {
        ...prev.storeInfo,
        address: { ...prev.storeInfo?.address, [field]: val },
      },
    }));
  };

  const handleStandardChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      standards: { ...prev.standards, [field]: val },
    }));
  };

  const handleOrderCodeChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      orderCode: { ...prev.orderCode, [field]: val },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await storeSettingService.updateSettings('all', formData);
      toast.success('Đã lưu cấu hình chung thành công!');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Lỗi lưu cấu hình: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const prefix = formData.orderCode?.prefix ?? '#';
  const suffix = formData.orderCode?.suffix ?? '';
  const num = formData.orderCode?.currentNumber || 1001;

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-[880px] pb-10">
      {/* 1. THÔNG TIN CỬA HÀNG (SAPO 100% COMPACT CARD) */}
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-5 shadow-xs space-y-4">
        <h3 className="text-[14px] font-bold text-[#212b36] dark:text-foreground border-b border-[#f4f6f8] dark:border-border pb-3">
          Thông tin cửa hàng
        </h3>

        {/* LOGO UPLOAD SECTION VÀO THƯ VIỆN MEDIA */}
        <LogoUploadSection
          logo={formData.storeInfo?.logo || ''}
          logoMediaId={formData.storeInfo?.logoMediaId}
          onChange={({ logo, logoMediaId }) => {
            handleStoreChange('logo', logo);
            handleStoreChange('logoMediaId', logoMediaId);
          }}
        />

        {/* INPUTS 2 CỘT GỌN GÀNG CHUẨN SAPO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Tên cửa hàng *
            </label>
            <Input
              value={formData.storeInfo?.name || ''}
              onChange={(e) => handleStoreChange('name', e.target.value)}
              placeholder="VD: Cửa hàng PosDemo"
              required
              className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground focus:border-[#0088ff]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Tên kinh doanh
            </label>
            <Input
              value={formData.storeInfo?.businessName || ''}
              onChange={(e) => handleStoreChange('businessName', e.target.value)}
              placeholder="Nhập tên kinh doanh"
              className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground focus:border-[#0088ff]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Điện thoại
            </label>
            <Input
              value={formData.storeInfo?.phone || ''}
              onChange={(e) => handleStoreChange('phone', e.target.value)}
              placeholder="0949527013"
              className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground focus:border-[#0088ff]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Quốc gia
            </label>
            <select
              value="Vietnam"
              disabled
              className="w-full h-9 px-3 text-[13px] border border-[#c4cdd5] dark:border-border rounded-[4px] bg-[#f4f6f8] dark:bg-muted/40 text-[#637381] dark:text-muted-foreground"
            >
              <option value="Vietnam">Vietnam</option>
            </select>
          </div>

          <AddressApiSelect
            label="Tỉnh/Thành phố"
            placeholder="Chọn tỉnh thành"
            value={formData.storeInfo?.address?.province || ''}
            type="province"
            source="ghtk"
            onChange={(item) => {
              handleAddressChange('province', item.name);
              handleAddressChange('provinceId', item.id);
              setSelectedProvince(item);
              setSelectedDistrict(null);
              handleAddressChange('district', '');
              handleAddressChange('ward', '');
              setAutoOpenWard(true);
            }}
          />

          <AddressApiSelect
            label="Phường/Xã"
            placeholder="Chọn phường xã"
            value={formData.storeInfo?.address?.ward || ''}
            type="ward"
            source="ghtk"
            parentId={selectedProvince?.id || formData.storeInfo?.address?.provinceId}
            autoOpen={autoOpenWard}
            onAutoOpenHandled={() => setAutoOpenWard(false)}
            onChange={(item) => {
              handleAddressChange('ward', item.name);
              handleAddressChange('wardCode', item.code);
              // Tự động gán districtName từ GHTK ward data nếu có
              if (item.districtName) {
                handleAddressChange('district', item.districtName);
              }
            }}
          />

          {/* GHTK LEVEL 4 ĐỊA CHỈ ĐẶC BIỆT (TÒA NHÀ, HẺM, ĐƯỜNG) */}
          <GhtkSpecialAddressInput
            label="Tòa nhà, hẻm, đường"
            placeholder="Chọn hoặc tìm tòa nhà, hẻm, đường..."
            value={formData.storeInfo?.address?.street || ''}
            province={formData.storeInfo?.address?.province || ''}
            district={formData.storeInfo?.address?.district || ''}
            ward={formData.storeInfo?.address?.ward || ''}
            onChange={(val) => handleAddressChange('street', val)}
          />

          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Địa chỉ chi tiết (Số nhà, số phòng...)
            </label>
            <Input
              value={formData.storeInfo?.address?.detailNumber || ''}
              onChange={(e) => handleAddressChange('detailNumber', e.target.value)}
              placeholder="VD: Số 12, Tầng 3..."
              className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground focus:border-[#0088ff]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Email quản trị
            </label>
            <Input
              type="email"
              value={formData.storeInfo?.adminEmail || ''}
              onChange={(e) => handleStoreChange('adminEmail', e.target.value)}
              placeholder="Nhập email"
              className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground focus:border-[#0088ff]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Email gửi thông báo
            </label>
            <Input
              type="email"
              value={formData.storeInfo?.supportEmail || ''}
              onChange={(e) => handleStoreChange('supportEmail', e.target.value)}
              placeholder="Nhập email"
              className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground focus:border-[#0088ff]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Lĩnh vực kinh doanh
            </label>
            <select
              value={formData.storeInfo?.industry || 'Khác'}
              onChange={(e) => handleStoreChange('industry', e.target.value)}
              className="w-full h-9 px-3 text-[13px] border border-[#c4cdd5] dark:border-border rounded-[4px] bg-white dark:bg-background text-[#212b36] dark:text-foreground focus:outline-none focus:border-[#0088ff]"
            >
              <option value="Khác">Khác</option>
              <option value="Thời trang & Phụ kiện">Thời trang & Phụ kiện</option>
              <option value="Mỹ phẩm & Làm đẹp">Mỹ phẩm & Làm đẹp</option>
              <option value="Điện tử & Đồ gia dụng">Điện tử & Đồ gia dụng</option>
              <option value="Thực phẩm & Đồ uống">Thực phẩm & Đồ uống</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Loại hình kinh doanh
            </label>
            <select
              value={formData.storeInfo?.businessType || 'Chưa xác định'}
              onChange={(e) => handleStoreChange('businessType', e.target.value)}
              className="w-full h-9 px-3 text-[13px] border border-[#c4cdd5] dark:border-border rounded-[4px] bg-white dark:bg-background text-[#212b36] dark:text-foreground focus:outline-none focus:border-[#0088ff]"
            >
              <option value="Chưa xác định">Chưa xác định</option>
              <option value="Cá nhân / Hộ kinh doanh">Cá nhân / Hộ kinh doanh</option>
              <option value="Doanh nghiệp / Công ty">Doanh nghiệp / Công ty</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. TIÊU CHUẨN & ĐỊNH DẠNG (SAPO 100% COMPACT CARD) */}
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-5 shadow-xs space-y-4">
        <h3 className="text-[14px] font-bold text-[#212b36] dark:text-foreground border-b border-[#f4f6f8] dark:border-border pb-3">
          Tiêu chuẩn & định dạng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Múi giờ
            </label>
            <select
              value={formData.standards?.timezone || 'GMT+07:00'}
              onChange={(e) => handleStandardChange('timezone', e.target.value)}
              className="w-full h-9 px-3 text-[13px] border border-[#c4cdd5] dark:border-border rounded-[4px] bg-white dark:bg-background text-[#212b36] dark:text-foreground focus:outline-none focus:border-[#0088ff]"
            >
              <option value="GMT+07:00">(UTC+07:00) Bangkok, Hanoi, Jakarta</option>
              <option value="GMT+08:00">(UTC+08:00) Singapore, Kuala Lumpur</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Khối lượng mặc định
            </label>
            <select
              value={formData.standards?.weightUnit || 'gram'}
              onChange={(e) => handleStandardChange('weightUnit', e.target.value)}
              className="w-full h-9 px-3 text-[13px] border border-[#c4cdd5] dark:border-border rounded-[4px] bg-white dark:bg-background text-[#212b36] dark:text-foreground focus:outline-none focus:border-[#0088ff]"
            >
              <option value="gram">Gram (g)</option>
              <option value="kg">Kilogram (kg)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-[#212b36] dark:text-foreground">Tiền tệ</label>
              <button type="button" className="text-[12px] text-[#0088ff] hover:underline font-medium">
                Thay đổi định dạng
              </button>
            </div>
            <select
              value={formData.standards?.currency || 'VND'}
              onChange={(e) => handleStandardChange('currency', e.target.value)}
              className="w-full h-9 px-3 text-[13px] border border-[#c4cdd5] dark:border-border rounded-[4px] bg-white dark:bg-background text-[#212b36] dark:text-foreground focus:outline-none focus:border-[#0088ff]"
            >
              <option value="VND">Việt Nam đồng (VND)</option>
              <option value="USD">Đô la Mỹ (USD)</option>
            </select>
          </div>
        </div>

        <label className="flex items-start gap-2.5 pt-2 cursor-pointer text-[#212b36] dark:text-foreground text-[13px]">
          <input
            type="checkbox"
            checked={formData.standards?.hasDecimal || false}
            onChange={(e) => handleStandardChange('hasDecimal', e.target.checked)}
            className="mt-0.5 rounded-[3px] text-[#0088ff]"
          />
          <div>
            <span className="font-medium">Định dạng số tiền có 2 số thập phân</span>
            <p className="text-[12px] text-[#637381] dark:text-muted-foreground mt-0.5 leading-relaxed">
              Áp dụng cho nghiệp vụ quản lý: Giá vốn sản phẩm, Đặt hàng nhập, Nhập hàng, Trả hàng nhập, Sổ Quỹ, các Báo cáo
            </p>
          </div>
        </label>
      </div>

      {/* 3. ĐỊNH DẠNG MÃ ĐƠN HÀNG (SAPO 100% COMPACT CARD) */}
      <div className="bg-white dark:bg-card border border-[#dfe3e8] dark:border-border rounded-[6px] p-5 shadow-xs space-y-4">
        <h3 className="text-[14px] font-bold text-[#212b36] dark:text-foreground border-b border-[#f4f6f8] dark:border-border pb-3">
          Định dạng mã đơn hàng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Tiền tố (Prefix)
            </label>
            <Input
              value={formData.orderCode?.prefix ?? '#'}
              onChange={(e) => handleOrderCodeChange('prefix', e.target.value)}
              placeholder="VD: # hoặc DH"
              className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground font-mono focus:border-[#0088ff]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#212b36] dark:text-foreground mb-1.5">
              Hậu tố (Suffix)
            </label>
            <Input
              value={formData.orderCode?.suffix ?? ''}
              onChange={(e) => handleOrderCodeChange('suffix', e.target.value)}
              placeholder="VD: -HN hoặc -POS"
              className="h-9 text-[13px] rounded-[4px] border-[#c4cdd5] dark:border-border dark:bg-background dark:text-foreground font-mono focus:border-[#0088ff]"
            />
          </div>
        </div>

        <div className="text-[12px] text-[#637381] dark:text-muted-foreground pt-1">
          Mã đơn hàng sẽ được áp dụng là:{' '}
          <span className="font-semibold text-[#0088ff] font-mono">
            {prefix}{num}{suffix}, {prefix}{num + 1}{suffix}, {prefix}{num + 2}{suffix}...
          </span>
        </div>
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#0088ff] hover:bg-[#0077e6] text-white px-5 py-2 rounded-[4px] text-[13px] font-medium shadow-xs active:scale-[0.98] transition-transform cursor-pointer"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
}
