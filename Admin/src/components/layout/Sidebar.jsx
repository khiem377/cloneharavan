import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardIcon,
  MediaIcon,
  BannersIcon,
  ProductsIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronRightIcon,
  CategoriesIcon,
  BrandsIcon,
  ChevronsUpDownIcon,
  UserIcon,
  StoreFrontIcon,
  CouponsIcon,
  GiftIcon,
  DiscountIcon,
  MenuNavIcon,
  WarehouseNavIcon,
  StockDocNavIcon,
  SupplierNavIcon,
  PurchaseOrderNavIcon,
  PurchaseReturnNavIcon,
  StockExportNavIcon,
  StockAuditNavIcon,
  StockAlertNavIcon,
  InventoryReportNavIcon,
  StockHistoryNavIcon,
  ProductListNavIcon,
  ProductAddNavIcon,
  ProductImportNavIcon,
  VariantsNavIcon,
  FlashSaleNavIcon,
  BlogPostNavIcon,
  BlogCreateNavIcon,
  BlogCategoryNavIcon,
  BlogTagNavIcon,
  RolePermissionNavIcon,
  KeyIcon,
  Users,
  ShieldCheck,
} from '@/components/ui/Icons';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';

const NAV_GROUPS = [
  {
    label: 'Tổng quan & Media',
    items: [
      { to: '/dashboard', icon: DashboardIcon, label: 'Bảng điều khiển' },
      { to: '/media', icon: MediaIcon, label: 'Thư viện Media', permission: 'media.manage' },
      { to: '/media/unused', icon: BannersIcon, label: 'Dọn dẹp ảnh thừa', permission: 'media.manage' },
      { to: '/banners', icon: BannersIcon, label: 'Banner', permission: 'media.manage' },
    ],
  },
  {
    label: 'Sản phẩm & Danh mục',
    items: [
      {
        icon: ProductsIcon,
        label: 'Quản lý Sản phẩm',
        permission: 'product.view',
        children: [
          { to: '/products', icon: ProductListNavIcon, label: 'Danh sách sản phẩm', permission: 'product.view' },
          { to: '/products/new', icon: ProductAddNavIcon, label: 'Thêm sản phẩm mới', permission: 'product.create' },
          { to: '/products/import', icon: ProductImportNavIcon, label: 'Nhập / Xuất Excel', permission: 'product.create' },
          { to: '/categories', icon: CategoriesIcon, label: 'Danh mục sản phẩm', permission: 'category.manage' },
          { to: '/brands', icon: BrandsIcon, label: 'Thương hiệu', permission: 'brand.manage' },
          { to: '/products?view=variants', icon: VariantsNavIcon, label: 'Quản lý biến thể', permission: 'product.view' },
        ],
      },
    ],
  },
  {
    label: 'Kho hàng & Cung ứng',
    items: [
      {
        icon: WarehouseNavIcon,
        label: 'Quản lý Kho hàng',
        permission: 'purchase_order.view',
        children: [
          { to: '/stock-documents', icon: StockDocNavIcon, label: 'Đơn & Phiếu kho', permission: 'purchase_order.view' },
          { to: '/suppliers', icon: SupplierNavIcon, label: 'Nhà cung cấp', permission: 'supplier.view' },
          { to: '/purchase-orders', icon: PurchaseOrderNavIcon, label: 'Đơn mua hàng (PO)', permission: 'purchase_order.view' },
          { to: '/stock-receivings', icon: StockDocNavIcon, label: 'Phiếu nhập kho (PNK)', permission: 'purchase_order.view' },
          { to: '/purchase-returns', icon: PurchaseReturnNavIcon, label: 'Trả hàng nhập', permission: 'purchase_order.view' },
          { to: '/stock-exports', icon: StockExportNavIcon, label: 'Phiếu xuất kho', permission: 'stock_export.view' },
          { to: '/stock-audits', icon: StockAuditNavIcon, label: 'Kiểm kê & Cân bằng', permission: 'stock_audit.view' },
          { to: '/stock-alerts', icon: StockAlertNavIcon, label: 'Cảnh báo sắp hết hàng', permission: 'stock_movement.view' },
          { to: '/inventory-report', icon: InventoryReportNavIcon, label: 'Báo cáo tồn kho', permission: 'stock_audit.view' },
          { to: '/stock-movements', icon: StockHistoryNavIcon, label: 'Nhật ký biến động', permission: 'stock_movement.view' },
        ],
      },
    ],
  },
  {
    label: 'Marketing & Khuyến mãi',
    items: [
      {
        icon: CouponsIcon,
        label: 'Khuyến mãi & Giảm giá',
        permission: 'promotion.view',
        children: [
          { to: '/promotions/coupons', icon: CouponsIcon, label: 'Mã giảm giá (Coupon)', permission: 'promotion.view' },
          { to: '/promotions/discounts', icon: DiscountIcon, label: 'Chương trình ưu đãi', permission: 'promotion.manage' },
          { to: '/promotions/gifts', icon: GiftIcon, label: 'Quà tặng kèm', permission: 'promotion.manage' },
          { to: '/promotions/flash-sales', icon: FlashSaleNavIcon, label: 'Flash Sale giờ vàng', permission: 'promotion.manage' },
        ],
      },
    ],
  },
  {
    label: 'Nội dung & Khách hàng',
    items: [
      {
        icon: BlogPostNavIcon,
        label: 'Tin tức',
        permission: 'blog.view',
        children: [
          { to: '/blog/posts', icon: BlogPostNavIcon, label: 'Danh sách bài viết', permission: 'blog.view' },
          { to: '/blog/posts/new', icon: BlogCreateNavIcon, label: 'Viết bài mới', permission: 'blog.create' },
          { to: '/blog/categories', icon: BlogCategoryNavIcon, label: 'Chuyên mục bài viết', permission: 'blog.edit' },
          { to: '/blog/tags', icon: BlogTagNavIcon, label: 'Thẻ tag phân loại', permission: 'blog.edit' },
        ],
      },
      { to: '/customers', icon: Users, label: 'Khách hàng', permission: 'user.view' },
    ],
  },
  {
    label: 'Hệ thống & Cài đặt',
    items: [
      { to: '/staffs', icon: ShieldCheck, label: 'Nhân viên & Quản trị', permission: 'role.assign' },
      { to: '/roles', icon: RolePermissionNavIcon, label: 'Vai trò & Phân quyền', permission: 'role.manage' },
      { to: '/menus', icon: MenuNavIcon, label: 'Cấu hình Menu', permission: 'menu.manage' },
      { to: '/audit-logs', icon: StockHistoryNavIcon, label: 'Nhật ký thao tác', permission: 'audit_log.view' },
      { to: '/settings', icon: SettingsIcon, label: 'Cài đặt hệ thống', permission: 'role.manage' },
    ],
  },
];

