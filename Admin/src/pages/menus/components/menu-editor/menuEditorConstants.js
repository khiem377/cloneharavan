export const nanoid = () => Math.random().toString(36).slice(2, 10);

export function makeItem(overrides = {}) {
  return {
    _id: nanoid(),
    label: '',
    linkType: 'url',
    linkRef: null,
    customUrl: '',
    openInNewTab: false,
    badge: '',
    badgeColor: '#ef4444',
    megaMenu: false,
    isActive: true,
    children: [],
    ...overrides,
  };
}

export const LINK_TYPE_LABELS = {
  none: 'Không có link',
  url: 'URL tùy chỉnh',
  category: 'Danh mục sản phẩm',
  brand: 'Thương hiệu',
  blog: 'Danh mục Blog',
};

export const BADGE_COLORS = [
  { label: 'Đỏ', value: '#ef4444' },
  { label: 'Cam', value: '#f97316' },
  { label: 'Xanh lá', value: '#22c55e' },
  { label: 'Xanh dương', value: '#3b82f6' },
  { label: 'Tím', value: '#a855f7' },
];
