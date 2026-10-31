'use client';

import React from 'react';
import { Loader2, Trash2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SecurityLinkedAccountsCard({
  linkedAccounts,
  user,
  linkingProvider,
  unlinkingProvider,
  onStartGoogleLink,
  onStartZaloLink,
  onStartTikTokLink,
  onUnlinkSocial,
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <h2 className="text-sm font-bold text-slate-900">Tài khoản liên kết</h2>
        <p className="text-xs text-slate-500">
          Kết nối tài khoản mạng xã hội để đăng nhập nhanh hơn.
        </p>
      </div>

      <Card className="rounded-[6px] border border-slate-200 bg-white overflow-hidden shadow-none divide-y divide-slate-100">
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-[6px] border border-slate-200 bg-white flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
              </svg>
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-slate-900">Google</h3>
                {linkedAccounts.google?.isLinked ? (
                  <Badge variant="outline" className="rounded-[4px] bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-normal">
                    Đã liên kết
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-[4px] text-slate-400 border-slate-200 text-[10px] px-1.5 py-0 font-normal">
                    Chưa liên kết
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate font-mono">
                {linkedAccounts.google?.isLinked
                  ? linkedAccounts.google?.email || user?.email || (linkedAccounts.google?.id ? `ID: ${linkedAccounts.google.id}` : 'Đã kết nối')
                  : 'Chưa liên kết tài khoản Google'}
              </p>
            </div>
          </div>

          {linkedAccounts.google?.isLinked ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUnlinkSocial('google')}
              disabled={unlinkingProvider === 'google'}
              className="h-7 px-2.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 rounded-[6px]"
            >
              {unlinkingProvider === 'google' ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : (
                <Trash2 size={12} className="mr-1" />
              )}
              Hủy liên kết
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onStartGoogleLink}
              disabled={linkingProvider === 'google'}
              className="h-7 px-2.5 text-xs text-[#4285F4] hover:bg-blue-50 hover:border-blue-200 border-slate-200 rounded-[6px] font-medium"
            >
              {linkingProvider === 'google' ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : (
                <ExternalLink size={12} className="mr-1" />
              )}
              Liên kết Google
            </Button>
          )}
        </div>

        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-[6px] border border-slate-200 bg-white flex items-center justify-center shrink-0 p-1">
              <img src="/images/logo-zalo.webp" alt="Zalo" className="w-5 h-5 object-contain" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-slate-900">Zalo</h3>
                {linkedAccounts.zalo?.isLinked ? (
                  <Badge variant="outline" className="rounded-[4px] bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-normal">
                    Đã liên kết
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-[4px] text-slate-400 border-slate-200 text-[10px] px-1.5 py-0 font-normal">
                    Chưa liên kết
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {linkedAccounts.zalo?.isLinked ? (
                  linkedAccounts.zalo?.name || linkedAccounts.zalo?.id || 'Đã kết nối'
                ) : (
                  'Chưa liên kết tài khoản Zalo'
                )}
              </p>
            </div>
          </div>

          {linkedAccounts.zalo?.isLinked ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUnlinkSocial('zalo')}
              disabled={unlinkingProvider === 'zalo'}
              className="h-7 px-2.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 rounded-[6px]"
            >
              {unlinkingProvider === 'zalo' ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : (
                <Trash2 size={12} className="mr-1" />
              )}
              Hủy liên kết
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onStartZaloLink}
              disabled={linkingProvider === 'zalo'}
              className="h-7 px-2.5 text-xs text-[#0068ff] hover:bg-blue-50 hover:border-blue-200 border-slate-200 rounded-[6px] font-medium"
            >
              {linkingProvider === 'zalo' ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : (
                <ExternalLink size={12} className="mr-1" />
              )}
              Liên kết Zalo
            </Button>
          )}
        </div>

        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-[6px] bg-black flex items-center justify-center shrink-0 p-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.889 2.889 2.896 2.896 0 0 1-2.889-2.889 2.896 2.896 0 0 1 2.889-2.889c.328 0 .641.056.933.159V9.458a6.33 6.33 0 0 0-.933-.07 6.334 6.334 0 0 0-6.334 6.334 6.334 6.334 0 0 0 6.334 6.334 6.334 6.334 0 0 0 6.334-6.334V8.583a8.163 8.163 0 0 0 4.887 1.602V6.74a4.77 4.77 0 0 1-1.122-.054z" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-slate-900">TikTok</h3>
                {linkedAccounts.tiktok?.isLinked ? (
                  <Badge variant="outline" className="rounded-[4px] bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 font-normal">
                    Đã liên kết
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-[4px] text-slate-400 border-slate-200 text-[10px] px-1.5 py-0 font-normal">
                    Chưa liên kết
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {linkedAccounts.tiktok?.isLinked
                  ? linkedAccounts.tiktok?.displayName || linkedAccounts.tiktok?.username || 'Đã kết nối'
                  : 'Chưa liên kết tài khoản TikTok'}
              </p>
            </div>
          </div>

          {linkedAccounts.tiktok?.isLinked ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onUnlinkSocial('tiktok')}
              disabled={unlinkingProvider === 'tiktok'}
              className="h-7 px-2.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 rounded-[6px]"
            >
              {unlinkingProvider === 'tiktok' ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : (
                <Trash2 size={12} className="mr-1" />
              )}
              Hủy liên kết
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onStartTikTokLink}
              disabled={linkingProvider === 'tiktok'}
              className="h-7 px-2.5 text-xs text-slate-800 hover:bg-slate-100 hover:border-slate-300 border-slate-200 rounded-[6px] font-medium"
            >
              {linkingProvider === 'tiktok' ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : (
                <ExternalLink size={12} className="mr-1" />
              )}
              Liên kết TikTok
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
