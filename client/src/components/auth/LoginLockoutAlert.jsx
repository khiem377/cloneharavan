import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function LoginLockoutAlert({
  loginError,
  isLocked,
  lockCountdown,
  unlockTime,
  formatCountdown,
}) {
  if (!loginError) return null;

  return (
    <div
      className={`rounded-[6px] p-3 text-xs border ${
        isLocked
          ? 'bg-red-50 border-red-200 text-red-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isLocked ? (
          <ShieldAlert className="size-4 shrink-0 text-red-600 mt-0.5" />
        ) : (
          <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
        )}
        <div className="flex flex-col gap-1.5 w-full">
          <span className="font-semibold leading-relaxed">{loginError}</span>
          {isLocked && (
            <div className="flex flex-col gap-1 pt-1.5 border-t border-red-200/70 text-[11px] text-red-800">
              {lockCountdown > 0 && (
                <div className="flex items-center justify-between">
                  <span>Thời gian chờ mở khóa:</span>
                  <span className="font-mono font-bold text-xs tabular-nums text-red-700 bg-red-100/80 px-1.5 py-0.5 rounded-[4px]">
                    {formatCountdown(lockCountdown)}
                  </span>
                </div>
              )}
              {unlockTime && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Thời điểm đăng nhập lại:</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900">
                    {unlockTime}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
