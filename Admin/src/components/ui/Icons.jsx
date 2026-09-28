/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║         CUSTOM SVG ICON LIBRARY — SHOP Admin              ║
 * ║  Handcrafted, detailed & beautiful — replaces Lucide      ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * Usage:
 *   import { DashboardIcon, ProductsIcon } from '@/components/ui/Icons';
 *   <DashboardIcon size={18} className="text-muted-foreground" />
 *
 * All icons share:  viewBox="0 0 24 24"  strokeWidth="1.65"  fill="none"
 */

// ─── Base wrapper ─────────────────────────────────────────────────────────────
const Ic = ({ children, size = 16, className = '', style, strokeWidth = 1.65, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

// ═══════════════════════════════════════════════════════════════
//  NAVIGATION / SIDEBAR
// ═══════════════════════════════════════════════════════════════

/** Dashboard — bold analytics grid: filled anchor panel + live sparkline + pulse ring */
export const DashboardIcon = (p) => (
  <Ic {...p}>
    {/* Filled anchor: left tall panel */}
    <rect x="2.5" y="2.5" width="9.5" height="13" rx="2.5" fill="currentColor" opacity="0.18" strokeWidth="0" />
    <rect x="2.5" y="2.5" width="9.5" height="13" rx="2.5" />
    {/* Right top compact panel — solid highlight */}
    <rect x="14" y="2.5" width="7.5" height="5.5" rx="2.5" fill="currentColor" />
    {/* Right bottom tall panel */}
    <rect x="14" y="10" width="7.5" height="11.5" rx="2.5" />
    {/* Bottom left bar */}
    <rect x="2.5" y="17.5" width="9.5" height="4" rx="2.5" />
    {/* Sparkline in left panel */}
    <polyline points="4 12 6 9.5 8 11 10.5 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10.5" cy="7" r="1.3" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** Media — clapperboard: bold hinged top stripes + open frame bottom */
export const MediaIcon = (p) => (
  <Ic {...p}>
    {/* Bottom frame — filled silhouette */}
    <rect x="2" y="8" width="20" height="13" rx="2.5" fill="currentColor" opacity="0.15" strokeWidth="0" />
    <rect x="2" y="8" width="20" height="13" rx="2.5" />
    {/* Top clapperboard bar — bold filled */}
    <rect x="2" y="3.5" width="20" height="4.5" rx="2" fill="currentColor" />
    {/* Clapper diagonal stripes — white cutout style */}
    <path d="M5 3.5L3 8h3l2-4.5zM11 3.5L9 8h4l2-4.5zM17 3.5l-2 4.5h4l1-4.5z"
      fill="hsl(var(--sidebar-background,#0f0f1a))" strokeWidth="0" opacity="0.9" />
    {/* Play icon inside frame */}
    <path d="M10 12.5l5.5 3-5.5 3z" fill="currentColor" opacity="0.7" strokeWidth="0" />
    {/* Hinge dot */}
    <circle cx="12" cy="5.7" r="0.8" fill="hsl(var(--sidebar-background,#0f0f1a))" strokeWidth="0" />
  </Ic>
);

/** Banners — billboard monitor: filled hero block left + content lines + nav dots */
export const BannersIcon = (p) => (
  <Ic {...p}>
    {/* Monitor outer */}
    <rect x="1.5" y="3" width="21" height="15" rx="2.5" fill="currentColor" opacity="0.12" strokeWidth="0" />
    <rect x="1.5" y="3" width="21" height="15" rx="2.5" />
    {/* Bold hero block left — filled solid */}
    <rect x="4" y="5.5" width="7" height="10" rx="1.5" fill="currentColor" />
    {/* Headline lines right */}
    <rect x="13" y="6.5" width="7.5" height="2" rx="0.8" fill="currentColor" opacity="0.5" strokeWidth="0" />
    <rect x="13" y="10" width="5.5" height="1.5" rx="0.6" fill="currentColor" opacity="0.35" strokeWidth="0" />
    <rect x="13" y="12.5" width="6.5" height="1.5" rx="0.6" fill="currentColor" opacity="0.35" strokeWidth="0" />
    {/* Stand */}
    <path d="M12 18v2.5M9.5 20.5h5" strokeWidth="1.5" strokeLinecap="round" />
    {/* Slider dots */}
    <circle cx="10.5" cy="21" r="0.7" fill="currentColor" strokeWidth="0" opacity="0.35" />
    <circle cx="12" cy="21" r="0.9" fill="currentColor" strokeWidth="0" />
    <circle cx="13.5" cy="21" r="0.7" fill="currentColor" strokeWidth="0" opacity="0.35" />
  </Ic>
);

/** Products — isometric 3D box: top face filled + side faces outlined + ribbon accent */
export const ProductsIcon = (p) => (
  <Ic {...p}>
    {/* Top face — filled solid */}
    <path d="M12 2.5L21.5 7.5l-9.5 5-9.5-5z" fill="currentColor" />
    {/* Left face */}
    <path d="M2.5 7.5v9l9.5 5v-9z" fill="currentColor" opacity="0.15" strokeWidth="0" />
    <path d="M2.5 7.5v9l9.5 5v-9z" />
    {/* Right face */}
    <path d="M21.5 7.5v9l-9.5 5v-9z" fill="currentColor" opacity="0.28" strokeWidth="0" />
    <path d="M21.5 7.5v9l-9.5 5v-9z" />
    {/* Ribbon */}
    <path d="M9.5 5.5L12 2.5l2.5 3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
  </Ic>
);

/** List — dot-prefixed elegant lines */
export const ListIcon = (p) => (
  <Ic {...p}>
    <rect x="3" y="4" width="2.8" height="2.8" rx="0.8" fill="currentColor" strokeWidth="0" />
    <rect x="3" y="10.6" width="2.8" height="2.8" rx="0.8" fill="currentColor" strokeWidth="0" />
    <rect x="3" y="17.2" width="2.8" height="2.8" rx="0.8" fill="currentColor" strokeWidth="0" />
    <path d="M9 5.4h12M9 12h9M9 18.6h12" />
  </Ic>
);

/** Plus / Create new — circle with crisp plus */
export const PlusIcon = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7.5V16.5M7.5 12h9" />
  </Ic>
);

/** Import / Export — document with download arrow */
export const ImportIcon = (p) => (
  <Ic {...p}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <path d="M12 13v5M9.5 15.5 12 18l2.5-2.5" />
  </Ic>
);

/** Categories — radial mindmap: filled center hub + spoke lines + leaf nodes */
export const CategoriesIcon = (p) => (
  <Ic {...p}>
    {/* Center hub — filled solid */}
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    {/* Spoke arms */}
    <line x1="12" y1="8.5" x2="12" y2="3.5" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="12" y1="15.5" x2="12" y2="20.5" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="8.5" y1="12" x2="3.5" y2="12" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="15.5" y1="12" x2="20.5" y2="12" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="9.5" y1="9.5" x2="6" y2="6" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
    <line x1="14.5" y1="14.5" x2="18" y2="18" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
    {/* Leaf nodes */}
    <circle cx="12" cy="2.5" r="1.8" />
    <circle cx="12" cy="21.5" r="1.8" />
    <circle cx="2.5" cy="12" r="1.8" />
    <circle cx="21.5" cy="12" r="1.8" />
    <circle cx="5" cy="5" r="1.4" opacity="0.6" />
    <circle cx="19" cy="19" r="1.4" opacity="0.6" />
  </Ic>
);

/** Brands — royal crown: filled base + sharp points + gem accent */
export const BrandsIcon = (p) => (
  <Ic {...p}>
    {/* Crown filled silhouette */}
    <path d="M2 19h20v2.5H2z" fill="currentColor" opacity="0.2" strokeWidth="0" />
    <path d="M2 19l3-10 4.5 5L12 4l2.5 10L19 9l3 10H2z" fill="currentColor" opacity="0.15" strokeWidth="0" />
    <path d="M2 19l3-10 4.5 5L12 4l2.5 10L19 9l3 10H2z" strokeLinejoin="round" />
    {/* Base bar */}
    <rect x="2" y="19" width="20" height="2.5" rx="1" />
    {/* Crown gems */}
    <circle cx="5" cy="9" r="1.2" fill="currentColor" strokeWidth="0" />
    <circle cx="12" cy="4" r="1.5" fill="currentColor" strokeWidth="0" />
    <circle cx="19" cy="9" r="1.2" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** Coupons — bold ticket: filled right section + perforation + % mark */
export const CouponsIcon = (p) => (
  <Ic {...p}>
    {/* Ticket silhouette */}
    <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-5z"
      fill="currentColor" opacity="0.12" strokeWidth="0" />
    <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-5z" />
    {/* Perforation line */}
    <line x1="9" y1="5" x2="9" y2="19" strokeDasharray="2 1.5" strokeWidth="1.3" />
    {/* Right section filled */}
    <rect x="9.5" y="5.5" width="11" height="13" rx="0" fill="currentColor" opacity="0.08" strokeWidth="0" />
    {/* Bold % diagonal */}
    <line x1="12.5" y1="15" x2="18" y2="9" strokeWidth="1.8" strokeLinecap="round" />
    {/* % circles */}
    <circle cx="13" cy="9.5" r="1.5" fill="currentColor" />
    <circle cx="17.5" cy="14.5" r="1.5" fill="currentColor" />
  </Ic>
);

/** Discounts — bold filled tag + negative-space lightning punch-through */
export const DiscountIcon = (p) => (
  <Ic {...p}>
    {/* Tag filled silhouette */}
    <path d="M3 3h6l9.5 9.5a2.5 2.5 0 0 1 0 3.5l-3.5 3.5a2.5 2.5 0 0 1-3.5 0L2 10V3z"
      fill="currentColor" opacity="0.18" strokeWidth="0" />
    <path d="M3 3h6l9.5 9.5a2.5 2.5 0 0 1 0 3.5l-3.5 3.5a2.5 2.5 0 0 1-3.5 0L2 10V3z" />
    {/* Eyelet hole */}
    <circle cx="7.5" cy="7.5" r="1.8" fill="currentColor" />
    {/* Lightning bolt punch-out */}
    <path d="M14 12l-3 3.5h3.5l-3 3.5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </Ic>
);

/** Gift programs — festive box: filled body + lid band + bold floating bow */
export const GiftIcon = (p) => (
  <Ic {...p}>
    {/* Box body filled */}
    <rect x="2.5" y="10.5" width="19" height="11" rx="2" fill="currentColor" opacity="0.18" strokeWidth="0" />
    <rect x="2.5" y="10.5" width="19" height="11" rx="2" />
    {/* Lid band — filled solid */}
    <rect x="1.5" y="7.5" width="21" height="3" rx="1.5" fill="currentColor" />
    {/* Center ribbon */}
    <line x1="12" y1="7.5" x2="12" y2="21.5" strokeWidth="1.5" />
    {/* Bow left loop — filled */}
    <path d="M12 7.5C10 5 6.5 2.5 6 5.5C5.5 8.5 10.5 8 12 7.5z" fill="currentColor" opacity="0.6" strokeWidth="0" />
    <path d="M12 7.5C10 5 6.5 2.5 6 5.5C5.5 8.5 10.5 8 12 7.5z" />
    {/* Bow right loop — filled */}
    <path d="M12 7.5C14 5 17.5 2.5 18 5.5C18.5 8.5 13.5 8 12 7.5z" fill="currentColor" opacity="0.6" strokeWidth="0" />
    <path d="M12 7.5C14 5 17.5 2.5 18 5.5C18.5 8.5 13.5 8 12 7.5z" />
    {/* Knot dot */}
    <circle cx="12" cy="7.5" r="1.2" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** Settings — hex gear: filled silhouette + inner ring + center dot */
export const SettingsIcon = (p) => (
  <Ic {...p}>
    {/* Hex gear filled silhouette */}
    <path d="M10.3 2.1L8 3.6v2.8L5.7 7.8 3.2 7.1 2 9.3l2 1.7v2l-2 1.7 1.2 2.2 2.5-.7L8 17.6v2.8l2.3 1.5 1.7-1.8h2l1.7 1.8 2.3-1.5v-2.8l2.3-1.4 2.5.7 1.2-2.2-2-1.7v-2l2-1.7-1.2-2.2-2.5.7L16 6.4V3.6L13.7 2.1 12 3.9h-1.7z"
      fill="currentColor" opacity="0.15" strokeWidth="0" />
    <path d="M10.3 2.1L8 3.6v2.8L5.7 7.8 3.2 7.1 2 9.3l2 1.7v2l-2 1.7 1.2 2.2 2.5-.7L8 17.6v2.8l2.3 1.5 1.7-1.8h2l1.7 1.8 2.3-1.5v-2.8l2.3-1.4 2.5.7 1.2-2.2-2-1.7v-2l2-1.7-1.2-2.2-2.5.7L16 6.4V3.6L13.7 2.1 12 3.9h-1.7z"
      strokeWidth="1.4" strokeLinejoin="round" />
    {/* Inner ring */}
    <circle cx="12" cy="12" r="3.2" />
    {/* Center dot */}
    <circle cx="12" cy="12" r="1.2" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** Logout — filled door + bold exit arrow + energy arc */
export const LogOutIcon = (p) => (
  <Ic {...p}>
    {/* Door filled */}
    <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" fill="currentColor" opacity="0.15" strokeWidth="0" />
    <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" />
    {/* Bold arrow */}
    <path d="M16 7l5 5-5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="21" y1="12" x2="10" y2="12" strokeWidth="2" strokeLinecap="round" />
    {/* Energy motion arc */}
    <path d="M14.5 4.8a8 8 0 0 1 0 14.4" strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
  </Ic>
);

// ═══════════════════════════════════════════════════════════════
//  NAVIGATION HELPERS
// ═══════════════════════════════════════════════════════════════

export const ChevronRightIcon = (p) => (
  <Ic {...p}><path d="M9 6l6 6-6 6" /></Ic>
);

export const ChevronLeftIcon = (p) => (
  <Ic {...p}><path d="M15 18l-6-6 6-6" /></Ic>
);

export const ChevronDownIcon = (p) => (
  <Ic {...p}><path d="M6 9l6 6 6-6" /></Ic>
);

export const ChevronUpIcon = (p) => (
  <Ic {...p}><path d="M18 15l-6-6-6 6" /></Ic>
);

export const ChevronsUpDownIcon = (p) => (
  <Ic {...p}>
    <path d="M7 15l5 5 5-5" />
    <path d="M7 9l5-5 5 5" />
  </Ic>
);

export const ArrowUpDownIcon = (p) => (
  <Ic {...p}>
    <path d="M7 16V4M7 4L4 7M7 4l3 3" />
    <path d="M17 8v12M17 20l-3-3M17 20l3-3" />
  </Ic>
);

export const ArrowLeftIcon = (p) => (
  <Ic {...p}>
    <path d="M19 12H5" />
    <path d="M12 5l-7 7 7 7" />
  </Ic>
);

/** MenuNavIcon — indented nav tree + pointer arrow + active dot markers */
export const MenuNavIcon = (p) => (
  <Ic {...p}>
    {/* Full top line */}
    <path d="M3 6h18" strokeLinecap="round" strokeWidth="1.8" />
    {/* Indented lines */}
    <path d="M7 12h12" strokeLinecap="round" />
    <path d="M7 18h8" strokeLinecap="round" />
    {/* Vertical indent connector */}
    <path d="M5 6v12" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
    {/* Bold forward arrow */}
    <path d="M20 15l2.5 2.5-2.5 2.5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    {/* Active dot markers */}
    <circle cx="5" cy="6" r="1.3" fill="currentColor" strokeWidth="0" />
    <circle cx="5" cy="12" r="1" fill="currentColor" strokeWidth="0" opacity="0.6" />
    <circle cx="5" cy="18" r="1" fill="currentColor" strokeWidth="0" opacity="0.6" />
  </Ic>
);

export const HomeIcon = (p) => (
  <Ic {...p}>
    <path d="M3 12L12 4l9 8" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" />
  </Ic>
);

export const MenuIcon = (p) => (
  <Ic {...p}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </Ic>
);

// ═══════════════════════════════════════════════════════════════
//  USER / AUTH
// ═══════════════════════════════════════════════════════════════

export const UserIcon = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
  </Ic>
);

export const KeyIcon = (p) => (
  <Ic {...p}>
    <circle cx="7.5" cy="14" r="4.5" />
    <path d="M10.5 11.2L20 4" />
    <path d="M17.5 6.5l1.8 1.8" />
    <path d="M15 8.5l1.5 1.5" />
  </Ic>
);

export const SparklesIcon = (p) => (
  <Ic {...p}>
    <path d="M12 3l2 6h6l-5 3.5 2 6L12 15l-5 3.5 2-6L4 9h6z" />
    <path d="M19.5 3.5v2.5M18.25 4.75h2.5" strokeWidth="1.3" />
    <path d="M4.5 18.5v2M3.5 19.5h2" strokeWidth="1.3" />
  </Ic>
);

export const BellIcon = (p) => (
  <Ic {...p}>
    <path d="M18 9.5A6 6 0 0 0 6 9.5c0 6.5-3 8.5-3 8.5h18s-3-2-3-8.5" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Ic>
);

// ═══════════════════════════════════════════════════════════════
//  ACTIONS / CRUD
// ═══════════════════════════════════════════════════════════════

export const PencilIcon = (p) => (
  <Ic {...p}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Ic>
);

export const Trash2Icon = (p) => (
  <Ic {...p}>
    <path d="M3 7h18M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 7l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </Ic>
);

export const EyeIcon = (p) => (
  <Ic {...p}>
    <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="13" cy="11" r="0.9" fill="currentColor" strokeWidth="0" opacity="0.5" />
  </Ic>
);

export const EyeOffIcon = (p) => (
  <Ic {...p}>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10.5 7 10.5 7a18.3 18.3 0 0 1-2.6 3.6" />
    <path d="M6.1 6.1A18.5 18.5 0 0 0 1.5 12S5.5 19 12 19c2 0 3.9-.6 5.5-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Ic>
);

export const Loader2Icon = ({ size = 16, className = '', strokeWidth = 2, ...p }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`animate-spin ${className}`}
    aria-hidden="true"
    {...p}
  >
    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
  </svg>
);

export const XIcon = (p) => (
  <Ic {...p}><path d="M18 6 6 18M6 6l12 12" /></Ic>
);

export const SearchIcon = (p) => (
  <Ic {...p}>
    <circle cx="10.5" cy="10.5" r="7" />
    <path d="M16 16 21 21" strokeWidth="2" strokeLinecap="round" />
  </Ic>
);

export const FilterIcon = (p) => (
  <Ic {...p}>
    <path d="M3 5h18M7 12h10M10.5 19h3" />
  </Ic>
);

export const RefreshCwIcon = (p) => (
  <Ic {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6 2.3L3 8" />
    <path d="M3 3v5h5" />
  </Ic>
);

export const CopyIcon = (p) => (
  <Ic {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Ic>
);

export const CheckIcon = (p) => (
  <Ic {...p} strokeWidth={2.2}><path d="M20 6 9 17l-5-5" /></Ic>
);

export const CheckCircle2Icon = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M7.5 12l3.5 3.5 5.5-6.5" />
  </Ic>
);

export const CheckCircleIcon = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l3 3 5-5" strokeWidth={1.9} />
  </Ic>
);

export const AlertCircleIcon = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12.5" strokeWidth="2" />
    <circle cx="12" cy="16.5" r="0.7" fill="currentColor" strokeWidth="0" />
  </Ic>
);

export const AlertTriangleIcon = (p) => (
  <Ic {...p}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13.5" strokeWidth="2" />
    <circle cx="12" cy="17.5" r="0.7" fill="currentColor" strokeWidth="0" />
  </Ic>
);

export const InfoIcon = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="8" r="0.7" fill="currentColor" strokeWidth="0" />
    <line x1="12" y1="11" x2="12" y2="17" strokeWidth="2" />
  </Ic>
);

export const XCircleIcon = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </Ic>
);

