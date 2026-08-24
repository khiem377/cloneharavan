import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';

import { getDefaultRedirectPath } from '@/utils/permissionUtils';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await authService.login(values);
      const user = data.data.user;
      setAuth({
        user,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      toast.success(data.message || 'Đăng nhập thành công!');
      
      // Chuyển hướng thông minh theo đúng quyền hạn của tài khoản
      const targetPath = getDefaultRedirectPath(user);
      navigate(targetPath, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Có lỗi xảy ra';
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4 md:p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm text-card-foreground">
        <div className="flex flex-col gap-1 text-center mb-6">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">Đăng nhập để tiếp tục</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@example.com"
              className={cn(
                'h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20',
                errors.email && 'border-destructive focus:border-destructive focus:ring-destructive/20'
              )}
              autoComplete="email"
            />
            {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Mật khẩu</label>
            <div className="relative">
              <input

                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className={cn(
                  'h-9 w-full rounded-md border border-input bg-background pl-3 pr-9 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20',
                  errors.password && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                )}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
