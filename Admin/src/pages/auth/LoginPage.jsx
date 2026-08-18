import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/store/authStore';

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
      setAuth({
        user: data.data.user,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      toast.success(data.message || 'Đăng nhập thành công!');
      navigate('/media');
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Có lỗi xảy ra';
      toast.error(msg);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          {/* <div className="login-logo">A</div> */}
          <div className="login-title">Admin Dashboard</div>
          <p className="login-subtitle">Đăng nhập để tiếp tục</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label className="field-label">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@example.com"
              className={`field-input ${errors.email ? 'error' : ''}`}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="field">
            <label className="field-label">Mật khẩu</label>
            <div className="input-with-icon">
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className={`field-input ${errors.password ? 'error' : ''}`}
                autoComplete="current-password"
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-primary login-submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={18} className="spin" /> : null}
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
