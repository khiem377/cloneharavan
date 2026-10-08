import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, Search, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

/**
 * User Permissions Matrix Tab (Read-only view)
 */
export default function UserPermissionsTab({
  isSuperAdmin,
  totalGrantedPerms,
  loadingPerms,
  groupedPermissions,
  myPermsData,
  user,
}) {
  const [permSearch, setPermSearch] = useState('');

  return (
    <Card className="rounded-[6px] border border-border bg-card shadow-xs">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Quyền hạn được cấp</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Danh sách các quyền hạn bạn được cấp trên hệ thống theo vai trò và quyền riêng biệt (Chế độ chỉ xem).
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-[4px] text-xs font-mono">
            {isSuperAdmin ? 'Toàn quyền quản trị (*)' : `${totalGrantedPerms} quyền đã kích hoạt`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Notice Banner */}
        {isSuperAdmin ? (
          <div className="p-3.5 rounded-[6px] border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="font-semibold">Tài khoản Quản trị viên Tối cao (Super Administrator)</p>
              <p className="text-[11px] opacity-90">
                Bạn sở hữu toàn quyền quản trị tuyệt đối trên mọi phân hệ (bypass mọi phân quyền RBAC).
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-[6px] border border-border bg-muted/20 flex items-start gap-2.5 text-xs text-muted-foreground">
            <Lock size={15} className="shrink-0 mt-0.5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">
                Vai trò hiện tại: {myPermsData?.role?.name || user?.roleId?.name || user?.role || 'Nhân viên'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Dưới đây là danh sách các quyền hạn được cấp theo vai trò và phân quyền cá nhân của bạn.
              </p>
            </div>
          </div>
        )}

        {/* Filter Search */}
        <div className="relative max-w-sm">
          <Input
            type="text"
            value={permSearch}
            onChange={(e) => setPermSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên quyền, mã quyền..."
            className="h-9 pl-8 rounded-[6px] text-xs font-sans"
          />
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Permissions List */}
        {loadingPerms ? (
          <div className="flex items-center justify-center p-8 text-xs text-muted-foreground font-mono">
            <Loader2 size={16} className="animate-spin mr-2" /> Đang tải dữ liệu quyền hạn...
          </div>
        ) : Object.keys(groupedPermissions).length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-[6px] bg-muted/5">
            <ShieldCheck className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">Chưa có quyền hạn nào được gán</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tài khoản của bạn hiện chưa được phân bổ quyền quản trị. Vui lòng liên hệ Quản trị viên để được cấp quyền.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              let matchCount = 0;
              const renderedGroups = Object.entries(groupedPermissions).map(([mod, perms]) => {
                if (!Array.isArray(perms) || perms.length === 0) return null;
                const filteredPerms = perms.filter(
                  (p) =>
                    p.name?.toLowerCase().includes(permSearch.toLowerCase()) ||
                    p.code?.toLowerCase().includes(permSearch.toLowerCase()) ||
                    mod.toLowerCase().includes(permSearch.toLowerCase())
                );
                if (filteredPerms.length === 0) return null;
                matchCount += filteredPerms.length;

                return (
                  <div key={mod} className="rounded-[6px] border border-border bg-muted/10 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="font-bold text-xs text-foreground uppercase tracking-wider font-mono">
                        Phân hệ: {mod}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                        {filteredPerms.length} quyền
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredPerms.map((p) => (
                        <div
                          key={p._id || p.code}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-[6px] border border-border bg-card text-foreground font-medium transition-colors shadow-2xs hover:border-border/80"
                        >
                          <div className="flex items-center gap-2.5 truncate min-w-0">
                            <div className="size-4 rounded-[3px] flex items-center justify-center shrink-0 bg-emerald-600 text-white shadow-2xs">
                              <Check size={11} strokeWidth={3} />
                            </div>
                            <div className="truncate">
                              <p className="truncate text-xs font-semibold text-foreground">{p.name}</p>
                              <p className="text-[10px] font-mono text-muted-foreground truncate">{p.code}</p>
                            </div>
                          </div>

                          <Badge
                            variant="secondary"
                            className="rounded-[3px] text-[9px] px-1.5 py-0 font-mono font-medium shrink-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          >
                            Kích hoạt
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });

              if (matchCount === 0 && permSearch.trim() !== '') {
                return (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-[6px]">
                    Không tìm thấy quyền hạn nào phù hợp với từ khóa "{permSearch}".
                  </div>
                );
              }

              return renderedGroups;
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