function NavGroupItem({ item }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (item.permission && !hasPermission(item.permission)) {
    return null;
  }

  if (item.children) {
    const validChildren = item.children.filter((c) => !c.permission || hasPermission(c.permission));
    if (validChildren.length === 0) return null;

    const childRoutes = validChildren.map((c) => c.to);
    const isAnyActive = childRoutes.some((r) => location.pathname.startsWith(r));
    const [open, setOpen] = useState(isAnyActive);
    const Icon = item.icon;
    const firstChild = validChildren[0]?.to ?? '/';

    if (isCollapsed) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={isAnyActive}
            onClick={() => navigate(firstChild)}
            title={item.label}
            className={cn(
              "rounded-[6px] transition-colors active:scale-[0.98]",
              isAnyActive && "bg-primary/10 text-primary font-medium"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isAnyActive}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "rounded-[6px] transition-colors active:scale-[0.98] font-normal text-sidebar-foreground",
            isAnyActive && "bg-primary/10 text-primary font-medium"
          )}
        >
          <Icon className={cn("size-4 shrink-0 transition-colors", isAnyActive ? "text-primary" : "text-muted-foreground")} />
          <span className="flex-1 text-left truncate">{item.label}</span>
          <ChevronRightIcon
            size={14}
            className={cn('text-muted-foreground transition-transform duration-200 shrink-0', open && 'rotate-90 text-primary')}
          />
        </SidebarMenuButton>

        {open && (
          <SidebarMenuSub className="border-l border-border/60 ml-4 pl-2 my-1 space-y-0.5">
            {validChildren.map((child) => {
              const CIcon = child.icon;
              const isActive = location.pathname.startsWith(child.to);
              return (
                <SidebarMenuSubItem key={child.to}>
                  <SidebarMenuSubButton
                    isActive={isActive}
                    onClick={() => navigate(child.to)}
                    className={cn(
                      "rounded-[6px] text-xs transition-colors py-1.5 active:scale-[0.98]",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                    )}
                  >
                    <CIcon className={cn("size-3.5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span className="truncate">{child.label}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  const Icon = item.icon;
  const isActive = item.to === '/dashboard'
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => navigate(item.to)}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          "rounded-[6px] transition-colors active:scale-[0.98] text-sidebar-foreground",
          isActive
            ? "bg-primary text-primary-foreground font-medium shadow-xs"
            : "hover:bg-accent/60 hover:text-foreground"
        )}
      >
        <Icon className={cn("size-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
        <span className="truncate">{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function UserFooterMenu({ onProfile, onChangePass }) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const initials = (user?.fullName?.[0] || user?.email?.[0] || 'A').toUpperCase();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch { }
    clearAuth();
    navigate('/login');
    toast.info('Đã đăng xuất');
  };

  return (
    <div className="relative w-full">
      <SidebarMenuButton
        onClick={() => setOpen((o) => !o)}
        className="w-full justify-between rounded-[6px] border border-border/60 bg-surface/50 hover:bg-accent/60 p-2 h-auto active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {user?.avatar?.url ? (
            <img
              src={user.avatar.url}
              alt={user.fullName || 'Avatar'}
              referrerPolicy="no-referrer"
              className="size-8 shrink-0 rounded-[6px] object-cover border border-border"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground text-xs font-bold font-mono">
              {initials}
            </div>
          )}
          <div className="flex flex-col text-left overflow-hidden min-w-0">
            <span className="truncate text-xs font-semibold text-foreground">{user?.fullName || 'Quản trị viên'}</span>
            <span className="truncate text-[10px] text-muted-foreground font-mono">{user?.email || 'admin@haravan.vn'}</span>
          </div>
        </div>
        <ChevronsUpDownIcon size={14} className="shrink-0 text-muted-foreground ml-1" />
      </SidebarMenuButton>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-50 mb-2 w-60 rounded-[6px] border border-border bg-card text-card-foreground shadow-sm py-1 divide-y divide-border">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.fullName || 'Avatar'}
                  referrerPolicy="no-referrer"
                  className="size-8 shrink-0 rounded-[6px] object-cover border border-border"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground text-xs font-bold font-mono">
                  {initials}
                </div>
              )}
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{user?.fullName || 'Quản trị viên'}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đang hoạt động
                </span>
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <UserIcon size={14} className="text-muted-foreground shrink-0" />
                Hồ sơ & Tài khoản
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <KeyIcon size={14} className="text-muted-foreground shrink-0" />
                Đổi mật khẩu & Bảo mật
              </button>
            </div>


            <div className="py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOutIcon size={14} className="shrink-0" />
                Đăng xuất hệ thống
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AppSidebar({ onProfile, onChangePass }) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background">
      <SidebarHeader className="flex flex-row items-center justify-between border-b border-border px-3 py-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-primary text-primary-foreground shadow-xs">
            <StoreFrontIcon size={16} />
          </div>
          <div className="flex flex-col text-left overflow-hidden group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs font-bold tracking-tight text-foreground">Admin panel</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-[4px] bg-primary/10 text-primary text-[9px] font-mono font-semibold">
                PRO
              </span>
            </div>
            <span className="truncate text-[10px] text-muted-foreground">Trung tâm Quản trị</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 space-y-4">
        {NAV_GROUPS.map((group) => {
          const hasItemPermission = (item) => {
            if (item.permission && !useAuthStore.getState().hasPermission(item.permission)) {
              return false;
            }
            if (item.children) {
              return item.children.some(
                (c) => !c.permission || useAuthStore.getState().hasPermission(c.permission)
              );
            }
            return true;
          };

          const visibleItems = group.items.filter(hasItemPermission);
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label} className="p-0">
              <SidebarGroupLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 font-mono">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent className="pt-1">
                <SidebarMenu className="space-y-0.5">
                  {visibleItems.map((item, i) => (
                    <NavGroupItem key={item.to ?? i} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <UserFooterMenu onProfile={onProfile} onChangePass={onChangePass} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
