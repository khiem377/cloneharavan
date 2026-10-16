import { Users, Save, Loader2, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchableSelect from '@/components/ui/SearchableSelect';

const ROLE_LABELS = {
  inventory_manager: 'Thủ kho',
  staff: 'Nhân viên kho',
  manager: 'Quản lý',
  administrator: 'Quản trị viên',
  admin: 'Quản trị viên',
};

export default function WarehouseStaffTab({
  form,
  staffCandidates,
  loadingStaff,
  handleAssignStaff,
  handleRemoveStaff,
  warehouses,
  selectedWarehouseId,
  saving,
}) {
  return (
    <div className="p-5 space-y-4">
      <div className="p-4 rounded-[6px] border border-border bg-background shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Danh sách nhân viên quản lý & vận hành: {form.name || 'Kho hàng'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nhân viên được gán vào đây sẽ được cấp quyền theo dõi tồn kho, lập và duyệt các chứng từ Nhập kho (PNK), Xuất kho (PXK), Kiểm kho và Chuyển kho nội bộ tại chi nhánh này.
            </p>
          </div>

          <Badge variant="outline" className="h-6 px-2.5 text-xs font-mono tabular-nums self-start sm:self-auto">
            {form.assignedStaffIds?.length || 0} nhân sự
          </Badge>
        </div>

        {/* Thanh chọn nhân viên gán vào kho */}
        <div className="mb-4">
          <Label className="text-xs font-semibold text-foreground mb-1.5 block">
            Thêm nhân viên vào kho này
          </Label>
          <div className="max-w-xl">
            <SearchableSelect
              options={staffCandidates
                .filter((s) => !form.assignedStaffIds.includes(s._id))
                .map((s) => ({
                  value: s._id,
                  label: `${s.fullName || s.name || 'Nhân viên'} (${s.email}) — [${ROLE_LABELS[s.role] || s.role || 'Nhân viên'}]`,
                }))}
              value=""
              onChange={(val) => {
                if (val) handleAssignStaff(val);
              }}
              placeholder="Tìm theo tên hoặc email nhân viên để thêm..."
              disabled={loadingStaff}
            />
          </div>
        </div>

        {/* Danh sách thẻ nhân viên */}
        {form.assignedStaffIds.length === 0 ? (
          <div className="rounded-[6px] border border-dashed border-border p-8 text-center bg-muted/10">
            <Users size={32} className="mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-xs font-semibold text-foreground">Chưa có nhân viên nào được phân công riêng cho kho này</p>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-md mx-auto">
              Tài khoản Quản trị viên (Admin) vẫn có toàn quyền kiểm soát kho. Bạn có thể chọn nhân sự ở ô phía trên để phân quyền thủ kho hoặc nhân viên vận hành.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                  className="p-3 rounded-[6px] border border-border bg-card hover:border-primary/40 transition-colors shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-foreground truncate">
                          {name}
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-0.5 uppercase rounded-[4px]">
                          {ROLE_LABELS[role] || role}
                        </Badge>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(staffId)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted transition-colors cursor-pointer shrink-0"
                      title="Gỡ nhân viên khỏi kho này"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-border/50 text-[11px] text-muted-foreground space-y-0.5">
                    <div className="truncate flex items-center gap-1">
                      <span>📧</span> {email || 'Chưa có email'}
                    </div>
                    {phone && (
                      <div className="tabular-nums font-mono flex items-center gap-1">
                        <span>📞</span> {phone}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            * Nhớ bấm nút <strong>"Lưu kho"</strong> ở góc trên bên phải để áp dụng thay đổi.
          </span>
          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={saving}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span>Lưu phân công nhân viên</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
