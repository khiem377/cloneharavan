/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║         CUSTOM SVG ICON LIBRARY — EGA Admin               ║
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

/** Dashboard — asymmetric 4-panel mosaic grid */
export const DashboardIcon = (p) => (
  <Ic {...p}>
    <rect x="3" y="3" width="8" height="11" rx="1.8" />
    <rect x="13" y="3" width="8" height="4.5" rx="1.8" />
    <rect x="3" y="16" width="8" height="5" rx="1.8" />
    <rect x="13" y="9.5" width="8" height="11.5" rx="1.8" />
    <path d="M6 7.5h2M6 9.5h4" strokeWidth="1.1" opacity="0.5" />
  </Ic>
);

/** Media library — photo frame with mountain horizon & sun */
export const MediaIcon = (p) => (
  <Ic {...p}>
    <rect x="2" y="4" width="20" height="14.5" rx="2.5" />
    <circle cx="7.8" cy="9.2" r="1.9" />
    <path d="M2.5 14 7.5 9l4.5 4.5 3.5-3L21 16.5" />
    <path d="M8 19.5v2.5M16 19.5v2.5" />
    <path d="M6 22h12" strokeWidth="1.3" />
  </Ic>
);

/** Banners — wide display with play/image indicator */
export const BannersIcon = (p) => (
  <Ic {...p}>
    <rect x="2" y="5" width="20" height="13" rx="2" />
    <line x1="2.5" y1="10.5" x2="21.5" y2="10.5" />
    <path d="M5.5 7.5h5M5.5 9h3" strokeWidth="1.1" />
    <path d="M15.5 13l4-1.8-4-1.8z" fill="currentColor" strokeWidth="0" />
    <path d="M12 18v3M7.5 21h9" strokeWidth="1.3" />
  </Ic>
);

/** Products — shopping bag with subtle checkmark detail */
export const ProductsIcon = (p) => (
  <Ic {...p}>
    <path d="M8.5 8V6.5A3.5 3.5 0 0 1 12 3v0a3.5 3.5 0 0 1 3.5 3.5V8" />
    <path d="M3.5 8h17l-1.8 13H5.3L3.5 8z" />
    <path d="M9.5 14.5l1.8 1.8 3.7-3.7" strokeWidth="1.5" />
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

/** Categories — hierarchical folder tree */
export const CategoriesIcon = (p) => (
  <Ic {...p}>
    <path d="M3 6h5.5l1.5 1.5H20a1 1 0 0 1 1 1v1.5H3z" />
    <path d="M5 10v9" />
    <path d="M5 14.5h5M5 19h5" />
    <rect x="10" y="12.5" width="6" height="3.5" rx="1" />
    <rect x="10" y="17" width="6" height="3.5" rx="1" />
  </Ic>
);

/** Brands — gem / diamond with inner facets */
export const BrandsIcon = (p) => (
  <Ic {...p}>
    <path d="M5 9.5 8.5 4h7L19 9.5l-7 9.5z" />
    <path d="M5 9.5h14" />
    <path d="M8.5 9.5 12 19M15.5 9.5 12 19" strokeWidth="1" opacity="0.6" />
    <path d="M8.5 4 12 9.5 15.5 4" strokeWidth="1" opacity="0.6" />
  </Ic>
);

/** Coupons — ticket with perforated divider and % symbol */
export const CouponsIcon = (p) => (
  <Ic {...p}>
    <path d="M3 8.8V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.8a2.2 2.2 0 0 0 0 4.4V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.8a2.2 2.2 0 0 0 0-4.4z" />
    <line x1="9" y1="5" x2="9" y2="17" strokeDasharray="1.8 1.5" strokeWidth="1.2" />
    <circle cx="13" cy="10" r="1.1" />
    <circle cx="17" cy="14" r="1.1" />
    <path d="M12 14.5 18 9.5" strokeWidth="1.4" />
  </Ic>
);

/** Discounts — price tag with percent badge */
export const DiscountIcon = (p) => (
  <Ic {...p}>
    <path d="M3 3h6.5l9.3 9.3a2 2 0 0 1 0 2.8l-4.7 4.7a2 2 0 0 1-2.8 0L2 10.5V3z" />
    <circle cx="7" cy="7" r="1.4" fill="currentColor" strokeWidth="0" />
    <path d="M9.5 15.5l5-5" strokeWidth="1.4" />
    <circle cx="10.2" cy="16" r="0.9" fill="currentColor" strokeWidth="0" />
    <circle cx="14.8" cy="11" r="0.9" fill="currentColor" strokeWidth="0" />
  </Ic>
);

/** Gift programs — gift box with decorative ribbon bow */
export const GiftIcon = (p) => (
  <Ic {...p}>
    <rect x="3" y="10.5" width="18" height="10.5" rx="1.5" />
    <rect x="2" y="7.5" width="20" height="3" rx="1" />
    <line x1="12" y1="7.5" x2="12" y2="21" />
    <path d="M12 7.5C10 5.5 6 4 6 6.5S10 8 12 7.5z" />
    <path d="M12 7.5C14 5.5 18 4 18 6.5S14 8 12 7.5z" />
  </Ic>
);

/** Settings — precision gear with inner ring */
export const SettingsIcon = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.64 5.64l1.42 1.42M16.95 16.95l1.41 1.41M5.64 18.37l1.41-1.42M16.95 7.07l1.42-1.43" />
  </Ic>
);

/** Logout — door with right-exit arrow */
export const LogOutIcon = (p) => (
  <Ic {...p}>
    <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" />
    <path d="M16 17l5-5-5-5" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Ic>
);

// ═══════════════════════════════════════════════════════════════
//  NAVIGATION HELPERS
// ═══════════════════════════════════════════════════════════════

export const ChevronRightIcon = (p) => (
  <Ic {...p}><path d="M9 6l6 6-6 6" /></Ic>
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

/** MenuNavIcon — hamburger with nested hierarchy lines */
export const MenuNavIcon = (p) => (
  <Ic {...p}>
    <path d="M3 6h18" />
    <path d="M3 12h14" />
    <path d="M3 18h10" />
    <path d="M18 15l3 3-3 3" strokeWidth="1.4" />
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



