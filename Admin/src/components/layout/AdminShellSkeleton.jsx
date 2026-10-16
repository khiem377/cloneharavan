/**
 * AdminShellSkeleton
 * Khung xương cấu trúc toàn trang (App Shell Skeleton) mô phỏng chính xác tỷ lệ 1:1
 * của bảng điều khiển Admin, loại bỏ hiện tượng giật nhảy layout (Zero CLS) khi nạp trang.
 */
export default function AdminShellSkeleton() {
  return (
    <div className="min-h-[100dvh] w-full bg-background flex text-foreground">
      {/* 1. Left Sidebar Skeleton */}
      <aside className="hidden md:flex w-64 flex-col shrink-0 border-r border-border bg-card p-4 space-y-6 select-none">
        {/* Logo / Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="size-8 rounded-[6px] bg-muted/70 animate-pulse shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-28 rounded-[4px] bg-muted/70 animate-pulse" />
            <div className="h-2.5 w-16 rounded-[4px] bg-muted/50 animate-pulse" />
          </div>
        </div>

        {/* Navigation Group 1 */}
        <div className="space-y-2">
          <div className="h-2.5 w-20 rounded-[4px] bg-muted/40 animate-pulse px-2 mb-3" />
          <div className="h-9 w-full rounded-[6px] bg-muted/70 animate-pulse" />
          <div className="h-9 w-full rounded-[6px] bg-muted/50 animate-pulse" />
          <div className="h-9 w-full rounded-[6px] bg-muted/50 animate-pulse" />
          <div className="h-9 w-full rounded-[6px] bg-muted/50 animate-pulse" />
        </div>

        {/* Navigation Group 2 */}
        <div className="space-y-2 pt-2">
          <div className="h-2.5 w-24 rounded-[4px] bg-muted/40 animate-pulse px-2 mb-3" />
          <div className="h-9 w-full rounded-[6px] bg-muted/50 animate-pulse" />
          <div className="h-9 w-full rounded-[6px] bg-muted/50 animate-pulse" />
          <div className="h-9 w-full rounded-[6px] bg-muted/50 animate-pulse" />
        </div>

        {/* Bottom User Profile Skeleton */}
        <div className="mt-auto pt-4 border-t border-border flex items-center gap-3 px-2">
          <div className="size-8 rounded-full bg-muted/70 animate-pulse shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-20 rounded-[4px] bg-muted/70 animate-pulse" />
            <div className="h-2.5 w-28 rounded-[4px] bg-muted/50 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* 2. Main Content & Header Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Skeleton */}
        <header className="h-12 border-b border-border bg-background px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-[6px] bg-muted/60 animate-pulse md:hidden" />
            <div className="h-4 w-36 rounded-[4px] bg-muted/60 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-[6px] bg-muted/60 animate-pulse" />
            <div className="size-7 rounded-[6px] bg-muted/60 animate-pulse" />
          </div>
        </header>

        {/* Page Content Skeleton */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Page Title & Description */}
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-[4px] bg-muted/70 animate-pulse" />
            <div className="h-3.5 w-80 rounded-[4px] bg-muted/50 animate-pulse" />
          </div>

          {/* Main Card Skeleton */}
          <div className="rounded-[6px] border border-border bg-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="h-4 w-32 rounded-[4px] bg-muted/70 animate-pulse" />
              <div className="h-8 w-24 rounded-[6px] bg-muted/60 animate-pulse" />
            </div>

            {/* Simulated Content Rows */}
            <div className="space-y-3.5 pt-2">
              <div className="h-10 w-full rounded-[6px] bg-muted/40 animate-pulse" />
              <div className="h-10 w-full rounded-[6px] bg-muted/30 animate-pulse" />
              <div className="h-10 w-full rounded-[6px] bg-muted/40 animate-pulse" />
              <div className="h-10 w-full rounded-[6px] bg-muted/30 animate-pulse" />
              <div className="h-10 w-full rounded-[6px] bg-muted/40 animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