// ═══════════════════════════════════════════════════════════════
//  MEDIA / FILES
// ═══════════════════════════════════════════════════════════════

export const ImageIcon = (p) => (
  <Ic {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </Ic>
);

export const UploadIcon = (p) => (
  <Ic {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Ic>
);

export const DownloadIcon = (p) => (
  <Ic {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Ic>
);

export const ExternalLinkIcon = (p) => (
  <Ic {...p}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </Ic>
);

export const LinkIcon = (p) => (
  <Ic {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Ic>
);

export const FolderIcon = (p) => (
  <Ic {...p}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </Ic>
);

export const FolderOpenIcon = (p) => (
  <Ic {...p}>
    <path d="M5 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1" />
    <path d="M4.5 12h16l-2 7H6.5z" />
  </Ic>
);

export const FolderPlusIcon = (p) => (
  <Ic {...p}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </Ic>
);

export const FolderInputIcon = (p) => (
  <Ic {...p}>
    <path d="M2 9V7a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" />
    <path d="M12 13l3 3-3 3" />
    <line x1="7" y1="16" x2="15" y2="16" />
  </Ic>
);

export const FileSpreadsheetIcon = (p) => (
  <Ic {...p}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <path d="M8 13h8M8 17h8M12 13v4" strokeWidth="1.2" />
  </Ic>
);

// ═══════════════════════════════════════════════════════════════
//  LAYOUT / VIEW
// ═══════════════════════════════════════════════════════════════

export const LayoutGridIcon = (p) => (
  <Ic {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
  </Ic>
);

export const LayoutListIcon = (p) => (
  <Ic {...p}>
    <rect x="3" y="4" width="6" height="6" rx="1.2" />
    <rect x="3" y="14" width="6" height="6" rx="1.2" />
    <path d="M13 6h8M13 16h8M13 9h5M13 19h5" strokeWidth="1.2" />
  </Ic>
);

export const ToggleLeftIcon = (p) => (
  <Ic {...p}>
    <rect x="2" y="8" width="20" height="8" rx="4" />
    <circle cx="7" cy="12" r="3" fill="currentColor" strokeWidth="0" opacity="0.7" />
  </Ic>
);

export const ToggleRightIcon = (p) => (
  <Ic {...p}>
    <rect x="2" y="8" width="20" height="8" rx="4" />
    <circle cx="17" cy="12" r="3" fill="currentColor" strokeWidth="0" />
  </Ic>
);

// ═══════════════════════════════════════════════════════════════
//  MISC
// ═══════════════════════════════════════════════════════════════

export const GlobeIcon = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Ic>
);

export const TagIcon = (p) => (
  <Ic {...p}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" strokeLinecap="round" />
  </Ic>
);

export const ClockIcon = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Ic>
);

export const LayersIcon = (p) => (
  <Ic {...p}>
    <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" />
    <line x1="2" y1="14.5" x2="12" y2="21" />
    <line x1="22" y1="14.5" x2="12" y2="21" />
    <line x1="2" y1="11" x2="12" y2="17.5" />
    <line x1="22" y1="11" x2="12" y2="17.5" />
  </Ic>
);

export const GripVerticalIcon = (p) => (
  <Ic {...p}>
    <circle cx="9" cy="6" r="1.2" fill="currentColor" strokeWidth="0" />
    <circle cx="15" cy="6" r="1.2" fill="currentColor" strokeWidth="0" />
    <circle cx="9" cy="12" r="1.2" fill="currentColor" strokeWidth="0" />
    <circle cx="15" cy="12" r="1.2" fill="currentColor" strokeWidth="0" />
    <circle cx="9" cy="18" r="1.2" fill="currentColor" strokeWidth="0" />
    <circle cx="15" cy="18" r="1.2" fill="currentColor" strokeWidth="0" />
  </Ic>
);

// ═══════════════════════════════════════════════════════════════
//  BACKWARD-COMPATIBLE ALIASES (old Lucide names → custom icons)
//  So JSX using <Plus>, <Trash2>, etc. keeps working without
//  having to rename every single usage in the file.
// ═══════════════════════════════════════════════════════════════
export { PlusIcon        as Plus          };
export { PencilIcon      as Pencil        };
export { Trash2Icon      as Trash2        };
export { EyeIcon         as Eye           };
export { EyeOffIcon      as EyeOff        };
export { Loader2Icon     as Loader2       };
export { XIcon           as X             };
export { CheckIcon       as Check         };
export { CheckCircle2Icon as CheckCircle2 };
export { CheckCircleIcon as CheckCircle   };
export { AlertCircleIcon as AlertCircle   };
export { AlertTriangleIcon as AlertTriangle };
export { InfoIcon        as Info          };
export { XCircleIcon     as XCircle       };
export { SearchIcon      as Search        };
export { UploadIcon      as Upload        };
export { DownloadIcon    as Download      };
export { RefreshCwIcon   as RefreshCw     };
export { CopyIcon        as Copy          };
export { ArrowLeftIcon   as ArrowLeft     };
export { ArrowUpDownIcon as ArrowUpDown   };
export { ChevronRightIcon as ChevronRight };
export { ChevronDownIcon as ChevronDown  };
export { ChevronUpIcon   as ChevronUp    };
export { ChevronsUpDownIcon as ChevronsUpDown };
export { BellIcon        as Bell          };
export { UserIcon        as User          };
export { KeyIcon         as KeyRound      };
export { LogOutIcon      as LogOut        };
export { SparklesIcon    as Sparkles      };
export { SettingsIcon    as Settings      };
export { LayersIcon      as Layers        };
export { TagIcon         as Tag           };
export { GiftIcon        as Gift          };
export { GlobeIcon       as Globe         };
export { ClockIcon       as Clock         };
export { ImageIcon       as Image         };
export { LinkIcon        as Link          };
export { ExternalLinkIcon as ExternalLink };
export { FolderIcon      as Folder        };
export { FolderOpenIcon  as FolderOpen    };
export { FolderPlusIcon  as FolderPlus    };
export { FolderInputIcon as FolderInput   };
export { FileSpreadsheetIcon as FileSpreadsheet };
export { LayoutGridIcon  as LayoutGrid    };
export { LayoutListIcon  as LayoutList    };
export { ListIcon        as List          };
export { ToggleLeftIcon  as ToggleLeft    };
export { ToggleRightIcon as ToggleRight   };
export { MenuIcon        as Menu          };
export { HomeIcon        as Home          };
export { GripVerticalIcon as GripVertical };
export { CouponsIcon     as TicketPercent, CouponsIcon as TicketPercentIcon };
export { DiscountIcon    as Percent, DiscountIcon as PercentIcon       };
export { CategoriesIcon  as FolderTree, CategoriesIcon as FolderTreeIcon    };
export { DashboardIcon   as LayoutDashboard, DashboardIcon as LayoutDashboardIcon };
export { MediaIcon       as ImagePlay, MediaIcon as ImagePlayIcon     };
export { ProductsIcon    as ShoppingBag, ProductsIcon as ShoppingBagIcon   };
export { BrandsIcon      as Diamond, BrandsIcon as DiamondIcon       };

// ─── Save ─────────────────────────────────────────────────────────────────────
const SaveIcon = (p) => (
  <Ic {...p}>
    <path d="M15.2 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.8L15.2 3z" />
    <path d="M15 3v6H7V3" />
    <rect x="8" y="13" width="8" height="6" rx="0.5" />
  </Ic>
);
export { SaveIcon as Save };

// ─── Edit ──────────────────────────────────────────────────────────────────────────────────
const EditIcon = (p) => (
  <Ic {...p}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Ic>
);
export { EditIcon as Edit };

// ─── Pin ──────────────────────────────────────────────────────────────────────
const PinIcon = (p) => (
  <Ic {...p}>
    <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.6 2.8-1.5 3.8L16 17H8l1.5-7.2A5 5 0 0 1 8 6a4 4 0 0 1 4-4z" />
    <line x1="12" y1="17" x2="12" y2="22" />
  </Ic>
);
export { PinIcon as Pin };

// ─── Star ─────────────────────────────────────────────────────────────────────
const StarIcon = (p) => (
  <Ic {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Ic>
);
export { StarIcon as Star };

// ─── Dashboard Stats Icons ──────────────────────────────────────────────────────
const TrendingUpIcon = (p) => (
  <Ic {...p}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </Ic>
);
export { TrendingUpIcon, TrendingUpIcon as TrendingUp };

const TrendingDownIcon = (p) => (
  <Ic {...p}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </Ic>
);
export { TrendingDownIcon, TrendingDownIcon as TrendingDown };

const PackageIcon = (p) => (
  <Ic {...p}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </Ic>
);
export { PackageIcon, PackageIcon as Package };

const UsersIcon = (p) => (
  <Ic {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Ic>
);
export { UsersIcon, UsersIcon as Users };

const DollarSignIcon = (p) => (
  <Ic {...p}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Ic>
);
export { DollarSignIcon, DollarSignIcon as DollarSign };

const CalendarIcon = (p) => (
  <Ic {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Ic>
);
export { CalendarIcon, CalendarIcon as Calendar };

const ArrowUpRightIcon = (p) => (
  <Ic {...p}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </Ic>
);
export { ArrowUpRightIcon, ArrowUpRightIcon as ArrowUpRight };

const ZapIcon = (p) => (
  <Ic {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Ic>
);
export { ZapIcon, ZapIcon as Zap };

const FileTextIcon = (p) => (
  <Ic {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </Ic>
);
export { FileTextIcon, FileTextIcon as FileText };

// ═══════════════════════════════════════════════════════════════
//  HANDCRAFTED DETAILED DASHBOARD ICONS WITH ACCENTS & LAYERS
// ═══════════════════════════════════════════════════════════════

/** Product & Box 3D Layered Icon */
export const DashProductIcon = ({ size = 24, className = '', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...p}>
    <path d="M12 2.5L20 6.8V17.2L12 21.5L4 17.2V6.8L12 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 2.5V11.5M12 11.5L20 6.8M12 11.5L4 6.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M7.5 4.8L15.5 9.2" stroke="currentColor" strokeWidth="1.3" opacity="0.6" strokeDasharray="1.5 1.5" />
    <path d="M16 11.8L12 14L8 11.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" opacity="0.8" />
  </svg>
);

/** Category Tree Hierarchy Icon */
export const DashCategoryIcon = ({ size = 24, className = '', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...p}>
    <rect x="3" y="3.5" width="8" height="6" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
    <rect x="13" y="3.5" width="8" height="6" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
    <rect x="8" y="14.5" width="8" height="6" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7 9.5V11.5C7 12.6 7.9 13.5 9 13.5H12M17 9.5V11.5C17 12.6 16.1 13.5 15 13.5H12M12 13.5V14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="7" cy="6.5" r="1" fill="currentColor" />
    <circle cx="17" cy="6.5" r="1" fill="currentColor" />
    <circle cx="12" cy="17.5" r="1" fill="currentColor" />
  </svg>
);

/** Luxury Gem & Diamond Brand Icon */
export const DashBrandIcon = ({ size = 24, className = '', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...p}>
    <path d="M6 3.5H18L21.5 8.5L12 20.5L2.5 8.5L6 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M2.5 8.5H21.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M9 3.5L6.5 8.5L12 20.5L17.5 8.5L15 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M12 3.5V8.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.7" />
  </svg>
);

/** Editorial Article & Blog Icon */
export const DashBlogIcon = ({ size = 24, className = '', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...p}>
    <rect x="3.5" y="3" width="17" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7 7.5H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7 11.5H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M7 15.5H12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M16 14.5L18.5 17L16.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16.5" cy="11.5" r="1.2" fill="currentColor" />
  </svg>
);

/** Media Storage & Cloud Drive Icon */
export const DashMediaIcon = ({ size = 24, className = '', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...p}>
    <rect x="2.5" y="4" width="19" height="13.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="8" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 15L8 10.5L12.5 15L16 11.5L21 16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 20.5H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 17.5V20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** Multi-User & Customer Team Icon */
export const DashUserIcon = ({ size = 24, className = '', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...p}>
    <circle cx="9" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M2.5 19C2.5 15.4 5.4 12.5 9 12.5C12.6 12.5 15.5 15.4 15.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M15.5 5.5A3 3 0 0 1 15.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 19C18 16.5 19.5 14.5 21.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="7.5" r="1" fill="currentColor" />
  </svg>
);

/** Dynamic 3D Flash Sale Lightning Bolt Icon */
export const DashFlashIcon = ({ size = 24, className = '', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...p}>
    <path d="M13.5 2L3.5 13H12L10.5 22L20.5 11H12L13.5 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 6L8 11.5H12.5L11.5 17" stroke="currentColor" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
    <circle cx="18" cy="4" r="1" fill="currentColor" />
    <circle cx="6" cy="19" r="1" fill="currentColor" />
  </svg>
);

/** Coupon & Perforated Voucher Ticket Icon */
export const DashCouponIcon = ({ size = 24, className = '', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...p}>
    <path d="M3 8V6A2 2 0 0 1 5 4H19A2 2 0 0 1 21 6V8A2.5 2.5 0 0 0 21 13V18A2 2 0 0 1 19 20H5A2 2 0 0 1 3 18V13A2.5 2.5 0 0 0 3 8Z" stroke="currentColor" strokeWidth="1.8" />
    <line x1="9" y1="4.5" x2="9" y2="19.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
    <circle cx="14" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="17" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    <line x1="13.5" y1="15" x2="17.5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Gift Box with Ribbon Bow Icon */
export const DashGiftIcon = ({ size = 24, className = '', ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...p}>
    <rect x="3.5" y="10.5" width="17" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <rect x="2.5" y="7" width="19" height="3.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
    <line x1="12" y1="7" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7C10.2 4.5 6 3 6 5.8C6 8.5 10.5 7.5 12 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 7C13.8 4.5 18 3 18 5.8C18 8.5 13.5 7.5 12 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="1" fill="currentColor" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════
//  SPECIFIC CUSTOM SIDEBAR MENU SVG ICONS
//  Style: layered, accent dots, micro-detail, phá cách hiện đại
// ═══════════════════════════════════════════════════════════════

/** Quản lý Kho — warehouse building with depth layers */
export const WarehouseNavIcon = (p) => (
  <Ic {...p}>
    {/* Main roof */}
    <path d="M2 10.5L12 4l10 6.5" strokeWidth="1.8" strokeLinejoin="round" />
    {/* Building body */}
    <rect x="3.5" y="10.5" width="17" height="11" rx="1.5" />
    {/* Center door */}
    <rect x="9" y="15.5" width="6" height="6" rx="1" />
    {/* Left window */}
    <rect x="5" y="13" width="3" height="2.5" rx="0.5" fill="currentColor" strokeWidth="0" opacity="0.4" />
    {/* Right window */}
    <rect x="16" y="13" width="3" height="2.5" rx="0.5" fill="currentColor" strokeWidth="0" opacity="0.4" />
    {/* Roof ridge dot */}
    <circle cx="12" cy="4.5" r="0.8" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** Quản lý Đơn & Phiếu Kho — layered docs with checkmark accent */
export const StockDocNavIcon = (p) => (
  <Ic {...p}>
    {/* Back doc */}
    <rect x="6" y="3" width="13" height="16" rx="2" opacity="0.3" fill="currentColor" strokeWidth="0" />
    <rect x="6" y="3" width="13" height="16" rx="2" />
    {/* Front doc */}
    <rect x="3" y="5.5" width="13" height="16" rx="2" fill="currentColor" opacity="0.07" strokeWidth="0" />
    <rect x="3" y="5.5" width="13" height="16" rx="2" />
    {/* Lines */}
    <path d="M6.5 10h6M6.5 13h4" strokeWidth="1.3" strokeLinecap="round" />
    {/* Check badge */}
    <circle cx="14" cy="18.5" r="3.5" fill="currentColor" />
    <path d="M12.2 18.5l1.3 1.3 2.3-2.3" stroke="hsl(var(--sidebar-background,white))" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </Ic>
);

/** Nhà Cung Cấp — factory building with chimney stack */
export const SupplierNavIcon = (p) => (
  <Ic {...p}>
    {/* Ground */}
    <line x1="1.5" y1="21.5" x2="22.5" y2="21.5" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
    {/* Main building */}
    <rect x="3" y="10" width="13" height="11.5" rx="1.5" />
    {/* Roof trapezoid */}
    <path d="M2 10.5L8 5.5h8l4 5H2z" />
    {/* Right annex */}
    <rect x="16" y="13.5" width="5.5" height="8" rx="1" />
    {/* Chimney */}
    <rect x="14" y="3.5" width="2.5" height="6" rx="0.5" />
    {/* Smoke dot */}
    <circle cx="15.2" cy="2.5" r="0.7" fill="currentColor" strokeWidth="0" opacity="0.5" />
    {/* Windows */}
    <rect x="5.5" y="13" width="3" height="2.5" rx="0.4" fill="currentColor" strokeWidth="0" opacity="0.35" />
    <rect x="10" y="13" width="3" height="2.5" rx="0.4" fill="currentColor" strokeWidth="0" opacity="0.35" />
  </Ic>
);

/** Đơn Mua Hàng (PO) — clipboard with down-arrow receiving arrow */
export const PurchaseOrderNavIcon = (p) => (
  <Ic {...p}>
    {/* Clipboard board */}
    <rect x="3.5" y="5" width="17" height="17" rx="2.5" />
    {/* Clip top */}
    <rect x="9" y="2.5" width="6" height="4" rx="1.5" />
    {/* Down arrow - import/receiving */}
    <path d="M12 9.5v6" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 13.5l3 3 3-3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    {/* Side tick lines */}
    <path d="M7 9.5h2M7 16.5h2" strokeWidth="1.1" strokeLinecap="round" opacity="0.4" />
    {/* Accent dot */}
    <circle cx="18.5" cy="7" r="1.5" fill="currentColor" strokeWidth="0" opacity="0.5" />
  </Ic>
);

/** Trả Hàng Nhập — box with counter-clockwise return arrow */
export const PurchaseReturnNavIcon = (p) => (
  <Ic {...p}>
    {/* Box */}
    <rect x="3" y="8" width="13.5" height="13" rx="2" />
    {/* Box lid */}
    <path d="M3 11.5h13.5" strokeWidth="1.2" opacity="0.5" />
    {/* Return arc */}
    <path d="M19 5.5a5.5 5.5 0 0 1 2.5 4.5" strokeWidth="1.7" strokeLinecap="round" />
    {/* Arrow tip of return */}
    <path d="M17 3.5l2 2-2 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Accent: x inside box */}
    <path d="M7.5 14.5l3 3M10.5 14.5l-3 3" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
  </Ic>
);

/** Phiếu Xuất Kho — box with upward delivery arrow */
export const StockExportNavIcon = (p) => (
  <Ic {...p}>
    {/* Box base */}
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    {/* Equator fold */}
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeWidth="1.2" opacity="0.5" />
    <line x1="12" y1="22.08" x2="12" y2="12" strokeWidth="1.2" opacity="0.5" />
    {/* Up arrow */}
    <path d="M12 15v-5" strokeWidth="2" strokeLinecap="round" />
    <path d="M9.5 12.5l2.5-2.5 2.5 2.5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </Ic>
);

/** Kiểm Kê & Cân Bằng — balance scale with tick */
export const StockAuditNavIcon = (p) => (
  <Ic {...p}>
    {/* Center pole */}
    <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1.7" />
    {/* Horizontal beam */}
    <path d="M5 8h14" strokeWidth="1.7" />
    {/* Left pan */}
    <path d="M5 8L3 14a4 4 0 0 0 8 0L7 8" strokeLinecap="round" strokeLinejoin="round" />
    {/* Right pan */}
    <path d="M19 8l2 6a4 4 0 0 1-8 0l2-6" strokeLinecap="round" strokeLinejoin="round" />
    {/* Base */}
    <path d="M8.5 21h7" strokeWidth="1.8" strokeLinecap="round" />
    {/* Checkmark on right pan */}
    <path d="M15.5 11l1.2 1.2 2.1-2.1" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </Ic>
);

/** Chi Tiết & Sắp Hết Hàng — bell with warning exclamation */
export const StockAlertNavIcon = (p) => (
  <Ic {...p}>
    {/* Bell body */}
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    {/* Bell clapper */}
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    {/* Alert badge circle */}
    <circle cx="18.5" cy="4.5" r="4" fill="currentColor" />
    {/* Exclamation inside badge */}
    <line x1="18.5" y1="2.8" x2="18.5" y2="5.2" stroke="hsl(var(--sidebar-background,#1a1a2e))" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="18.5" cy="6.2" r="0.5" fill="hsl(var(--sidebar-background,#1a1a2e))" strokeWidth="0" />
  </Ic>
);

/** Báo Cáo Tồn Kho & NCC — bar chart with rising line overlay */
export const InventoryReportNavIcon = (p) => (
  <Ic {...p}>
    {/* Axis */}
    <path d="M3 3v18h18" strokeWidth="1.6" strokeLinecap="round" />
    {/* Bars */}
    <rect x="5.5" y="13" width="3.5" height="8" rx="1" fill="currentColor" opacity="0.25" strokeWidth="0" />
    <rect x="5.5" y="13" width="3.5" height="8" rx="1" />
    <rect x="10.5" y="9" width="3.5" height="12" rx="1" fill="currentColor" opacity="0.45" strokeWidth="0" />
    <rect x="10.5" y="9" width="3.5" height="12" rx="1" />
    <rect x="15.5" y="5" width="3.5" height="16" rx="1" fill="currentColor" opacity="0.7" strokeWidth="0" />
    <rect x="15.5" y="5" width="3.5" height="16" rx="1" />
    {/* Trend line overlay */}
    <path d="M7 12l5-4 5-3" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 1.5" opacity="0.7" />
    {/* Arrow tip */}
    <polyline points="15 4.5 17 5 16 7" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
  </Ic>
);

/** Nhật Ký Tồn Kho — clock with activity pulse */
export const StockHistoryNavIcon = (p) => (
  <Ic {...p}>
    {/* Clock circle */}
    <circle cx="12" cy="12" r="9.5" />
    {/* Clock hands */}
    <polyline points="12 6.5 12 12 16 14.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    {/* Activity pulse below clock */}
    <path d="M3.5 19.5h2.5l1.5-2 2 4 1.5-3 1 1.5H15" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
  </Ic>
);

/** Product List Sub-menu — grid card with sparkle */
export const ProductListNavIcon = (p) => (
  <Ic {...p}>
    {/* Card */}
    <rect x="3" y="3.5" width="18" height="17" rx="2.5" />
    {/* Image placeholder top */}
    <rect x="5" y="5.5" width="14" height="6" rx="1.2" fill="currentColor" opacity="0.15" strokeWidth="0" />
    <rect x="5" y="5.5" width="14" height="6" rx="1.2" strokeWidth="1.1" />
    {/* Text lines */}
    <path d="M5 14.5h10M5 17h6" strokeWidth="1.2" strokeLinecap="round" />
    {/* Sparkle badge */}
    <path d="M18 15l0.5 1.5 1.5 0.5-1.5 0.5-0.5 1.5-0.5-1.5-1.5-0.5 1.5-0.5z" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** Product New Sub-menu — plus badge on box */
export const ProductAddNavIcon = (p) => (
  <Ic {...p}>
    {/* Box */}
    <path d="M20 11V8a2 2 0 0 0-1-1.73l-6-3.46a2 2 0 0 0-2 0L5 6.27A2 2 0 0 0 4 8v8a2 2 0 0 0 1 1.73l6 3.46a2 2 0 0 0 2 0l2-1.15" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeWidth="1.1" opacity="0.4" />
    <line x1="12" y1="22.08" x2="12" y2="12" strokeWidth="1.1" opacity="0.4" />
    {/* Plus circle badge */}
    <circle cx="19" cy="19" r="4" fill="currentColor" strokeWidth="0" />
    <path d="M19 16.5v5M16.5 19h5" stroke="hsl(var(--sidebar-background,#fff))" strokeWidth="1.6" strokeLinecap="round" />
  </Ic>
);

/** Product Import / Export Sub-menu — two arrows with document */
export const ProductImportNavIcon = (p) => (
  <Ic {...p}>
    {/* Document */}
    <rect x="3" y="3" width="13" height="18" rx="2" />
    <path d="M7 8h6M7 11h4" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    {/* Up arrow export */}
    <path d="M14 7l4-4 4 4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="18" y1="3" x2="18" y2="13" strokeWidth="1.7" strokeLinecap="round" />
    {/* Down arrow import */}
    <path d="M14 17l4 4 4-4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="18" y1="21" x2="18" y2="11" strokeWidth="1.7" strokeLinecap="round" />
  </Ic>
);

/** Product Variants Sub-menu — stacked chips with color dots */
export const VariantsNavIcon = (p) => (
  <Ic {...p}>
    {/* Three layers */}
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 12l10 5 10-5" />
    <path d="M2 17l10 5 10-5" />
    {/* Color dot accents */}
    <circle cx="8" cy="12" r="0.9" fill="currentColor" strokeWidth="0" opacity="0.5" />
    <circle cx="12" cy="14" r="0.9" fill="currentColor" strokeWidth="0" opacity="0.5" />
    <circle cx="16" cy="12" r="0.9" fill="currentColor" strokeWidth="0" opacity="0.5" />
  </Ic>
);

/** Flash Sale Sub-menu — lightning bolt with speed lines */
export const FlashSaleNavIcon = (p) => (
  <Ic {...p}>
    {/* Glow fill */}
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" opacity="0.15" strokeWidth="0" />
    {/* Bolt stroke */}
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="1.8" strokeLinejoin="round" />
    {/* Speed lines */}
    <line x1="1" y1="10" x2="3" y2="10" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
    <line x1="1" y1="13" x2="2.5" y2="13" strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
    <line x1="1" y1="16" x2="3" y2="16" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
  </Ic>
);

/** Blog Posts Sub-menu — article with reading lines & bookmark */
export const BlogPostNavIcon = (p) => (
  <Ic {...p}>
    {/* Page */}
    <rect x="3.5" y="2" width="15" height="20" rx="2.5" />
    {/* Bookmark ribbon */}
    <path d="M16.5 2v7l-2.5-1.5-2.5 1.5V2" />
    {/* Text lines */}
    <path d="M7 11h8M7 14h6M7 17h8" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
  </Ic>
);

/** Blog Create Sub-menu — page with feather pen */
export const BlogCreateNavIcon = (p) => (
  <Ic {...p}>
    {/* Page */}
    <rect x="3.5" y="3" width="11" height="18" rx="2" />
    <path d="M6 8h6M6 11h4" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    {/* Pen */}
    <path d="M15.5 14.5l4-4a1.5 1.5 0 0 0-2.1-2.1l-4 4 0.5 3.6 1.6-1.5z" strokeWidth="1.4" strokeLinejoin="round" />
    {/* Ink dot */}
    <circle cx="20.3" cy="7.3" r="0.7" fill="currentColor" strokeWidth="0" />
    {/* Underline */}
    <path d="M14 21h7" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
  </Ic>
);

/** Blog Categories Sub-menu — open book with spine */
export const BlogCategoryNavIcon = (p) => (
  <Ic {...p}>
    {/* Left page */}
    <path d="M3 5C5 4.5 8.5 5 12 7V21C8.5 19.5 5 19 3 19.5V5z" />
    {/* Right page */}
    <path d="M21 5C19 4.5 15.5 5 12 7V21C15.5 19.5 19 19 21 19.5V5z" />
    {/* Spine */}
    <line x1="12" y1="7" x2="12" y2="21" strokeWidth="1.5" />
    {/* Reading lines left */}
    <path d="M5.5 9h4M5.5 12h4M5.5 15h3" strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
    {/* Reading lines right */}
    <path d="M14.5 9h4M14.5 12h3" strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
  </Ic>
);

/** Blog Tags Sub-menu — tag with hashtag inside */
export const BlogTagNavIcon = (p) => (
  <Ic {...p}>
    {/* Tag shape */}
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    {/* Dot */}
    <circle cx="7" cy="7" r="1.5" fill="currentColor" strokeWidth="0" />
    {/* Hash inside */}
    <path d="M11 8v6M14 8v6M9.5 10h6M9.5 12h6" strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
  </Ic>
);

/** Roles & Permissions Sub-menu — shield with key inside */
export const RolePermissionNavIcon = (p) => (
  <Ic {...p}>
    {/* Shield */}
    <path d="M12 2.5L4 6v5.5c0 4.8 3.4 9.2 8 10.5 4.6-1.3 8-5.7 8-10.5V6L12 2.5z" />
    {/* Key inside */}
    <circle cx="10.5" cy="11.5" r="2.5" />
    <path d="M12.5 13.5l4.5 4.5M15 16l1.5 1.5" strokeWidth="1.5" strokeLinecap="round" />
    {/* Notch on key */}
    <path d="M16.5 17.5l-1 1" strokeWidth="1.3" strokeLinecap="round" />
  </Ic>
);

/** MousePointer2 — click analytics */
export const MousePointer2 = (p) => (
  <Ic {...p}>
    <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
  </Ic>
);

/** CheckSquare — bulk select indicator */
export const CheckSquare = (p) => (
  <Ic {...p}>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Ic>
);

// ─── Security / Roles ─────────────────────────────────────────────────────────

/** Shield — role protection, layered rounded shield with inner stripe */
export const Shield = (p) => (
  <Ic {...p}>
    <path d="M12 2.5L4 6v5.5c0 4.8 3.4 9.2 8 10.5 4.6-1.3 8-5.7 8-10.5V6L12 2.5z" />
    <path d="M9 12l2 2 4-4" strokeWidth="1.5" />
  </Ic>
);

/** ShieldCheck — verified shield with animated-feel checkmark */
export const ShieldCheck = (p) => (
  <Ic {...p}>
    <path d="M12 2.5L4 6v5.5c0 4.8 3.4 9.2 8 10.5 4.6-1.3 8-5.7 8-10.5V6L12 2.5z" />
    <path d="M8.5 11.5l2.5 2.5 4.5-4.5" strokeWidth="1.7" />
  </Ic>
);

/** ShieldAlert — shield with exclamation, access denied */
export const ShieldAlert = (p) => (
  <Ic {...p}>
    <path d="M12 2.5L4 6v5.5c0 4.8 3.4 9.2 8 10.5 4.6-1.3 8-5.7 8-10.5V6L12 2.5z" />
    <line x1="12" y1="8.5" x2="12" y2="13" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="15.5" r="0.8" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** Lock — padlock with keyhole detail */
export const Lock = (p) => (
  <Ic {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2.5" />
    <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" strokeWidth="0" />
    <line x1="12" y1="17.5" x2="12" y2="19" strokeWidth="1.5" strokeLinecap="round" />
  </Ic>
);

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Edit3 — sharp angled pen with underline */
export const Edit3 = (p) => (
  <Ic {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Ic>
);

/** Edit2 — pencil edit, sleek diagonal */
export const Edit2 = (p) => (
  <Ic {...p}>
    <path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 3 22l1.5-4.5L17 3z" />
    <path d="M15 5l4 4" strokeWidth="1.2" opacity="0.5" />
  </Ic>
);

/** Square — empty square for unselected state */
export const Square = (p) => (
  <Ic {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
  </Ic>
);

// ─── Buildings / Locations ────────────────────────────────────────────────────

/** Building2 — office building with windows grid */
export const Building2 = (p) => (
  <Ic {...p}>
    <path d="M2 22h20" strokeWidth="1.4" />
    <rect x="4" y="3" width="10" height="19" rx="1.5" />
    <path d="M14 8h4a1 1 0 0 1 1 1v13" />
    <rect x="7" y="6" width="2" height="2.5" rx="0.5" />
    <rect x="11" y="6" width="2" height="2.5" rx="0.5" />
    <rect x="7" y="11" width="2" height="2.5" rx="0.5" />
    <rect x="11" y="11" width="2" height="2.5" rx="0.5" />
    <rect x="7" y="16" width="5" height="6" rx="0.5" />
    <rect x="17" y="11" width="1.5" height="2" rx="0.3" />
  </Ic>
);

/** MapPin — location pin with dot */
export const MapPin = (p) => (
  <Ic {...p}>
    <path d="M12 2C8.7 2 6 4.7 6 8c0 4.5 6 13 6 13s6-8.5 6-13c0-3.3-2.7-6-6-6z" />
    <circle cx="12" cy="8" r="2" />
  </Ic>
);

// ─── Communication ────────────────────────────────────────────────────────────

/** Mail — envelope with clean fold lines */
export const Mail = (p) => (
  <Ic {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2.5" />
    <path d="M2 6.5l9.3 6.8a1.2 1.2 0 0 0 1.4 0L22 6.5" />
  </Ic>
);

/** Phone — handset with signal arc */
export const Phone = (p) => (
  <Ic {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </Ic>
);

/** PhoneCall — phone with signal waves */
export const PhoneCall = (p) => (
  <Ic {...p}>
    <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94" strokeWidth="1.5" />
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </Ic>
);

/** MessageSquare — chat bubble with tail */
export const MessageSquare = (p) => (
  <Ic {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 9.5h8M8 13h5" strokeWidth="1.2" opacity="0.6" />
  </Ic>
);

/** Send — paper plane, sharp diagonal */
export const Send = (p) => (
  <Ic {...p}>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22l-4-9-9-4 20-7z" />
  </Ic>
);

// ─── Navigation / Direction ─────────────────────────────────────────────────

/** ArrowRight — bold right arrow */
export const ArrowRight = (p) => (
  <Ic {...p}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </Ic>
);

/** ArrowDownLeft — diagonal down-left */
export const ArrowDownLeft = (p) => (
  <Ic {...p}>
    <line x1="17" y1="7" x2="7" y2="17" />
    <polyline points="17 17 7 17 7 7" />
  </Ic>
);

/** ArrowUp — upward arrow */
export const ArrowUp = (p) => (
  <Ic {...p}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </Ic>
);

/** ArrowDown — downward arrow */
export const ArrowDown = (p) => (
  <Ic {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </Ic>
);

// ─── Inventory / Packages ─────────────────────────────────────────────────────

/** PackageCheck — box with checkmark overlay */
export const PackageCheck = (p) => (
  <Ic {...p}>
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
    <path d="M9 12.5l2 2 4-4" strokeWidth="1.7" />
  </Ic>
);

/** Boxes — stacked boxes, warehouse feel */
export const Boxes = (p) => (
  <Ic {...p}>
    <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42zM7 16.5v-5.5" strokeWidth="1.4" />
    <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8A2 2 0 0 0 22 17.87v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3z" strokeWidth="1.4" />
    <path d="M7 2.1L2 5l5 2.9 5-2.9-5-2.9zM2 5v5.5M12 8v5.5M17 2.1L12 5l5 2.9 5-2.9-5-2.9zM12 5v5.5M22 5v5.5" strokeWidth="1.4" />
  </Ic>
);

/** Truck — delivery vehicle with wheels */
export const Truck = (p) => (
  <Ic {...p}>
    <rect x="1" y="3" width="15" height="13" rx="1.5" />
    <path d="M16 8h4l3 5v4h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </Ic>
);

/** FileCheck — document with check */
export const FileCheck = (p) => (
  <Ic {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 13.5l2 2 4-4" strokeWidth="1.6" />
  </Ic>
);

/** ClipboardList — clipboard with bulleted list */
export const ClipboardList = (p) => (
  <Ic {...p}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="9" y="2" width="6" height="4" rx="1.5" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="9" y1="15" x2="13" y2="15" />
    <circle cx="8" cy="11" r="0.8" fill="currentColor" strokeWidth="0" />
    <circle cx="8" cy="15" r="0.8" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** ClipboardCheck — clipboard with checkmark */
export const ClipboardCheck = (p) => (
  <Ic {...p}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="9" y="2" width="6" height="4" rx="1.5" />
    <path d="M9 12.5l2 2 4-4" strokeWidth="1.6" />
  </Ic>
);

/** RotateCcw — counter-clockwise rotate arrow */
export const RotateCcw = (p) => (
  <Ic {...p}>
    <path d="M3 2v6h6" />
    <path d="M3 8C5.3 4.5 9.4 2.5 14 3.2a9 9 0 1 1-9.7 9" />
  </Ic>
);

/** History — clock with counter arrow */
export const History = (p) => (
  <Ic {...p}>
    <path d="M3 3v6h6" />
    <path d="M3.51 9a9 9 0 1 0 .49-3" />
    <polyline points="12 7 12 12 15.5 14" />
  </Ic>
);

/** Scale — balance scale with pan detail */
export const Scale = (p) => (
  <Ic {...p}>
    <path d="M16.5 9.5L12 2.5 7.5 9.5" />
    <path d="M5.5 14a3 3 0 0 0 6 0L5.5 9.5 2 14" />
    <path d="M16 14a3 3 0 0 0 6 0L16 9.5 12.5 14" />
    <line x1="12" y1="2.5" x2="12" y2="21" />
    <line x1="7" y1="21" x2="17" y2="21" />
  </Ic>
);

/** ShoppingCart — cart with item dot */
export const ShoppingCart = (p) => (
  <Ic {...p}>
    <circle cx="9" cy="21" r="1.5" />
    <circle cx="20" cy="21" r="1.5" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </Ic>
);


/** CalendarX — calendar with X mark */
export const CalendarX = (p) => (
  <Ic {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2.5" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M9.5 15.5l5 5M14.5 15.5l-5 5" strokeWidth="1.5" />
  </Ic>
);

// ─── Analytics ────────────────────────────────────────────────────────────────

/** Activity — heartbeat / activity line */
export const Activity = (p) => (
  <Ic {...p}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Ic>
);

/** BarChart3 — bar chart with varying heights */
export const BarChart3 = (p) => (
  <Ic {...p}>
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="6" width="4" height="15" rx="1" />
    <rect x="17" y="9" width="4" height="12" rx="1" />
    <line x1="1" y1="21.5" x2="23" y2="21.5" strokeWidth="1.2" />
  </Ic>
);


/** PieChart — pie chart with slice cut */
export const PieChart = (p) => (
  <Ic {...p}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </Ic>
);

/** Filter — funnel filter icon */
export const Filter = (p) => (
  <Ic {...p}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Ic>
);

/** HelpCircle — circle with question mark */
export const HelpCircle = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" />
    <circle cx="12" cy="17" r="0.8" fill="currentColor" strokeWidth="0" />
  </Ic>
);

// ─── Finance ──────────────────────────────────────────────────────────────────


/** CreditCard — payment card with chip stripe */
export const CreditCard = (p) => (
  <Ic {...p}>
    <rect x="1" y="4" width="22" height="16" rx="2.5" />
    <line x1="1" y1="10" x2="23" y2="10" strokeWidth="2.5" />
    <rect x="4" y="14" width="5" height="2.5" rx="0.5" fill="currentColor" strokeWidth="0" opacity="0.5" />
  </Ic>
);

/** Wallet — wallet with card slot */
export const Wallet = (p) => (
  <Ic {...p}>
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75M16 14h.01" strokeLinecap="round" />
    <circle cx="17" cy="14" r="1.5" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** QrCode — QR code placeholder grid */
export const QrCode = (p) => (
  <Ic {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="5" y="5" width="3" height="3" fill="currentColor" strokeWidth="0" />
    <rect x="16" y="5" width="3" height="3" fill="currentColor" strokeWidth="0" />
    <rect x="5" y="16" width="3" height="3" fill="currentColor" strokeWidth="0" />
    <path d="M14 14h3v3h-3zM17 17h4M17 20v-3" strokeWidth="1.4" />
  </Ic>
);

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Printer — printer with paper */
export const Printer = (p) => (
  <Ic {...p}>
    <path d="M6 9V2h12v7" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" rx="1" />
    <circle cx="18" cy="11.5" r="0.8" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** Maximize2 — expand arrows to corners */
export const Maximize2 = (p) => (
  <Ic {...p}>
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </Ic>
);

/** Minimize2 — collapse arrows from corners */
export const Minimize2 = (p) => (
  <Ic {...p}>
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="10" y1="14" x2="3" y2="21" />
    <line x1="21" y1="3" x2="14" y2="10" />
  </Ic>
);

/** ZoomIn — magnifying glass with plus */
export const ZoomIn = (p) => (
  <Ic {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </Ic>
);

/** ZoomOut — magnifying glass with minus */
export const ZoomOut = (p) => (
  <Ic {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </Ic>
);

/** ArrowDownRight — diagonal down-right */
export const ArrowDownRight = (p) => (
  <Ic {...p}>
    <line x1="7" y1="7" x2="17" y2="17" />
    <polyline points="17 7 17 17 7 17" />
  </Ic>
);

/** HardDrive — storage disk icon */
export const HardDrive = (p) => (
  <Ic {...p}>
    <line x1="22" y1="12" x2="2" y2="12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    <line x1="6" y1="16" x2="6.01" y2="16" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="10" y1="16" x2="10.01" y2="16" strokeWidth="2.5" strokeLinecap="round" />
  </Ic>
);

/** ImageOff — image with slash/cross */
export const ImageOff = (p) => (
  <Ic {...p}>
    <line x1="2" y1="2" x2="22" y2="22" />
    <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
    <line x1="13.5" y1="6.5" x2="13.5" y2="6.51" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18 12l-4.5 4.5" />
    <path d="M3 3a1 1 0 0 0-1 1v14a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1" />
    <path d="M21 21V5a2 2 0 0 0-2-2H5" />
  </Ic>
);

/** ColumnsIcon — table column layout icon */
export const ColumnsIcon = (p) => (
  <Ic {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.6" />
    <path d="M9 3v18" strokeWidth="1.5" />
    <path d="M15 3v18" strokeWidth="1.5" />
  </Ic>
);

/** RotateCcwIcon — reset / undo circle arrow */
export const RotateCcwIcon = (p) => (
  <Ic {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Ic>
);
