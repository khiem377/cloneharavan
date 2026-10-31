import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRightIcon } from '@/components/ui/Icons';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';
import { usePendingOrdersCount } from '@/hooks/useOrders';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavSubMenuItem({ item, validChildren }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

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
            "rounded-[6px] transition-colors active:scale-[0.98] py-1.5",
            isAnyActive && "bg-primary/10 font-medium"
          )}
        >
          <div className={cn("w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0", item.color)}>
            <Icon size={19} />
          </div>
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
          "rounded-[6px] transition-colors active:scale-[0.98] font-normal text-sidebar-foreground py-1.5",
          isAnyActive && "bg-primary/10 text-primary font-medium"
        )}
      >
        <div className={cn("w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", item.color)}>
          <Icon size={19} />
        </div>
        <span className="flex-1 text-left truncate text-xs font-medium">{item.label}</span>
        <ChevronRightIcon
          size={14}
          className={cn('text-muted-foreground transition-transform duration-200 shrink-0', open && 'rotate-90 text-primary')}
        />
      </SidebarMenuButton>

      {open && (
        <SidebarMenuSub className="border-l border-border/60 ml-5 pl-2.5 my-1 space-y-0.5">
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

export function NavSingleItem({ item }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { pendingCount } = usePendingOrdersCount();
  const isOrders = item.to === '/orders';
  const [showTooltip, setShowTooltip] = useState(false);

  const Icon = item.icon;
  const isActive = item.to === '/dashboard'
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to);

  const displayPendingCount = pendingCount > 99 ? '99+' : pendingCount;

  return (
    <SidebarMenuItem className="relative">
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => navigate(item.to)}
        className={cn(
          "rounded-[6px] transition-colors active:scale-[0.98] font-normal text-sidebar-foreground py-1.5",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-accent/60 hover:text-foreground",
          isOrders && "!overflow-visible"
        )}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <div className={cn("w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", item.color)}>
            <Icon size={19} />
          </div>
          {isCollapsed && isOrders && pendingCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-sidebar"
              title={`${pendingCount} đơn hàng chờ duyệt`}
            />
          )}
        </div>
        <span className="flex-1 truncate text-xs font-medium">{item.label}</span>
        {!isCollapsed && isOrders && pendingCount > 0 && (
          <div
            className="relative ml-auto flex items-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span
              className="inline-flex items-center justify-center h-[20px] min-w-[24px] px-1.5 rounded-[6px] text-[11px] font-semibold tabular-nums leading-none tracking-tight shrink-0 select-none bg-rose-500 text-white shadow-xs cursor-pointer font-mono"
            >
              <span className="size-1.5 rounded-full mr-1 shrink-0 bg-white" />
              {displayPendingCount}
            </span>

            {showTooltip && (
              <div className="absolute bottom-full right-0 mb-2 z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-100">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-zinc-900 text-white text-[11px] font-medium shadow-xs border border-zinc-700/80 whitespace-nowrap">
                  <span className="size-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span className="tabular-nums font-mono">{pendingCount} đơn hàng chờ duyệt</span>
                </div>
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-900 ml-auto mr-2.5" />
              </div>
            )}
          </div>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavGroupItem({ item }) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const hasAnyPermission = useAuthStore((s) => s.hasAnyPermission);

  const checkPerm = (it) => {
    if (Array.isArray(it.permission)) return hasAnyPermission(it.permission);
    if (Array.isArray(it.permissions)) return hasAnyPermission(it.permissions);
    if (typeof it.permission === 'string') return hasPermission(it.permission);
    return true;
  };

  if (!checkPerm(item)) {
    return null;
  }

  if (item.children) {
    const validChildren = item.children.filter(checkPerm);
    if (validChildren.length === 0) return null;
    return <NavSubMenuItem item={item} validChildren={validChildren} />;
  }

  return <NavSingleItem item={item} />;
}

