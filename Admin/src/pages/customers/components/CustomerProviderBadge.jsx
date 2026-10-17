import React from 'react';

export const getProviderInfo = (user = {}) => {
  const provider =
    user.authProvider ||
    (user.zaloId ? 'zalo' : user.tiktokId ? 'tiktok' : user.googleId ? 'google' : 'local');

  switch (provider) {
    case 'zalo':
      return {
        key: 'zalo',
        label: 'Zalo',
        colorClass: 'bg-[#0068FF]/10 text-[#0068FF] border-[#0068FF]/25',
        dotClass: 'bg-[#0068FF]',
        identifier: user.zaloName || user.zaloId || null,
      };
    case 'google':
      return {
        key: 'google',
        label: 'Google',
        colorClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        dotClass: 'bg-red-500',
        identifier: user.email || user.googleId || null,
      };
    case 'tiktok':
      return {
        key: 'tiktok',
        label: 'TikTok',
        colorClass: 'bg-foreground/10 text-foreground border-foreground/20',
        dotClass: 'bg-foreground',
        identifier: user.tiktokUsername ? `@${user.tiktokUsername}` : user.tiktokId || null,
      };
    case 'facebook':
      return {
        key: 'facebook',
        label: 'Facebook',
        colorClass: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
        dotClass: 'bg-blue-600',
        identifier: user.email || null,
      };
    default:
      return {
        key: 'local',
        label: 'Email / Mật khẩu',
        colorClass: 'bg-secondary text-secondary-foreground border-border',
        dotClass: 'bg-muted-foreground',
        identifier: user.email || null,
      };
  }
};

export default function CustomerProviderBadge({ user, showDetails = false }) {
  const info = getProviderInfo(user);

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 text-[10px] font-semibold border ${info.colorClass}`}
      >
        <span className={`size-1.5 rounded-full ${info.dotClass}`} />
        <span>{info.label}</span>
      </span>
      {showDetails && info.identifier && info.key !== 'local' && (
        <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[140px]">
          {info.identifier}
        </span>
      )}
    </div>
  );
}
