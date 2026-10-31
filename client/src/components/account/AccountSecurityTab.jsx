'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import PasswordModal from './PasswordModal';
import SessionsModal from './SessionsModal';
import SecurityLinkedAccountsCard from './security/SecurityLinkedAccountsCard';
import SecuritySessionsCard from './security/SecuritySessionsCard';
import { useAccountOAuthLinking } from './security/useAccountOAuthLinking';
import { useAccountSessions } from './security/useAccountSessions';
import {
  SecurityShieldHeaderIcon,
  SecurityKeycardIcon,
  SecurityDevicesIcon,
} from './AccountIcons';

export default function AccountSecurityTab({
  user,
  setUser,
  onRefreshProfile,
}) {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isSetPasswordMode, setIsSetPasswordMode] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);

  const {
    linkedAccounts,
    linkingProvider,
    unlinkingProvider,
    loadingLinked,
    handleLinkGoogle,
    handleLinkZalo,
    handleLinkTikTok,
    handleUnlink,
  } = useAccountOAuthLinking({
    user,
    setUser,
    onRefreshProfile,
  });

  const {
    sessions = [],
    loadingSessions,
    fetchSessions,
    handleRevokeSession,
    handleRevokeAllOtherSessions,
  } = useAccountSessions();

  const hasPassword = Boolean(user?.hasPassword);

  const handleOpenPasswordModal = (mode = false) => {
    setIsSetPasswordMode(mode);
    setPasswordModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[6px] border-slate-200 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SecurityShieldHeaderIcon size={20} className="text-emerald-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Bảo mật tài khoản
              </CardTitle>
            </div>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
              Mức độ an toàn: Tốt
            </Badge>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Quản lý mật khẩu đăng nhập, các thiết bị đang hoạt động và liên kết tài khoản mạng xã hội.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          <div className="flex items-center justify-between p-3.5 rounded-[6px] border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[6px] bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                <SecurityKeycardIcon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  {hasPassword ? 'Mật khẩu đăng nhập' : 'Chưa thiết lập mật khẩu'}
                </span>
                <span className="text-xs text-slate-500">
                  {hasPassword
                    ? 'Nên đổi mật khẩu định kỳ 6 tháng một lần để bảo vệ tài khoản'
                    : 'Thiết lập mật khẩu để có thể đăng nhập bằng email hoặc số điện thoại'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenPasswordModal(!hasPassword)}
              className="text-xs font-semibold h-8 rounded-[6px] border-slate-300 hover:border-slate-400"
            >
              {hasPassword ? 'Đổi mật khẩu' : 'Thiết lập mật khẩu'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-[6px] border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[6px] bg-white border border-slate-200 text-slate-700 flex items-center justify-center">
                <SecurityDevicesIcon size={16} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    Phiên đăng nhập & Thiết bị
                  </span>
                  <Badge variant="secondary" className="font-mono tabular-nums text-[10px] px-1.5 py-0">
                    {sessions?.length || 1}
                  </Badge>
                </div>
                <span className="text-xs text-slate-500">
                  Kiểm tra các thiết bị và trình duyệt đang đăng nhập vào tài khoản của bạn
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSessionsModalOpen(true)}
              className="text-xs font-semibold h-8 rounded-[6px] border-slate-300 hover:border-slate-400 gap-1"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="size-3.5 text-slate-400" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <SecurityLinkedAccountsCard
        linkedAccounts={linkedAccounts}
        linkingProvider={linkingProvider}
        unlinkingProvider={unlinkingProvider}
        loadingLinked={loadingLinked}
        onLinkGoogle={handleLinkGoogle}
        onLinkZalo={handleLinkZalo}
        onLinkTikTok={handleLinkTikTok}
        onUnlink={handleUnlink}
      />

      <SecuritySessionsCard
        sessions={sessions}
        loadingSessions={loadingSessions}
        onManageSessions={() => setSessionsModalOpen(true)}
      />

      {passwordModalOpen && (
        <PasswordModal
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          isSetPassword={isSetPasswordMode}
          onSuccess={() => {
            setPasswordModalOpen(false);
            if (onRefreshProfile) onRefreshProfile();
          }}
        />
      )}

      {sessionsModalOpen && (
        <SessionsModal
          isOpen={sessionsModalOpen}
          onClose={() => setSessionsModalOpen(false)}
          sessions={sessions}
          loading={loadingSessions}
          onRefreshSessions={fetchSessions}
          onRevokeSession={handleRevokeSession}
          onRevokeAllOtherSessions={handleRevokeAllOtherSessions}
        />
      )}
    </div>
  );
}
