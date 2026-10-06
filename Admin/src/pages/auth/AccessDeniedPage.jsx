import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center antialiased">
      <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[6px] border border-destructive/20 flex items-center justify-center mb-6">
        <ShieldAlert className="size-8" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">403 - Truy cập bị từ chối</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Tài khoản của bạn không được cấp quyền truy cập vào trang web này. Vui lòng liên hệ Quản trị viên nếu bạn tin rằng đây là một sự nhầm lẫn.
      </p>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => navigate('/')}
          className="h-9 px-4 rounded-[6px] font-semibold text-xs gap-2 active:scale-[0.98]"
        >
          <ArrowLeft className="size-3.5" />
          <span>Quay lại Trang chủ</span>
        </Button>
      </div>
    </div>
  );
};

export default AccessDeniedPage;

