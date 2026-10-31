import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getRoleCustomIcon, RoleKeyCustomIcon } from './RoleCustomIcons';

export default function StaffRoleBadge({
  user,
  roleName,
  onOpenDrawer,
}) {
  const roleCode = (user.roleId?.code || user.role || '').toLowerCase();
  const isAdmin = roleCode === 'administrator' || roleCode === 'admin';
  const IconComponent = getRoleCustomIcon(roleCode);
  const hasCustom = Boolean(user.customPermissions && user.customPermissions.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpenDrawer?.(user, 'preview')}
        className={cn(
          'h-6 px-2.5 text-[11px] font-medium rounded-[6px] border transition-colors gap-1.5 cursor-pointer shadow-none active:scale-[0.98]',
          isAdmin
            ? 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 font-semibold'
            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
        )}
        title="Bấm để xem phân quyền vai trò"
      >
        <IconComponent
          size={13}
          className={cn(
            'shrink-0',
            isAdmin ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
          )}
        />
        <span>{roleName}</span>
      </Button>

      {hasCustom && (
        <Badge
          variant="outline"
          onClick={() => onOpenDrawer?.(user, 'custom_perms')}
          className="text-[10px] font-normal px-1.5 py-0.5 rounded-[6px] bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 cursor-pointer dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 inline-flex items-center gap-1"
          title={`Nhân viên có ${user.customPermissions.length} quyền riêng biệt`}
        >
          <RoleKeyCustomIcon size={11} className="shrink-0 text-slate-500" />
          <span>+{user.customPermissions.length} quyền riêng</span>
        </Badge>
      )}
    </div>
  );
}
