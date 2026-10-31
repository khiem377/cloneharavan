export const REACTION_CONFIG = {
  like: { label: 'Thích', color: 'text-blue-600' },
  love: { label: 'Yêu thích', color: 'text-rose-600' },
  haha: { label: 'Haha', color: 'text-amber-500' },
  wow: { label: 'Wow', color: 'text-amber-500' },
  sad: { label: 'Buồn', color: 'text-amber-500' },
  angry: { label: 'Phẫn nộ', color: 'text-orange-600' },
};

export const AVATAR_PALETTES = [
  'bg-rose-100 text-rose-600',
  'bg-orange-100 text-orange-600',
  'bg-purple-100 text-purple-600',
  'bg-sky-100 text-sky-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-700',
  'bg-indigo-100 text-indigo-600',
];

export function getAvatarPalette(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

export function formatTimeAgo(dateString) {
  if (!dateString) return 'Vừa xong';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}
