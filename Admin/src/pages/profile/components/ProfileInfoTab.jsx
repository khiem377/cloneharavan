import { useState } from 'react';
import { Mail, Phone, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';

/**
 * Personal Information Tab
 */
export default function ProfileInfoTab({ user, setUser }) {
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || 'other',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên!');
      return;
    }

    setProfileLoading(true);
    try {
      const { data } = await authService.updateMe({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        gender: profileForm.gender,
        dateOfBirth: profileForm.dateOfBirth || null,
      });

      if (data?.data?.user) {
        setUser(data.data.user);
      }
      toast.success(data.message || 'Cập nhật thông tin thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thông tin thất bại!');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <Card className="rounded-[6px] border border-border bg-card shadow-xs">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-bold text-foreground">Thông tin cá nhân</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Cập nhật các thông tin liên hệ và hiển thị trên bảng điều khiển quản trị.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Họ và tên *</Label>
            <Input
              type="text"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
              className="h-9 rounded-[6px] text-xs font-sans"
              placeholder="Nhập họ và tên đầy đủ"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Email đăng nhập</Label>
              <div className="relative">
                <Input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="h-9 rounded-[6px] text-xs font-mono bg-muted/40 cursor-not-allowed pr-8"
                />
                <Mail size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Email định danh không thể thay đổi</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Số điện thoại</Label>
              <div className="relative">
                <Input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  className="h-9 rounded-[6px] text-xs font-mono tabular-nums pr-8"
                  placeholder="0988xxxxxx"
                />
                <Phone size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Giới tính</Label>
              <select
                value={profileForm.gender}
                onChange={(e) => setProfileForm((p) => ({ ...p, gender: e.target.value }))}
                className="h-9 w-full rounded-[6px] border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Ngày sinh</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  className="h-9 rounded-[6px] text-xs font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button
              type="submit"
              disabled={profileLoading}
              className="h-9 px-5 rounded-[6px] text-xs font-semibold active:scale-[0.98] shadow-xs cursor-pointer"
            >
              {profileLoading && <Loader2 size={13} className="animate-spin mr-1.5" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
