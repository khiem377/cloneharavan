import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Image, ImagePlay, Tag, ShoppingBag,
  Settings, LogOut, ChevronRight, List, Plus,
  Download, FolderTree, Layers, ChevronsUpDown,
  KeyRound, User, Sparkles
} from 'lucide-react';
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
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/media',     icon: Image,           label: 'Media'     },
      { to: '/banners',   icon: ImagePlay,       label: 'Banners'   },
    ],
  },
  {
    label: 'Sản phẩm',
    items: [
      {
        icon: ShoppingBag,
        label: 'Sản phẩm',
        children: [
          { to: '/products',        icon: List,       label: 'Danh sách'     },
          { to: '/products/new',    icon: Plus,       label: 'Tạo mới'       },
          { to: '/products/import', icon: Download,   label: 'Import / Export'},
          { to: '/categories',      icon: FolderTree, label: 'Danh mục'      },
          { to: '/brands',          icon: Layers,     label: 'Thương hiệu'   },
        ],
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/settings', icon: Settings, label: 'Cài đặt' },
    ],
  },
];

const CHILD_ROUTES = ['/products', '/products/new', '/products/import', '/categories', '/brands'];

function NavGroupItem({ item }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  if (item.children) {
    const isAnyActive = CHILD_ROUTES.some(r =>
      r === '/products' ? location.pathname === r : location.pathname.startsWith(r)
    );
    const [open, setOpen] = useState(isAnyActive);
    const Icon = item.icon;

    if (isCollapsed) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={isAnyActive}
            onClick={() => navigate('/products')}
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
          <ChevronRight
            className={cn('size-4 text-sidebar-foreground/50 transition-transform duration-200', open && 'rotate-90')}
          />
        </SidebarMenuButton>

        {open && (
          <SidebarMenuSub>
            {item.children.map(child => {
              const CIcon = child.icon;
              const isActive = child.to === '/products'
                ? location.pathname === child.to
                : location.pathname.startsWith(child.to);
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

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
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
        <ChevronsUpDown className="size-3.5 shrink-0 text-sidebar-foreground/40" />
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
              <User className="size-4 text-muted-foreground" />
              Thông tin tài khoản
            </button>
            <button
              onClick={() => { setOpen(false); onChangePass(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <KeyRound className="size-4 text-muted-foreground" />
              Đổi mật khẩu
            </button>
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="size-4" />
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
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col text-left overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">EGA Admin</span>
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
