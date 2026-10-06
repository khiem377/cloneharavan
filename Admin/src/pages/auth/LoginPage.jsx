import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';
import { getDefaultRedirectPath } from '@/utils/permissionUtils';
import MascotAdminWelcome from '@/components/ui/MascotAdminWelcome';
import GoogleAdminLoginButton from '@/components/auth/GoogleAdminLoginButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await authService.login(values);
      const user = data.data.user;

      if (user.role === 'user') {
        toast.error('Tài khoản của bạn không có quyền truy cập trang quản trị!');
        return;
      }

      setAuth({
        user,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      toast.success(data.message || 'Đăng nhập thành công!');
      
      const targetPath = getDefaultRedirectPath(user);
      navigate(targetPath, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Đăng nhập thất bại. Vui lòng thử lại!';
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-4 py-8 antialiased selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-[400px] flex flex-col gap-4">
        {/* Animated Mascot Header */}
        <div className="flex flex-col items-center text-center -mb-2">
          <MascotAdminWelcome size={185} />
          <div className="flex flex-col gap-0.5 mt-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Hệ thống Quản trị OMS</h1>
            <p className="text-xs text-muted-foreground font-sans">
              Đăng nhập để quản lý đơn hàng, kho và sản phẩm
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-[6px] border border-border bg-card p-6 shadow-xs text-card-foreground">
          {/* Reason Alerts */}
          {reason === 'session_expired' && (
            <div className="mb-4 flex items-start gap-2.5 rounded-[6px] border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.</span>
            </div>
          )}

          {reason === 'blocked' && (
            <div className="mb-4 flex items-start gap-2.5 rounded-[6px] border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>Tài khoản đã bị khóa hoặc phiên truy cập bị thu hồi.</span>
            </div>
          )}

          {reason === 'no_admin_access' && (
            <div className="mb-4 flex items-start gap-2.5 rounded-[6px] border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>Tài khoản không có quyền truy cập vào bảng điều khiển quản trị.</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Email quản trị</span>
              </label>
              <div className="relative">
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="admin@haravan.com"
                  autoComplete="email"
                  className={cn(
                    'h-10 w-full rounded-[6px] border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring font-sans',
                    errors.email && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive'
                  )}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.email && (
                <span className="text-[11px] font-medium text-destructive">{errors.email.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Mật khẩu</label>
              </div>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'h-10 w-full rounded-[6px] border border-input bg-background pl-9 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring font-sans',
                    errors.password && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive'
                  )}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center rounded-[4px] text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[11px] font-medium text-destructive">{errors.password.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-10 w-full rounded-[6px] font-semibold text-sm shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <span>Đăng nhập hệ thống</span>
              )}
            </Button>
          </form>

          <div className="relative my-4 flex items-center">
            <div className="flex-grow border-t border-border" />
            <span className="shrink-0 mx-3 text-xs text-muted-foreground font-medium">
              Hoặc quản trị viên đăng nhập với
            </span>
            <div className="flex-grow border-t border-border" />
          </div>

          <GoogleAdminLoginButton />
        </div>
      </div>
    </div>
  );
}



