
export const isSyntheticEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const lower = email.toLowerCase().trim();
  return (
    lower.endsWith('@zalo.user') ||
    lower.endsWith('@tiktok.user') ||
    lower.startsWith('zalo_') ||
    lower.startsWith('tiktok_')
  );
};

export const getAuthProviderLabel = (user) => {
  if (!user) return 'Chưa xác định';
  if (user.zaloId || user.authProvider === 'zalo') return 'Zalo';
  if (user.tiktokId || user.authProvider === 'tiktok') return 'TikTok';
  if (user.googleId || user.authProvider === 'google') return 'Google Account';
  return 'Email & Mật khẩu';
};

export const getDisplayAccountIdentifier = (user) => {
  if (!user) return '';
  if (user.phone) {
    return `${user.phone.slice(0, 3)}****${user.phone.slice(-3)}`;
  }
  if (user.email && !isSyntheticEmail(user.email)) {
    return user.email;
  }
  if (user.zaloId || user.authProvider === 'zalo') {
    return 'Đăng nhập Zalo';
  }
  if (user.tiktokId || user.authProvider === 'tiktok') {
    return 'Đăng nhập TikTok';
  }
  return 'Thành viên SHOP';
};
