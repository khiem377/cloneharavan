'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function LoginNoticeBanner() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  if (reason === 'blocked') {
    return (
      <Alert variant="destructive" className="mb-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle className="font-bold text-xs">
          Tài khoản đã bị tạm khóa hoặc phiên làm việc đã bị thu hồi
        </AlertTitle>
        <AlertDescription className="text-[11px] mt-1 leading-relaxed">
          Hệ thống đã cưỡng chế thu hồi phiên đăng nhập theo lệnh của Quản trị viên. Nếu cần khiếu nại hoặc mở lại tài khoản, vui lòng liên hệ Hotline{' '}
          <a href="tel:19001000" className="font-bold underline">
            1900 1000
          </a>{' '}
          hoặc email{' '}
          <a href="mailto:hotro@shop.com" className="font-bold underline">
            hotro@shop.com
          </a>.
        </AlertDescription>
      </Alert>
    );
  }

  if (reason === 'session_expired') {
    return (
      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-bold text-xs">
          Phiên đăng nhập đã hết hạn
        </AlertTitle>
        <AlertDescription className="text-[11px] mt-1">
          Vui lòng đăng nhập lại để tiếp tục sử dụng các dịch vụ của hệ thống.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
