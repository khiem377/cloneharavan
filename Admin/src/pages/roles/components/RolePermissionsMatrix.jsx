import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchIcon as Search, CheckSquare, Square, Info } from '@/components/ui/Icons';
import SearchableSelect from '@/components/ui/SearchableSelect';

const MODULE_NAMES = {
  dashboard: 'Thống kê Dashboard',
  orders: 'Đơn hàng & Vận chuyển',
  products: 'Sản phẩm & Biến thể',
  product_variants: 'Thuộc tính Biến thể',
  categories: 'Danh mục Sản phẩm',
  brands: 'Thương hiệu',
  suppliers: 'Nhà cung cấp & Đối tác',
  purchase_orders: 'Đơn mua hàng & Nhập kho (PO)',
  stock_exports: 'Phiếu xuất kho',
  stock_audits: 'Kiểm kê & Báo cáo kho',
  stock_movements: 'Biến động & Cảnh báo kho',
  coupons: 'Mã giảm giá (Coupons)',
  promotions: 'Chương trình Khuyến mãi',
  gift_programs: 'Quà tặng kèm',
  flash_sales: 'Flash Sale sốc',
  blogs: 'Bài viết & Blog',
  blog_categories: 'Danh mục Blog',
  tags: 'Nhãn thẻ Tags',
  media: 'Thư viện Media & Thư mục',
  banners: 'Banner Quảng cáo',
  menus: 'Điều hướng Menu Header/Footer',
  users: 'Tài khoản & Nhân viên',
  customer_groups: 'Nhóm Khách hàng',
  roles: 'Vai trò & Phân quyền',
  audit_logs: 'Nhật ký thao tác (Audit Logs)',
  settings: 'Cài đặt Hệ thống',
};


export default function RolePermissionsMatrix({
  formData,
  permissionsGrouped = {},
  searchQuery,
  setSearchQuery,
  selectedModule,
  setSelectedModule,
  onTogglePermission,
  onToggleModuleAll,
  onToggleSelectAll,
  isAdministrator = false,
}) {
  const filteredGroupedPermissions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = {};

    Object.entries(permissionsGrouped).forEach(([modKey, perms]) => {
      if (selectedModule !== 'all' && selectedModule !== modKey) return;

      const matchedPerms = perms.filter((p) => {
        if (!query) return true;
        return (
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
        );
      });

      if (matchedPerms.length > 0) {
        result[modKey] = matchedPerms;
      }
    });

    return result;
  }, [permissionsGrouped, searchQuery, selectedModule]);

  if (isAdministrator) {
    return (
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-[6px] text-amber-700 dark:text-amber-400 text-xs flex items-center gap-3">
        <Info className="size-5 shrink-0" />
        <div>
          <div className="font-bold">Vai trò Administrator Tối Cao</div>
          <div className="text-xs mt-0.5 opacity-90">
            Tài khoản sở hữu vai trò này có <strong>Full Quyền Tuyệt Đối (*)</strong> trên toàn bộ các tính năng và API của hệ thống. Không cần tích chọn thủ công.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-[6px] border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Tìm kiếm mã quyền hoặc tên quyền..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 rounded-[6px] text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <SearchableSelect
            className="w-52"
            options={[
              { label: `Tất cả nhóm (${Object.keys(permissionsGrouped).length} nhóm)`, value: 'all' },
              ...Object.keys(permissionsGrouped).map((modKey) => ({
                label: MODULE_NAMES[modKey] || modKey,
                value: modKey,
              })),
            ]}
            value={selectedModule}
            onChange={setSelectedModule}
            creatable={false}
            placeholder="Tất cả nhóm"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleSelectAll(true)}
            className="h-8 px-2.5 rounded-[6px] text-xs font-medium whitespace-nowrap active:scale-[0.98]"
          >
            Chọn Tất Cả
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onToggleSelectAll(false)}
            className="h-8 px-2.5 rounded-[6px] text-xs font-medium whitespace-nowrap text-muted-foreground active:scale-[0.98]"
          >
            Bỏ Chọn
          </Button>
        </div>
      </div>

      {/* Counter Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-mono tabular-nums">
        <span>Danh mục ma trận quyền hạn:</span>
        <span>
          Đã cấp <strong className="text-primary font-bold">{formData.permissions.length}</strong> quyền cho vai trò này
        </span>
      </div>

      {/* Danh sách nhóm Module & Permissions */}
      <div className="space-y-3 max-h-[calc(100vh-420px)] overflow-y-auto pr-1">
        {Object.keys(filteredGroupedPermissions).length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-[6px] text-xs font-mono">
            Không tìm thấy quyền nào phù hợp với từ khóa "{searchQuery}"
          </div>
        ) : (
          Object.entries(filteredGroupedPermissions).map(([modKey, perms]) => {
            const permIds = perms.map((p) => p._id);
            const checkedCount = permIds.filter((id) => formData.permissions.includes(id)).length;
            const allChecked = checkedCount === permIds.length && permIds.length > 0;

            return (
              <Card
                key={modKey}
                className="border border-border rounded-[6px] overflow-hidden shadow-none"
              >
                {/* Module Header Bar */}
                <div className="bg-muted/40 px-3.5 py-2.5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">
                      {MODULE_NAMES[modKey] || modKey}
                    </span>
                    <Badge variant="secondary" className="rounded-[4px] px-1.5 py-0 text-[10px] font-mono tabular-nums">
                      {checkedCount} / {perms.length}
                    </Badge>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleModuleAll(perms)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {allChecked ? (
                      <>
                        <Square className="size-3.5" /> Bỏ chọn nhóm
                      </>
                    ) : (
                      <>
                        <CheckSquare className="size-3.5" /> Chọn tất cả nhóm
                      </>
                    )}
                  </button>
                </div>

                {/* Permissions Checkbox Grid */}
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {perms.map((p) => {
                    const isChecked = formData.permissions.includes(p._id);
                    return (
                      <div
                        key={p._id}
                        onClick={() => onTogglePermission(p._id)}
                        className={`p-2.5 rounded-[4px] border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                          isChecked
                            ? 'bg-primary/10 border-primary/40 text-foreground'
                            : 'border-border hover:bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        <div className="mt-0.5">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => onTogglePermission(p._id)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-medium text-xs text-foreground line-clamp-1">
                              {p.name}
                            </span>
                            <code className="text-[10px] bg-muted px-1 py-0.2 rounded-[2px] font-mono text-muted-foreground shrink-0">
                              {p.code}
                            </code>
                          </div>
                          {p.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
