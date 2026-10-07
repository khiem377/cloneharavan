import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  KeyRound,
  ShieldCheck,
  Globe,
  LogOut,
  Camera,
  Loader2,
  CheckCircle2,
  Check,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Search,
  Lock,
  Fingerprint,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Clock,
  RefreshCw,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { useMyPermissions } from '@/hooks/useRoles';
import { toast } from '@/providers/ToastProvider';
import { cn } from '@/lib/utils';
import { registerPasskey, isPasskeySupported, formatPasskeyError } from '@/utils/passkeyUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const userPermissions = useMemo(() => {
    return Array.isArray(user?.permissions) ? user.permissions : [];
  }, [user?.permissions]);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'permissions' | 'social'

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || 'other',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Avatar Upload State
  const avatarInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Password Form State
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passShow, setPassShow] = useState({ current: false, next: false, confirm: false });
  const [passLoading, setPassLoading] = useState(false);
  const [passErrors, setPassErrors] = useState({});

  // Permissions Query (chỉ lấy các quyền thực tế mà user hiện tại được cấp)
  const { data: myPermsData = {}, isLoading: loadingPerms } = useMyPermissions();
  const [permSearch, setPermSearch] = useState('');

  const isSuperAdmin = useMemo(() => {
    if (myPermsData?.isSuperAdmin !== undefined) return myPermsData.isSuperAdmin;
    const roleCode = (user?.roleId?.code || user?.role || '').toLowerCase();
    const roleName = (user?.roleId?.name || '').toLowerCase();
    const email = (user?.email || '').toLowerCase();
    return (
      roleCode === 'admin' ||
      roleCode === 'administrator' ||
      roleCode.includes('admin') ||
      roleName.includes('administrator') ||
      roleName.includes('quản trị') ||
      email.startsWith('admin') ||
      (Array.isArray(user?.permissions) && user.permissions.includes('*'))
    );
  }, [user, myPermsData]);

  // Normalize Grouped Permissions (Chỉ chứa các quyền user thực sự được cấp)
  const groupedPermissions = useMemo(() => {
    if (!myPermsData) return {};
    if (myPermsData.grouped && typeof myPermsData.grouped === 'object') {
      return myPermsData.grouped;
    }
    if (Array.isArray(myPermsData.permissionDetails)) {
      return myPermsData.permissionDetails.reduce((acc, p) => {
        const mod = p.module || 'Hệ thống';
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(p);
        return acc;
      }, {});
    }
    return {};
  }, [myPermsData]);

  const totalGrantedPerms = useMemo(() => {
    if (typeof myPermsData?.count === 'number') return myPermsData.count;
    return Object.values(groupedPermissions).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );
  }, [myPermsData, groupedPermissions]);

  // Social Linking State
  const [linkedAccounts, setLinkedAccounts] = useState({
    hasPassword: true,
    google: { isLinked: false, id: null },
    zalo: { isLinked: false, id: null },
    tiktok: { isLinked: false, id: null },
  });
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [unlinkingProvider, setUnlinkingProvider] = useState(null);

  // Passkey State
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyDeviceName, setPasskeyDeviceName] = useState('');
  const [deletingPasskeyId, setDeletingPasskeyId] = useState(null);

  const handleRegisterNewPasskey = async (e) => {
    e?.preventDefault();
    if (!isPasskeySupported()) {
      toast.error('Trình duyệt hoặc thiết bị của bạn không hỗ trợ Passkey / WebAuthn.');
      return;
    }

    setPasskeyLoading(true);
    try {
      const { data: optRes } = await authService.getPasskeyRegisterOptions();
      const options = optRes.data;

      toast.info('Vui lòng chạm cảm biến vân tay hoặc xác thực bảo mật trên thiết bị...');
      const regResult = await registerPasskey(options);

      const { data: verifyRes } = await authService.verifyPasskeyRegister({
        ...regResult,
        deviceName: passkeyDeviceName.trim() || undefined,
      });

      toast.success(verifyRes.message || 'Đăng ký khóa bảo mật Passkey thành công!');
      setPasskeyDeviceName('');
      // Refresh user profile
      const { data: meRes } = await authService.getMe();
      if (meRes?.data) setUser(meRes.data);
    } catch (err) {
      console.error('Passkey register error:', err);
      const msg = formatPasskeyError(err);
      toast.error(msg);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleDeletePasskey = async (credentialId, deviceName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa bảo mật "${deviceName || 'Passkey'}" khỏi tài khoản?`)) {
      return;
    }
    setDeletingPasskeyId(credentialId);
    try {
      const { data: res } = await authService.deletePasskey(credentialId);
      toast.success(res.message || 'Đã xóa khóa Passkey thành công!');

      // Update local auth store immediately
      const updatedPasskeys = (user?.passkeys || []).filter((pk) => pk.credentialId !== credentialId);
      setUser({ ...user, passkeys: updatedPasskeys });

      // Refresh full profile in background
      const { data: meRes } = await authService.getMe();
      if (meRes?.data) setUser(meRes.data);
    } catch (err) {
      console.error('Delete passkey error:', err);
      toast.error(formatPasskeyError(err));
    } finally {
      setDeletingPasskeyId(null);
    }
  };


  // Sync profileForm with store user
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'other',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      });
    }
  }, [user]);

  // Fetch Linked Accounts on mount
  useEffect(() => {
    const fetchSocial = async () => {
      setLoadingSocial(true);
      try {
        const socialRes = await authService.getLinkedAccounts();
        setLinkedAccounts(socialRes.data?.data || socialRes.data || {});
      } catch (err) {
        console.error('Không thể tải trạng thái liên kết mạng xã hội:', err);
      } finally {
        setLoadingSocial(false);
      }
    };

    fetchSocial();
  }, []);

  // 1. Profile Update Handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await authService.updateProfile({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || undefined,
        gender: profileForm.gender,
        dateOfBirth: profileForm.dateOfBirth || undefined,
      });
      const updatedUser = res.data?.data?.user || res.data?.data || res.data;
      setUser({ ...user, ...updatedUser });
      toast.success('Cập nhật thông tin tài khoản thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thông tin thất bại');
    } finally {
      setProfileLoading(false);
    }
  };

  // 2. Avatar Upload Handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh hợp lệ');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    try {
      const res = await authService.uploadAvatar(formData);
      const updatedUser = res.data?.data?.user || res.data?.data || res.data;
      setUser({ ...user, avatar: updatedUser.avatar || { url: URL.createObjectURL(file) } });
      toast.success('Cập nhật ảnh đại diện thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tải ảnh đại diện thất bại');
    } finally {
      setAvatarLoading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // 3. Password Change Handler
  const validateAdminPassword = (pw) => {
    if (!pw || pw.length < 8) return 'Mật khẩu mới phải có tối thiểu 8 ký tự';
    if (!/[A-Z]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z)';
    if (!/[a-z]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 chữ in thường (a-z)';
    if (!/[0-9]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9)';
    if (!/[^A-Za-z0-9]/.test(pw)) return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)';
    return null;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passForm.currentPassword) errs.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    const pwError = validateAdminPassword(passForm.newPassword);
    if (pwError) errs.newPassword = pwError;
    if (passForm.newPassword !== passForm.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp';

    if (Object.keys(errs).length) {
      setPassErrors(errs);
      return;
    }
    setPassErrors({});
    setPassLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công. Vui lòng ghi nhớ mật khẩu mới!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setPassLoading(false);
    }
  };

  // 4. Social Linking Handlers
  const handleStartZaloLink = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/zalo/callback?action=link`;
      const res = await authService.getZaloAuthUrl({ redirectUri, state: 'admin_link_zalo' });
      const { url, codeVerifier, state } = res.data?.data || res.data;
      if (codeVerifier) sessionStorage.setItem('zalo_code_verifier', codeVerifier);
      if (state) sessionStorage.setItem('zalo_state', state);
      sessionStorage.setItem('zalo_action', 'link');
      window.location.href = url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể khởi tạo liên kết Zalo');
    }
  };

  const handleStartTikTokLink = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/tiktok/callback?action=link`;
      const res = await authService.getTikTokAuthUrl({ redirectUri, state: 'admin_link_tiktok' });
      const { url, codeVerifier, state } = res.data?.data || res.data;
      if (codeVerifier) sessionStorage.setItem('tiktok_code_verifier', codeVerifier);
      if (state) sessionStorage.setItem('tiktok_state', state);
      sessionStorage.setItem('tiktok_action', 'link');
      window.location.href = url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể khởi tạo liên kết TikTok');
    }
  };

  const handleUnlinkSocial = async (provider) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy liên kết tài khoản ${provider.toUpperCase()}?`)) return;

    setUnlinkingProvider(provider);
    try {
      await authService.unlinkSocial(provider);
      toast.success(`Đã hủy liên kết tài khoản ${provider.toUpperCase()}`);
      setLinkedAccounts((p) => ({
        ...p,
        [provider]: { isLinked: false, id: null },
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hủy liên kết thất bại');
    } finally {
      setUnlinkingProvider(null);
    }
  };

  // 5. Active Sessions State & Handlers
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loggingOutSessionId, setLoggingOutSessionId] = useState(null);
  const [loggingOutOthers, setLoggingOutOthers] = useState(false);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await authService.getSessions();
      setSessions(res.data?.data?.sessions || res.data?.sessions || []);
    } catch (err) {
      console.error('Lỗi lấy phiên đăng nhập Admin:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchSessions();
    }
  }, [activeTab]);

  const handleLogoutSession = async (sessionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này?')) return;
    setLoggingOutSessionId(sessionId);
    try {
      await authService.logoutSession(sessionId);
      toast.success('Đã đăng xuất khỏi thiết bị');
      setSessions((p) => p.filter((s) => s.sessionId !== sessionId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đăng xuất thiết bị');
    } finally {
      setLoggingOutSessionId(null);
    }
  };

  const handleLogoutOtherSessions = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác?')) return;
    setLoggingOutOthers(true);
    try {
      await authService.logoutOtherSessions();
      toast.success('Đã đăng xuất khỏi tất cả các thiết bị khác');
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đăng xuất thiết bị khác');
    } finally {
      setLoggingOutOthers(false);
    }
  };

  // 6. Logout Handler
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch { }
    clearAuth();
    navigate('/login');
    toast.info('Đã đăng xuất khỏi hệ thống');
  };

  const initials = (user?.fullName?.[0] || user?.email?.[0] || 'A').toUpperCase();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <User className="size-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân & Quản trị</h1>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'rounded-[4px] px-2.5 py-1 text-xs font-mono font-semibold',
              isSuperAdmin
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : 'bg-primary/10 text-primary border-primary/20'
            )}
          >
            {isSuperAdmin ? 'Administrator (Toàn quyền)' : user?.roleId?.name || user?.role || 'Nhân viên'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Quản lý thông tin tài khoản, cấu hình bảo mật, xem ma trận quyền hạn được cấp và liên kết các kênh mạng xã hội.
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Column: Sidebar Card */}
        <div className="md:col-span-1 space-y-4">
          <Card className="rounded-[6px] border border-border bg-card p-4 shadow-xs">
            {/* User Mini Profile */}
            <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-border">
              <div className="relative">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.fullName || 'Avatar'}
                    referrerPolicy="no-referrer"
                    className="size-20 rounded-full object-cover border-2 border-border shadow-xs"
                  />
                ) : (
                  <div className="size-20 rounded-full bg-primary text-primary-foreground text-2xl font-bold font-mono flex items-center justify-center shadow-xs">
                    {initials}
                  </div>
                )}
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute bottom-0 right-0 size-7 bg-background hover:bg-accent border border-border rounded-full shadow-xs flex items-center justify-center cursor-pointer transition-transform active:scale-95 text-foreground"
                  title="Thay đổi ảnh đại diện"
                >
                  {avatarLoading ? (
                    <Loader2 size={13} className="animate-spin text-primary" />
                  ) : (
                    <Camera size={13} />
                  )}
                </button>
              </div>

              <div className="space-y-1 min-w-0 w-full">
                <h2 className="font-bold text-sm text-foreground truncate">{user?.fullName || 'Quản trị viên'}</h2>
                <p className="text-xs text-muted-foreground font-mono truncate">{user?.email || 'admin@shop.vn'}</p>
                <div className="pt-1 flex items-center justify-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono text-emerald-600 font-medium">Đang hoạt động</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="pt-3 space-y-1">
              {[
                { id: 'profile', label: 'Thông tin cá nhân', icon: User },
                { id: 'password', label: 'Đổi mật khẩu', icon: KeyRound },
                { id: 'passkey', label: 'Khóa bảo mật Passkey', icon: Fingerprint },
                { id: 'sessions', label: 'Phiên đăng nhập & Thiết bị', icon: Laptop },
                { id: 'permissions', label: 'Quyền hạn được gán', icon: ShieldCheck },
                { id: 'social', label: 'Liên kết mạng xã hội', icon: Globe },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-[6px] transition-all cursor-pointer active:scale-[0.98]',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'} />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}

              <Separator className="my-2" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-[6px] transition-colors cursor-pointer active:scale-[0.98]"
              >
                <LogOut size={14} className="shrink-0" />
                <span>Đăng xuất hệ thống</span>
              </button>
            </nav>
          </Card>
        </div>

        {/* Right Column: Tab Content */}
        <div className="md:col-span-3 space-y-4">
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'profile' && (
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
                      className="h-9 rounded-[6px] text-xs"
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
                      className="h-9 px-5 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
                    >
                      {profileLoading && <Loader2 size={13} className="animate-spin mr-1.5" />}
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: ĐỔI MẬT KHẨU */}
          {activeTab === 'password' && (
            <Card className="rounded-[6px] border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-bold text-foreground">Bảo mật & Đổi mật khẩu</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Để đảm bảo an toàn, vui lòng sử dụng mật khẩu mạnh có chữ hoa, số và ký tự đặc biệt.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  {[
                    { key: 'currentPassword', label: 'Mật khẩu hiện tại *', showKey: 'current', placeholder: 'Nhập mật khẩu hiện tại' },
                    { key: 'newPassword', label: 'Mật khẩu mới *', showKey: 'next', placeholder: 'Tối thiểu 8 ký tự (hoa, thường, số, ký tự đặc biệt)' },
                    { key: 'confirmPassword', label: 'Xác nhận lại mật khẩu mới *', showKey: 'confirm', placeholder: 'Nhập lại mật khẩu mới' },
                  ].map(({ key, label, showKey, placeholder }) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">{label}</Label>
                      <div className="relative">
                        <Input
                          type={passShow[showKey] ? 'text' : 'password'}
                          value={passForm[key]}
                          onChange={(e) => {
                            setPassForm((p) => ({ ...p, [key]: e.target.value }));
                            setPassErrors((p) => ({ ...p, [key]: '' }));
                          }}
                          className={cn(
                            'h-9 rounded-[6px] text-xs pr-9',
                            passErrors[key] && 'border-destructive focus-visible:ring-destructive'
                          )}
                          placeholder={placeholder}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setPassShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passShow[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {passErrors[key] && (
                        <p className="text-[11px] font-medium text-destructive">{passErrors[key]}</p>
                      )}
                    </div>
                  ))}

                  {/* Password Rules Checklist */}
                  <div className="rounded-[6px] border border-border bg-muted/20 p-3 space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                      Yêu cầu mật khẩu an toàn:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {[
                        { label: 'Tối thiểu 8 ký tự', ok: passForm.newPassword.length >= 8 },
                        { label: 'Chứa chữ in hoa (A-Z)', ok: /[A-Z]/.test(passForm.newPassword) },
                        { label: 'Chứa chữ in thường (a-z)', ok: /[a-z]/.test(passForm.newPassword) },
                        { label: 'Chứa chữ số (0-9)', ok: /[0-9]/.test(passForm.newPassword) },
                        { label: 'Chứa ký tự đặc biệt (!@#$...)', ok: /[^A-Za-z0-9]/.test(passForm.newPassword) },
                      ].map((rule, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'flex items-center gap-1.5 text-[11px]',
                            rule.ok ? 'text-emerald-600 font-medium' : 'text-muted-foreground'
                          )}
                        >
                          <div
                            className={cn(
                              'size-3.5 rounded-[3px] border flex items-center justify-center shrink-0',
                              rule.ok
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-border bg-background'
                            )}
                          >
                            {rule.ok && <Check size={10} />}
                          </div>
                          <span>{rule.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end">
                    <Button
                      type="submit"
                      disabled={passLoading}
                      className="h-9 px-5 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
                    >
                      {passLoading && <Loader2 size={13} className="animate-spin mr-1.5" />}
                      Cập nhật mật khẩu
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: QUYỀN HẠN ĐƯỢC GÁN (CHỈ XEM) */}
          {activeTab === 'permissions' && (
            <Card className="rounded-[6px] border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">Quyền hạn được cấp</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Danh sách các quyền hạn bạn được cấp trên hệ thống theo vai trò và quyền riêng biệt (Chế độ chỉ xem).
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="rounded-[4px] text-xs font-mono">
                    {isSuperAdmin ? 'Toàn quyền quản trị (*)' : `${totalGrantedPerms} quyền đã kích hoạt`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Notice Banner */}
                {isSuperAdmin ? (
                  <div className="p-3.5 rounded-[6px] border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                    <div>
                      <p className="font-semibold">Tài khoản Quản trị viên Tối cao (Super Administrator)</p>
                      <p className="text-[11px] opacity-90">
                        Bạn sở hữu toàn quyền quản trị tuyệt đối trên mọi phân hệ (bypass mọi phân quyền RBAC).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-[6px] border border-border bg-muted/20 flex items-start gap-2.5 text-xs text-muted-foreground">
                    <Lock size={15} className="shrink-0 mt-0.5 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Vai trò hiện tại: {myPermsData?.role?.name || user?.roleId?.name || user?.role || 'Nhân viên'}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Dưới đây là danh sách các quyền hạn được cấp theo vai trò và phân quyền cá nhân của bạn.
                      </p>
                    </div>
                  </div>
                )}

                {/* Filter Search */}
                <div className="relative max-w-sm">
                  <Input
                    type="text"
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder="Tìm kiếm theo tên quyền, mã quyền..."
                    className="h-9 pl-8 rounded-[6px] text-xs"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>

                {/* Permissions List */}
                {loadingPerms ? (
                  <div className="flex items-center justify-center p-8 text-xs text-muted-foreground font-mono">
                    <Loader2 size={16} className="animate-spin mr-2" /> Đang tải dữ liệu quyền hạn...
                  </div>
                ) : Object.keys(groupedPermissions).length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-[6px] bg-muted/5">
                    <ShieldCheck className="size-8 text-muted-foreground/40 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Chưa có quyền hạn nào được gán</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Tài khoản của bạn hiện chưa được phân bổ quyền quản trị. Vui lòng liên hệ Quản trị viên để được cấp quyền.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      let matchCount = 0;
                      const renderedGroups = Object.entries(groupedPermissions).map(([mod, perms]) => {
                        if (!Array.isArray(perms) || perms.length === 0) return null;
                        const filteredPerms = perms.filter(
                          (p) =>
                            p.name?.toLowerCase().includes(permSearch.toLowerCase()) ||
                            p.code?.toLowerCase().includes(permSearch.toLowerCase()) ||
                            mod.toLowerCase().includes(permSearch.toLowerCase())
                        );
                        if (filteredPerms.length === 0) return null;
                        matchCount += filteredPerms.length;

                        return (
                          <div key={mod} className="rounded-[6px] border border-border bg-muted/10 p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-border/60 pb-2">
                              <span className="font-bold text-xs text-foreground uppercase tracking-wider font-mono">
                                Phân hệ: {mod}
                              </span>
                              <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                                {filteredPerms.length} quyền
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {filteredPerms.map((p) => (
                                <div
                                  key={p._id || p.code}
                                  className="flex items-center justify-between gap-2 p-2.5 rounded-[6px] border border-border bg-card text-foreground font-medium transition-colors shadow-2xs hover:border-border/80"
                                >
                                  <div className="flex items-center gap-2.5 truncate min-w-0">
                                    <div className="size-4 rounded-[3px] flex items-center justify-center shrink-0 bg-emerald-600 text-white shadow-2xs">
                                      <Check size={11} strokeWidth={3} />
                                    </div>
                                    <div className="truncate">
                                      <p className="truncate text-xs font-semibold text-foreground">{p.name}</p>
                                      <p className="text-[10px] font-mono text-muted-foreground truncate">{p.code}</p>
                                    </div>
                                  </div>

                                  <Badge
                                    variant="secondary"
                                    className="rounded-[3px] text-[9px] px-1.5 py-0 font-mono font-medium shrink-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  >
                                    Kích hoạt
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      });

                      if (matchCount === 0 && permSearch.trim() !== '') {
                        return (
                          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-[6px]">
                            Không tìm thấy quyền hạn nào phù hợp với từ khóa "{permSearch}".
                          </div>
                        );
                      }

                      return renderedGroups;
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 4: LIÊN KẾT MẠNG XÃ HỘI */}
          {activeTab === 'social' && (
            <Card className="rounded-[6px] border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base font-bold text-foreground">Liên kết Mạng xã hội & OAuth</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Liên kết tài khoản Google, Zalo hoặc TikTok để đăng nhập nhanh chóng bằng 1 chạm mà không cần nhập mật khẩu.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {loadingSocial ? (
                  <div className="flex items-center justify-center p-8 text-xs text-muted-foreground font-mono">
                    <Loader2 size={16} className="animate-spin mr-2" /> Đang kiểm tra trạng thái liên kết...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Google Card */}
                    <div className="flex items-center justify-between p-4 rounded-[6px] border border-border bg-muted/10">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-[6px] bg-white border border-border flex items-center justify-center shadow-2xs shrink-0">
                          <svg className="size-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-foreground">Tài khoản Google</h4>
                            {linkedAccounts.google?.isLinked ? (
                              <Badge variant="outline" className="rounded-[4px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono">
                                Đã kết nối
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-[4px] text-muted-foreground text-[10px] font-mono">
                                Chưa liên kết
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {linkedAccounts.google?.isLinked
                              ? `Google ID: ${linkedAccounts.google?.id || '—'}`
                              : ''}
                          </p>
                        </div>
                      </div>

                      {linkedAccounts.google?.isLinked && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlinkSocial('google')}
                          disabled={unlinkingProvider === 'google'}
                          className="h-8 rounded-[6px] text-xs text-destructive hover:bg-destructive/10 border-border active:scale-[0.98]"
                        >
                          {unlinkingProvider === 'google' ? (
                            <Loader2 size={12} className="animate-spin mr-1" />
                          ) : (
                            <Trash2 size={12} className="mr-1" />
                          )}
                          Hủy liên kết
                        </Button>
                      )}
                    </div>

                    {/* Zalo Card */}
                    <div className="flex items-center justify-between p-4 rounded-[6px] border border-border bg-muted/10">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-[6px] bg-[#0068FF] flex items-center justify-center shrink-0 shadow-2xs p-1.5">
                          <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="7" fill="#FFFFFF" />
                            <path
                              d="M7 11h7.8v2.1l-5 6.6h5.3v2.3H6.9v-2.1l5-6.6H7V11zm9.3 4.8c0-1.7 1.1-2.8 2.7-2.8s2.7 1.1 2.7 2.8v4.2H20v-4.2c0-.6-.3-1-1-1s-1 .4-1 1v4.2h-1.7v-4.2zm6.6-4.8h1.7v10h-1.7V11zm2.8 4.8c0-1.7 1.1-2.8 2.7-2.8s2.7 1.1 2.7 2.8v4.2h-1.7v-4.2c0-.6-.3-1-1-1s-1 .4-1 1v4.2h-1.7v-4.2z"
                              fill="#0068FF"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-foreground">Tài khoản Zalo</h4>
                            {linkedAccounts.zalo?.isLinked ? (
                              <Badge variant="outline" className="rounded-[4px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono">
                                Đã kết nối
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-[4px] text-muted-foreground text-[10px] font-mono">
                                Chưa liên kết
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {linkedAccounts.zalo?.isLinked
                              ? `Zalo ID: ${linkedAccounts.zalo?.id || '—'}`
                              : ''}
                          </p>
                        </div>
                      </div>

                      {linkedAccounts.zalo?.isLinked ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlinkSocial('zalo')}
                          disabled={unlinkingProvider === 'zalo'}
                          className="h-8 rounded-[6px] text-xs text-destructive hover:bg-destructive/10 border-border active:scale-[0.98]"
                        >
                          {unlinkingProvider === 'zalo' ? (
                            <Loader2 size={12} className="animate-spin mr-1" />
                          ) : (
                            <Trash2 size={12} className="mr-1" />
                          )}
                          Hủy liên kết
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleStartZaloLink}
                          className="h-8 rounded-[6px] text-xs text-[#0068FF] hover:bg-[#0068FF]/10 border-border active:scale-[0.98]"
                        >
                          <ExternalLink size={12} className="mr-1" />
                          Liên kết Zalo
                        </Button>
                      )}
                    </div>

                    {/* TikTok Card */}
                    <div className="flex items-center justify-between p-4 rounded-[6px] border border-border bg-muted/10">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-[6px] bg-black flex items-center justify-center shrink-0 shadow-2xs p-1.5">
                          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M19.321 5.562a5.122 5.122 0 0 1-3.414-1.297A5.19 5.19 0 0 1 14.48.973h-3.47v14.43c0 1.93-1.57 3.49-3.5 3.49-1.93 0-3.5-1.56-3.5-3.49 0-1.93 1.57-3.5 3.5-3.5.37 0 .73.06 1.06.17V8.53a6.974 6.974 0 0 0-1.06-.08C3.36 8.45 0 11.81 0 15.9c0 4.09 3.36 7.45 7.51 7.45 4.14 0 7.5-3.36 7.5-7.45V8.18a8.62 8.62 0 0 0 5.15 1.68V6.4a5.15 5.15 0 0 1-.839-.838z"
                              fill="#FE2C55"
                            />
                            <path
                              d="M18.482 4.724a5.122 5.122 0 0 1-3.414-1.297A5.19 5.19 0 0 1 13.64.135h-1.79v14.43c0 1.93-1.57 3.49-3.5 3.49a3.504 3.504 0 0 1-3.5-3.49c0-1.93 1.57-3.5 3.5-3.5.37 0 .73.06 1.06.17V7.69a6.974 6.974 0 0 0-1.06-.08C4.2 7.61.84 10.97.84 15.06c0 4.09 3.36 7.45 7.51 7.45 4.14 0 7.5-3.36 7.5-7.45V7.34a8.62 8.62 0 0 0 5.15 1.68V5.56a5.15 5.15 0 0 1-2.518-.836z"
                              fill="#25F4EE"
                            />
                            <path
                              d="M18.482 5.562a5.122 5.122 0 0 1-3.414-1.297A5.19 5.19 0 0 1 13.64.973h-2.63v14.43c0 1.93-1.57 3.49-3.5 3.49-1.93 0-3.5-1.56-3.5-3.49 0-1.93 1.57-3.5 3.5-3.5.37 0 .73.06 1.06.17V8.53a6.974 6.974 0 0 0-1.06-.08C4.2 8.45.84 11.81.84 15.9c0 4.09 3.36 7.45 7.51 7.45 4.14 0 7.5-3.36 7.5-7.45V8.18a8.62 8.62 0 0 0 5.15 1.68V6.4a5.15 5.15 0 0 1-1.678-.838z"
                              fill="#FFFFFF"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-foreground">Tài khoản TikTok</h4>
                            {linkedAccounts.tiktok?.isLinked ? (
                              <Badge variant="outline" className="rounded-[4px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono">
                                Đã kết nối
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-[4px] text-muted-foreground text-[10px] font-mono">
                                Chưa liên kết
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {linkedAccounts.tiktok?.isLinked
                              ? `TikTok ID: ${linkedAccounts.tiktok?.id || '—'}`
                              : ''}
                          </p>
                        </div>
                      </div>

                      {linkedAccounts.tiktok?.isLinked ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlinkSocial('tiktok')}
                          disabled={unlinkingProvider === 'tiktok'}
                          className="h-8 rounded-[6px] text-xs text-destructive hover:bg-destructive/10 border-border active:scale-[0.98]"
                        >
                          {unlinkingProvider === 'tiktok' ? (
                            <Loader2 size={12} className="animate-spin mr-1" />
                          ) : (
                            <Trash2 size={12} className="mr-1" />
                          )}
                          Hủy liên kết
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleStartTikTokLink}
                          className="h-8 rounded-[6px] text-xs text-foreground hover:bg-accent border-border active:scale-[0.98]"
                        >
                          <ExternalLink size={12} className="mr-1" />
                          Liên kết TikTok
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 5: KHÓA BẢO MẬT PASSKEY (WEBAUTHN) */}
          {activeTab === 'passkey' && (
            <Card className="rounded-[6px] border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <Fingerprint className="size-5 text-primary" />
                      <span>Khóa bảo mật Passkey (FIDO2 / WebAuthn)</span>
                    </CardTitle>
                    {/* <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Đăng nhập trang quản trị bảo mật không cần mật khẩu bằng vân tay, khuôn mặt (Windows Hello / Touch ID) hoặc khóa vật lý USB.
                    </CardDescription> */}
                  </div>
                  <Badge variant="outline" className="rounded-[4px] bg-primary/10 text-primary border-primary/20 text-xs font-mono">
                    {user?.passkeys?.length || 0} khóa đã đăng ký
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Information Callout */}
                {/* <div className="p-4 rounded-[6px] border border-blue-500/20 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="size-4 shrink-0" />
                    <span>Bảo mật cấp độ cao nhất cho Quản trị viên</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Passkey lưu trữ khóa bí mật trực tiếp trong chip bảo mật TPM / Secure Enclave trên máy của bạn. Kẻ gian không thể đánh cắp qua tấn công lừa đảo (phishing) hay rò rỉ cơ sở dữ liệu.
                  </p>
                </div> */}

                {/* Form to register current device */}
                <form onSubmit={handleRegisterNewPasskey} className="p-4 rounded-[6px] border border-border bg-muted/20 space-y-3">
                  <h4 className="font-bold text-xs text-foreground">Đăng ký thiết bị hiện tại</h4>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Tên thiết bị (VD: MacBook Pro, PC Văn Phòng, Windows Hello...)"
                      value={passkeyDeviceName}
                      onChange={(e) => setPasskeyDeviceName(e.target.value)}
                      className="h-9 rounded-[6px] text-xs flex-grow font-sans"
                    />
                    <Button
                      type="submit"
                      disabled={passkeyLoading}
                      className="h-9 rounded-[6px] text-xs font-semibold shrink-0 cursor-pointer active:scale-[0.98] flex items-center gap-1.5 shadow-xs"
                    >
                      {passkeyLoading ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Fingerprint className="size-3.5" />
                      )}
                      <span>Tạo khóa Passkey mới</span>
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Khi nhấn tạo, trình duyệt sẽ hiển thị hộp thoại bảo mật hệ điều hành để bạn quét vân tay hoặc khuôn mặt.
                  </p>
                </form>

                {/* Registered Passkeys List */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-foreground">Danh sách khóa đã kích hoạt</h4>
                  {user?.passkeys && user.passkeys.length > 0 ? (
                    <div className="space-y-2">
                      {user.passkeys.map((pk, idx) => (
                        <div
                          key={pk.credentialId || idx}
                          className="flex items-center justify-between p-3 rounded-[6px] border border-border bg-background"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <KeyRound className="size-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-foreground">
                                  {pk.deviceName || `Khóa bảo mật #${idx + 1}`}
                                </span>
                                <Badge variant="outline" className="rounded-[4px] text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                                  Hoạt động
                                </Badge>
                              </div>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                Tạo lúc: {pk.createdAt ? new Date(pk.createdAt).toLocaleString('vi-VN') : '—'}
                              </span>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePasskey(pk.credentialId, pk.deviceName)}
                            disabled={deletingPasskeyId === pk.credentialId}
                            className="h-8 rounded-[6px] text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-border active:scale-[0.98] transition-all shrink-0"
                          >
                            {deletingPasskeyId === pk.credentialId ? (
                              <Loader2 size={13} className="animate-spin mr-1.5" />
                            ) : (
                              <Trash2 size={13} className="mr-1.5" />
                            )}
                            <span>Xóa khóa</span>
                          </Button>
                        </div>
                      ))}

                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-border rounded-[6px] text-xs text-muted-foreground">
                      Chưa có khóa Passkey nào được đăng ký cho tài khoản này. Hãy đăng ký thiết bị của bạn ở trên để đăng nhập siêu nhanh!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 6: PHIÊN ĐĂNG NHẬP & THIẾT BỊ HOẠT ĐỘNG */}
          {activeTab === 'sessions' && (
            <Card className="rounded-[6px] border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <Laptop className="size-5 text-primary" />
                      <span>Phiên đăng nhập & Thiết bị hoạt động</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Kiểm tra và quản lý các thiết bị đang đăng nhập vào bảng điều khiển quản trị viên.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={fetchSessions}
                      disabled={loadingSessions}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-[6px]"
                      title="Làm mới"
                    >
                      <RefreshCw size={13} className={loadingSessions ? 'animate-spin' : ''} />
                    </Button>

                    {sessions.filter((s) => !s.isCurrent).length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLogoutOtherSessions}
                        disabled={loggingOutOthers}
                        className="h-8 px-3 text-xs text-destructive hover:bg-destructive/10 border-border rounded-[6px] active:scale-[0.98]"
                      >
                        {loggingOutOthers ? (
                          <Loader2 size={12} className="animate-spin mr-1.5" />
                        ) : (
                          <LogOut size={12} className="mr-1.5" />
                        )}
                        Đăng xuất thiết bị khác ({sessions.filter((s) => !s.isCurrent).length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingSessions ? (
                  <div className="flex items-center justify-center p-8 text-xs text-muted-foreground font-mono">
                    <Loader2 size={16} className="animate-spin mr-2" /> Đang tải danh sách thiết bị...
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Không có phiên đăng nhập nào
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {sessions.map((session, index) => {
                      const isCurrent = session.isCurrent;
                      return (
                        <div
                          key={session.sessionId || index}
                          className={cn(
                            'p-4 flex items-center justify-between gap-4 transition-colors',
                            isCurrent ? 'bg-primary/5' : 'hover:bg-muted/20'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                'size-9 rounded-[6px] border flex items-center justify-center shrink-0',
                                isCurrent
                                  ? 'bg-primary/10 border-primary/20 text-primary'
                                  : 'bg-muted border-border text-muted-foreground'
                              )}
                            >
                              {session.deviceType === 'mobile' ? (
                                <Smartphone size={16} />
                              ) : session.deviceType === 'tablet' ? (
                                <Tablet size={16} />
                              ) : (
                                <Laptop size={16} />
                              )}
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-xs text-foreground truncate">
                                  {session.deviceName || `${session.os} (${session.browser})`}
                                </h4>
                                {isCurrent ? (
                                  <Badge
                                    variant="outline"
                                    className="rounded-[4px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-mono shrink-0"
                                  >
                                    Phiên hiện tại
                                  </Badge>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    {session.browser || 'Trình duyệt Web'}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono flex-wrap">
                                <span className="tabular-nums">IP: {session.ip || '127.0.0.1'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-sans">
                                  <Clock size={11} className="text-muted-foreground" />
                                  {isCurrent
                                    ? 'Đang hoạt động'
                                    : session.lastActiveAt
                                    ? new Date(session.lastActiveAt).toLocaleString('vi-VN')
                                    : 'Vừa xong'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {!isCurrent && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleLogoutSession(session.sessionId)}
                              disabled={loggingOutSessionId === session.sessionId}
                              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border rounded-[6px] active:scale-[0.98] shrink-0"
                            >
                              {loggingOutSessionId === session.sessionId ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <>
                                  <LogOut size={12} className="mr-1" />
                                  Đăng xuất
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
