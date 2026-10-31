import React from 'react';
import { Plus, ShieldCheck, Lock, getRoleCustomIcon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Can from '@/components/auth/Can';

export default function RoleSidebar({
  roles = [],
  activeRoleId,
  isCreating,
  onSelectRole,
  onStartCreate,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none overflow-hidden flex flex-col h-full bg-card">
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/20">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Danh sách vai trò
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
            {roles.length} vai trò trong hệ thống
          </span>
        </div>
        <Can do="role.create">
          <Button
            size="sm"
            onClick={onStartCreate}
            className="h-7 text-xs rounded-[4px] gap-1 active:scale-[0.98]"
          >
            <Plus size={13} />
            <span>Thêm vai trò</span>
          </Button>
        </Can>
      </div>

      <div className="divide-y divide-border overflow-y-auto max-h-[calc(100vh-280px)]">
        {roles.map((role) => {
          const isSelected = activeRoleId === role._id && !isCreating;
          const RoleIcon = getRoleCustomIcon(role.code);
          return (
            <div
              key={role._id}
              onClick={() => onSelectRole(role)}
              className={`p-3.5 cursor-pointer transition-colors hover:bg-muted/40 ${
                isSelected
                  ? 'bg-primary/10 border-l border-primary font-medium'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <RoleIcon size={13} className="shrink-0 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground line-clamp-1">
                    {role.name}
                  </span>
                </div>
                {role.isSystem ? (
                  <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border rounded-[4px] px-1.5 py-0">
                    <Lock size={10} className="mr-0.5" /> Hệ thống
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 rounded-[4px] px-1.5 py-0">
                    Tùy chỉnh
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded-[4px] text-[10px] border border-border/50">
                  {role.code}
                </code>
                <span>•</span>
                <span className="font-mono tabular-nums">
                  {role.permissions?.length || 0} quyền
                </span>
              </div>
              {role.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                  {role.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
