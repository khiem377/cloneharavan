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
  ListIcon,
  PlusIcon,
  ImportIcon,
  CategoriesIcon,
  BrandsIcon,
  ChevronsUpDownIcon,
  KeyIcon,
  UserIcon,
  SparklesIcon,
  CouponsIcon,
  GiftIcon,
  DiscountIcon,
  Layers as VariantsIcon,
  MenuNavIcon,
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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const NAV_GROUPS = [
  {
    label: 'Quản lý',
    items: [
      { to: '/dashboard', icon: DashboardIcon, label: 'Dashboard' },
      { to: '/media', icon: MediaIcon, label: 'Media', permission: 'media.manage' },
      { to: '/banners', icon: BannersIcon, label: 'Banners', permission: 'media.manage' },
    ],
  },
  {
    label: 'Sản phẩm',
    items: [
      {
        icon: ProductsIcon,
        label: 'Sản phẩm',
        permission: 'product.view',
        children: [
          { to: '/products', icon: ListIcon, label: 'Danh sách', permission: 'product.view' },
          { to: '/products/new', icon: PlusIcon, label: 'Tạo mới', permission: 'product.create' },
          { to: '/products/import', icon: ImportIcon, label: 'Import / Export', permission: 'product.create' },
          { to: '/categories', icon: CategoriesIcon, label: 'Danh mục', permission: 'category.manage' },
          { to: '/brands', icon: BrandsIcon, label: 'Thương hiệu', permission: 'brand.manage' },
          { to: '/products?view=variants', icon: VariantsIcon, label: 'Biến thể', permission: 'product.view' },
        ],
      },
    ],
  },
  {
    label: 'Khuyến mãi',
    items: [
      {
        icon: CouponsIcon,
        label: 'Khuyến mãi',
        permission: 'promotion.view',
        children: [
          { to: '/promotions/coupons', icon: CouponsIcon, label: 'Mã giảm giá', permission: 'promotion.view' },
          { to: '/promotions/discounts', icon: DiscountIcon, label: 'Chương trình khuyến mãi', permission: 'promotion.manage' },
          { to: '/promotions/gifts', icon: GiftIcon, label: 'Chương trình tặng kèm', permission: 'promotion.manage' },
          { to: '/promotions/flash-sales', icon: SparklesIcon, label: 'Flash Sale', permission: 'promotion.manage' },
        ],
      },
    ],
  },
  {
    label: 'Blog',
    items: [
      {
        icon: SparklesIcon,
        label: 'Blog',
        permission: 'blog.view',
        children: [
          { to: '/blog/posts', icon: ListIcon, label: 'Bài viết', permission: 'blog.view' },
          { to: '/blog/posts/new', icon: PlusIcon, label: 'Tạo bài mới', permission: 'blog.create' },
          { to: '/blog/categories', icon: CategoriesIcon, label: 'Danh mục', permission: 'blog.edit' },
          { to: '/blog/tags', icon: KeyIcon, label: 'Tags', permission: 'blog.edit' },
        ],
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/menus', icon: MenuNavIcon, label: 'Điều hướng', permission: 'menu.manage' },
      { to: '/roles', icon: KeyIcon, label: 'Vai trò & Quyền', permission: 'role.manage' },
      { to: '/settings', icon: SettingsIcon, label: 'Cài đặt', permission: 'role.manage' },
    ],
  },
];


function NavGroupItem({ item }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const hasPermission = useAuthStore((s) => s.hasPermission);

  // Kiểm tra quyền item cha
  if (item.permission && !hasPermission(item.permission)) {
    return null;
  }

  if (item.children) {
    // Lọc các children mà user có quyền
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
          onClick={() => setOpen(o => !o)}
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronRightIcon
            size={15}
            className={cn('text-sidebar-foreground/50 transition-transform duration-200', open && 'rotate-90')}
          />
        </SidebarMenuButton>

        {open && (
          <SidebarMenuSub>
            {validChildren.map(child => {
              const CIcon = child.icon;
              const isActive = location.pathname.startsWith(child.to);
              return (
                <SidebarMenuSubItem key={child.to}>
                  <SidebarMenuSubButton
                    isActive={isActive}
                    onClick={() => navigate(child.to)}
                  >
                    <CIcon className="size-3.5 shrink-0" />
                    <span>{child.label}</span>
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
      >
        <Icon className="size-4 shrink-0" />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function UserFooterMenu({ onProfile, onChangePass }) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore(s => s.clearAuth);
  const user = useAuthStore(s => s.user);
  const [open, setOpen] = useState(false);
  const initials = (user?.fullName?.[0] || user?.email?.[0] || 'A').toUpperCase();
  // icons used inline below come from Icons.jsx via named imports above

  const handleLogout = async () => {
    try { await authService.logout(); } catch { }
    clearAuth();
    navigate('/login');
    toast.info('Đã đăng xuất');
  };

  return (
    <div className="relative w-full">
      <SidebarMenuButton
        onClick={() => setOpen(o => !o)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {initials}
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="truncate text-xs font-medium text-sidebar-foreground">{user?.fullName || 'Admin'}</span>
            <span className="truncate text-[10px] text-sidebar-foreground/60">{user?.email || ''}</span>
          </div>
        </div>
        <ChevronsUpDownIcon size={14} className="shrink-0 text-sidebar-foreground/40" />
      </SidebarMenuButton>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-50 mb-1.5 w-56 rounded-lg border border-border bg-popover text-popover-foreground shadow-md py-1">
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user?.fullName || 'Admin'}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email || ''}</p>
              </div>
            </div>
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => { setOpen(false); onProfile(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <UserIcon size={15} className="text-muted-foreground shrink-0" />
              Thông tin tài khoản
            </button>
            <button
              onClick={() => { setOpen(false); onChangePass(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <KeyIcon size={15} className="text-muted-foreground shrink-0" />
              Đổi mật khẩu
            </button>
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOutIcon size={15} className="shrink-0" />
              Đăng xuất
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AppSidebar({ onProfile, onChangePass }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SparklesIcon size={16} />
          </div>
          <div className="flex flex-col text-left overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-sidebar-foreground"> Admin Panel</span>
            <span className="truncate text-[11px] text-sidebar-foreground/60">Quản trị hệ thống</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, i) => (
                  <NavGroupItem key={item.to ?? i} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <UserFooterMenu onProfile={onProfile} onChangePass={onChangePass} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
