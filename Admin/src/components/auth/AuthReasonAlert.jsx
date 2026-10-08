import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Renders warning / error alert based on URL query parameter `reason`
 * @param {Object} props
 * @param {string|null} props.reason - Reason code: 'session_expired' | 'blocked' | 'no_admin_access'
 */
export default function AuthReasonAlert({ reason }) {
  if (!reason) return null;

  if (reason === 'session_expired') {
    return (
      <div
        role="alert"
        className="mb-4 flex items-start gap-2.5 rounded-[6px] border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300"
      >
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <span>Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.</span>
      </div>
    );
  }

  if (reason === 'blocked') {
    return (
      <div
        role="alert"
        className="mb-4 flex items-start gap-2.5 rounded-[6px] border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
      >
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <span>Tài khoản đã bị khóa hoặc phiên truy cập bị thu hồi.</span>
      </div>
    );
  }

  if (reason === 'no_admin_access') {
    return (
      <div
        role="alert"
        className="mb-4 flex items-start gap-2.5 rounded-[6px] border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
      >
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <span>Tài khoản không có quyền truy cập vào bảng điều khiển quản trị.</span>
      </div>
    );
  }

  return null;
}
