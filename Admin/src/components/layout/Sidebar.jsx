import React from 'react';
import useAuthStore from '@/store/authStore';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NAV_GROUPS } from './sidebar/sidebarNavigationData';
import { NavGroupItem } from './sidebar/SidebarNavItems';
import SidebarHeaderStore from './sidebar/SidebarHeaderStore';
import UserFooterMenu from './sidebar/UserFooterMenu';

export default function AppSidebar({ onProfile, onChangePass }) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background">
      <SidebarHeaderStore />

      <SidebarContent className="px-2 py-2 space-y-4">
        {NAV_GROUPS.map((group) => {
          const checkItemPerm = (it) => {
            const auth = useAuthStore.getState();
            if (Array.isArray(it.permission)) return auth.hasAnyPermission(it.permission);
            if (Array.isArray(it.permissions)) return auth.hasAnyPermission(it.permissions);
            if (typeof it.permission === 'string') return auth.hasPermission(it.permission);
            return true;
          };

          const hasItemPermission = (item) => {
            if (!checkItemPerm(item)) return false;
            if (item.children) {
              return item.children.some(checkItemPerm);
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
                    <NavGroupItem key={item.to || item.label || i} item={item} />
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
