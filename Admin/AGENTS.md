# AGENTS.md

Project-specific guidance for AI coding agents.

<!-- ASTRYX:START -->
Astryx v0.4.3 · 156 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else Tailwind utilities backed by tokens (bg-surface, text-primary, rounded-lg) via tailwind-theme.css. No raw hex/px.
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any style={{…}}, raw <div>/<span> layout, imported .css/@apply, or hardcoded/arbitrary value (e.g. bg-[#fff], p-[13px]) with the component or a token-backed utility. If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   156 components by category
  template --list    page + block recipes
  docs <topic>       color, elevation, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling, theme, tokens, typography
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->

## UI Design Rules (Bản sắc riêng biệt - Tránh AI Generic)
- **KHÔNG Gradient**: Không dùng dải chuyển màu sặc sỡ. Dùng solid colors.
- **KHÔNG Glassmorphism**: Không dùng `backdrop-blur`, nền bán trong suốt, viền mờ giả kính.
- **KHÔNG Card lồng Card**: Dense data dùng Table hoặc List phẳng, phân tách bằng đường kẻ viền.
- **KHÔNG Shadow khắp nơi**: Tránh lạm dụng bóng đổ. Ưu tiên viền border phẳng sắc nét. Chỉ dùng shadow-xs/shadow-sm khi cần thiết.
- **Bo góc cố định 6px**: Dùng `rounded-[6px]`.
- **Một hệ Spacing đồng nhất**: Bội số 4px (4, 8, 12, 16, 20, 24, 32px).

