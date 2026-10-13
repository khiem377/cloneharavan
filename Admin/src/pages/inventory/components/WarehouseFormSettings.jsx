import { Building2, MapPin, Users, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SearchableSelect from '@/components/ui/SearchableSelect';

const ROLE_LABELS = {
  inventory_manager: 'Thủ kho',
  staff: 'Nhân viên kho',
  manager: 'Quản lý',
  administrator: 'Quản trị viên',
  admin: 'Quản trị viên',
};

export default function WarehouseFormSettings({
  form,
  setForm,
  provinces,
  loadingProvinces,
  districts,
  loadingDistricts,
  wards,
  loadingWards,
  handleProvinceChange,
  handleDistrictChange,
  handleWardChange,
  fullAddressPreview,
  staffCandidates,
  loadingStaff,
  handleAssignStaff,
  handleRemoveStaff,
  warehouses,
  selectedWarehouseId,
}) {
  return (
    <div className="p-5 space-y-6">
      {/* 1. Thông tin chung */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Building2 size={14} className="text-primary" />
          Thông tin chung
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Tên kho hàng <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              required
              placeholder="Ví dụ: Kho Tổng Bình Tân"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-9 text-xs rounded-[6px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Mã kho <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              required
              placeholder="KHO-BINHTAN"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase().trim() })
              }
              className="h-9 text-xs font-mono uppercase rounded-[6px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Số điện thoại liên hệ
            </Label>
            <Input
              type="tel"
              placeholder="0987654321"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="h-9 text-xs font-mono tabular-nums rounded-[6px]"
            />
          </div>
        </div>

        <div className="mt-3.5 flex items-center gap-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="rounded-[4px] border-border text-primary focus:ring-primary size-4"
            />
            <span>Đặt làm kho mặc định của hệ thống</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={form.status === 'active'}
              onChange={(e) =>
                setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })
              }
              className="rounded-[4px] border-border text-primary focus:ring-primary size-4"
            />
            <span>Trạng thái hoạt động</span>
          </label>
        </div>
      </div>

      {/* 2. Địa chỉ kho hàng (3-level GHN Selector chuẩn như Client) */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <MapPin size={14} className="text-primary" />
          Địa chỉ kho hàng (Chuẩn hóa bưu chính GHN)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Tỉnh / Thành phố <span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              options={provinces.map((p) => ({
                value: p.ProvinceID,
                label: p.ProvinceName,
              }))}
              value={form.address.provinceId}
              onChange={handleProvinceChange}
              placeholder="Chọn Tỉnh / Thành"
              disabled={loadingProvinces}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Quận / Huyện <span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              options={districts.map((d) => ({
                value: d.DistrictID,
                label: d.DistrictName,
              }))}
              value={form.address.districtId}
              onChange={handleDistrictChange}
              placeholder={
                !form.address.provinceId
                  ? 'Chọn tỉnh/thành trước'
                  : 'Chọn Quận / Huyện'
              }
              disabled={loadingDistricts || !form.address.provinceId}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Phường / Xã <span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              options={wards.map((w) => ({
                value: w.WardCode,
                label: w.WardName,
              }))}
              value={form.address.wardCode}
              onChange={handleWardChange}
              placeholder={
                !form.address.districtId
                  ? 'Chọn quận/huyện trước'
                  : 'Chọn Phường / Xã'
              }
              disabled={loadingWards || !form.address.districtId}
            />
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Địa chỉ chi tiết (Số nhà, tên đường, toà nhà...)
          </Label>
          <Input
            type="text"
            placeholder="Ví dụ: 38-40 Đường 21A, Tòa nhà T (QTSC9)..."
            value={form.address.detailAddress}
            onChange={(e) =>
              setForm({
                ...form,
                address: { ...form.address, detailAddress: e.target.value },
              })
            }
            className="h-9 text-xs rounded-[6px]"
          />
        </div>

        {/* Preview Địa chỉ chuẩn */}
        {fullAddressPreview && (
          <div className="mt-3 p-3 rounded-[6px] bg-muted/40 border border-border flex items-start gap-2 text-xs">
            <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground">
                Địa chỉ hoàn chỉnh hiển thị trên chứng từ:
              </span>
              <p className="text-muted-foreground">{fullAddressPreview}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Nhân viên phụ trách kho (Phân quyền truy cập) */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Users size={14} className="text-primary" />
              Nhân viên phụ trách kho
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Nhân viên được phân công vào kho này sẽ có quyền truy cập, theo dõi tồn kho và xử lý phiếu xuất nhập của riêng kho này.
            </p>
          </div>
        </div>

        {/* Select to assign staff */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
          <div className="flex-1">
            <SearchableSelect
              options={staffCandidates
                .filter((s) => !form.assignedStaffIds.includes(s._id))
                .map((s) => ({
                  value: s._id,
                  label: `${s.fullName || s.name || 'Nhân viên'} (${s.email}) — [${ROLE_LABELS[s.role] || s.role}]`,
                }))}
              value=""
              onChange={(val) => {
                if (val) handleAssignStaff(val);
              }}
              placeholder="Chọn nhân viên để gán vào kho này..."
              disabled={loadingStaff}
            />
          </div>
        </div>

        {/* List of currently assigned staff */}
        {form.assignedStaffIds.length === 0 ? (
          <div className="rounded-[6px] border border-dashed border-border p-3.5 text-center text-xs text-muted-foreground bg-muted/20">
            Chưa có nhân viên nào được chỉ định phụ trách kho này. (Quản trị viên có toàn quyền xem tất cả các kho).
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {form.assignedStaffIds.map((staffId) => {
              const selectedWh = warehouses.find((w) => w._id === selectedWarehouseId);
              const staffObj =
                staffCandidates.find((s) => s._id === staffId) ||
                (selectedWh?.assignedStaffIds || []).find((s) => (s._id || s) === staffId);
              const name = staffObj?.fullName || staffObj?.name || 'Nhân viên';
              const email = staffObj?.email || '';
              const role = staffObj?.role || 'staff';
              const phone = staffObj?.phone || '';

              return (
                <div
                  key={staffId}
                  className="flex items-center justify-between p-2.5 rounded-[6px] border border-border bg-background shadow-xs text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate flex items-center gap-1.5">
                        <span>{name}</span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 uppercase rounded-[4px]">
                          {ROLE_LABELS[role] || role}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {email} {phone ? `• ${phone}` : ''}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStaff(staffId)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                    title="Gỡ nhân viên khỏi kho"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
