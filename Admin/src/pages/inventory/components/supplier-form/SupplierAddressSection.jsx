import React from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SupplierAddressSection({
  addressTab,
  setAddressTab,
  selectedNewProvince,
  handleSelectNewProvince,
  newProvinces,
  selectedNewWard,
  handleSelectNewWard,
  newWards,
  loadingNewLocations,
  selectedOldProvince,
  handleSelectOldProvince,
  oldProvinces,
  selectedOldDistrict,
  handleSelectOldDistrict,
  oldDistricts,
  loadingOldLocations,
  selectedOldWard,
  handleSelectOldWard,
  oldWards,
  detailAddress,
  setDetailAddress,
  fullAddressPreview,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-4 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            2. Địa chỉ nhà cung cấp
          </span>
        </div>

        <div className="flex items-center bg-muted p-0.5 rounded-[6px] border border-border">
          <button
            type="button"
            onClick={() => setAddressTab('new')}
            className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
              addressTab === 'new'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Địa chỉ mới (2 cấp)
          </button>
          <button
            type="button"
            onClick={() => setAddressTab('old')}
            className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
              addressTab === 'old'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Địa chỉ cũ (3 cấp)
          </button>
        </div>
      </div>

      {addressTab === 'new' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-[6px] border border-border/60">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Tỉnh / Thành phố mới
            </label>
            <select
              value={selectedNewProvince?._id || selectedNewProvince?.ProvinceID || selectedNewProvince?.id || ''}
              onChange={handleSelectNewProvince}
              className="w-full h-9 px-2.5 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer"
            >
              <option value="">-- Chọn Tỉnh / Thành phố mới --</option>
              {newProvinces.map((p) => {
                const id = p._id || p.ProvinceID || p.id;
                const pName = p.name || p.ProvinceName;
                return (
                  <option key={id} value={id}>
                    {pName}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Phường / Xã mới
            </label>
            <select
              value={selectedNewWard?._id || selectedNewWard?.code || selectedNewWard?.WardCode || ''}
              onChange={handleSelectNewWard}
              disabled={!selectedNewProvince || loadingNewLocations}
              className="w-full h-9 px-2.5 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer disabled:opacity-50"
            >
              <option value="">
                {loadingNewLocations
                  ? 'Đang tải danh sách...'
                  : !selectedNewProvince
                  ? '-- Chọn Tỉnh trước --'
                  : '-- Chọn Phường / Xã mới --'}
              </option>
              {newWards.map((w) => {
                const codeVal = w._id || w.code || w.WardCode;
                const wName = w.name || w.WardName;
                return (
                  <option key={codeVal} value={codeVal}>
                    {wName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {addressTab === 'old' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-muted/20 p-3.5 rounded-[6px] border border-border/60">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Tỉnh / TP
            </label>
            <select
              value={selectedOldProvince?.ProvinceID || ''}
              onChange={handleSelectOldProvince}
              className="w-full h-9 px-2 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer"
            >
              <option value="">-- Chọn Tỉnh --</option>
              {oldProvinces.map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID}>
                  {p.ProvinceName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Quận / Huyện
            </label>
            <select
              value={selectedOldDistrict?.DistrictID || ''}
              onChange={handleSelectOldDistrict}
              disabled={!selectedOldProvince || loadingOldLocations}
              className="w-full h-9 px-2 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer disabled:opacity-50"
            >
              <option value="">
                {loadingOldLocations ? 'Đang tải...' : '-- Chọn Quận --'}
              </option>
              {oldDistricts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Phường / Xã
            </label>
            <select
              value={selectedOldWard?.WardCode || ''}
              onChange={handleSelectOldWard}
              disabled={!selectedOldDistrict || loadingOldLocations}
              className="w-full h-9 px-2 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer disabled:opacity-50"
            >
              <option value="">
                {loadingOldLocations ? 'Đang tải...' : '-- Chọn Phường --'}
              </option>
              {oldWards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">
          Địa chỉ chi tiết (Số nhà, tòa nhà, ngõ/ngách, tên đường...)
        </label>
        <Input
          type="text"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          placeholder="VD: Tòa nhà Green Park, 29 Lê Duẩn..."
          className="rounded-[6px] h-9 text-xs"
        />
      </div>

      {fullAddressPreview && (
        <div className="p-2.5 rounded-[6px] bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-2">
          <span className="font-semibold text-foreground shrink-0">Địa chỉ hiển thị:</span>
          <span className="truncate">{fullAddressPreview}</span>
        </div>
      )}
    </div>
  );
}
