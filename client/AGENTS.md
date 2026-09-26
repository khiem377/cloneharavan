<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI Design Rules (Bản sắc riêng biệt - Tránh AI Generic)
- **KHÔNG Gradient**: Không dùng dải chuyển màu sặc sỡ. Dùng solid colors.
- **KHÔNG Glassmorphism**: Không dùng `backdrop-blur`, nền bán trong suốt, viền mờ giả kính.
- **KHÔNG Card lồng Card**: Tránh cấu trúc hộp lồng trong hộp. Dùng đường kẻ phân tách (`border-b`, `divide-y`), Table hoặc List phẳng.
- **KHÔNG Shadow khắp nơi**: Không lạm dụng bóng đổ (`shadow-md`, `shadow-xl`...). Ưu tiên viền border phẳng sắc nét (`border border-slate-200`). Chỉ dùng shadow-xs/shadow-sm khi cần thiết.
- **Bo góc cố định 6px**: Dùng `rounded-[6px]`.
- **Một hệ Spacing đồng nhất**: Bội số 4px (`gap-1` 4px, `gap-2` 8px, `gap-3` 12px, `gap-4` 16px, `gap-5` 20px, `gap-6` 24px, `gap-8` 32px).

