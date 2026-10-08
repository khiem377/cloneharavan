import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { useMyPermissions } from '@/hooks/useRoles';
import { toast } from '@/providers/ToastProvider';
import ProfileSidebar from './components/ProfileSidebar';
import ProfileInfoTab from './components/ProfileInfoTab';
import ChangePasswordTab from './components/ChangePasswordTab';
import PasskeyTab from './components/PasskeyTab';
import ActiveSessionsTab from './components/ActiveSessionsTab';
import UserPermissionsTab from './components/UserPermissionsTab';
import SocialAccountsTab from './components/SocialAccountsTab';

/**
 * Admin Profile & Account Security Management Page
 */
export default function AdminProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [activeTab, setActiveTab] = useState('profile');
  const avatarInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Permissions Data
  const { data: myPermsData = {}, isLoading: loadingPerms } = useMyPermissions();

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
  }, [groupedPermissions, myPermsData]);

  // Avatar Upload
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

  // Logout
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {}
    clearAuth();
    navigate('/login');
    toast.info('Đã đăng xuất khỏi hệ thống');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân & Bảo mật</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quản lý thông tin tài khoản, cấu hình bảo mật Passkey và phân quyền quản trị của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Column: Sidebar Card */}
        <div className="md:col-span-1">
          <ProfileSidebar
            user={user}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onLogout={handleLogout}
            avatarLoading={avatarLoading}
            avatarInputRef={avatarInputRef}
            onAvatarChange={handleAvatarChange}
          />
        </div>

        {/* Right Column: Active Tab Content */}
        <div className="md:col-span-3 space-y-4">
          {activeTab === 'profile' && <ProfileInfoTab user={user} setUser={setUser} />}
          {activeTab === 'password' && <ChangePasswordTab />}
          {activeTab === 'passkey' && <PasskeyTab user={user} setUser={setUser} />}
          {activeTab === 'sessions' && <ActiveSessionsTab />}
          {activeTab === 'permissions' && (
            <UserPermissionsTab
              isSuperAdmin={isSuperAdmin}
              totalGrantedPerms={totalGrantedPerms}
              loadingPerms={loadingPerms}
              groupedPermissions={groupedPermissions}
              myPermsData={myPermsData}
              user={user}
            />
          )}
          {activeTab === 'social' && <SocialAccountsTab />}
        </div>
      </div>
    </div>
  );
}
