import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 animate-bounce">
        <ShieldAlert className="size-10" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">403 - Truy cập bị từ chối</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Tài khoản của bạn không được cấp quyền truy cập vào trang web này. Vui lòng liên hệ Quản trị viên (Administrator) nếu bạn tin rằng đây là một sự nhầm lẫn.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 h-11 bg-primary text-primary-foreground rounded-lg font-medium shadow hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="size-4" /> Quay lại Trang chủ
        </button>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
