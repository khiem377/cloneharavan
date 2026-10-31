import React from 'react';
import { Search, HelpCircle } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import ThemeToggle from '@/components/ui/ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import { Button } from '@/components/ui/button';

export default function Topbar({
  title,
  onOpenCommandPalette,
  onStartTour,
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 select-none">
      {/* Left: Sidebar trigger & Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <SidebarTrigger className="-ml-1 size-8 rounded-[6px] border border-border bg-card hover:bg-accent text-foreground flex items-center justify-center transition-colors active:scale-[0.98]" />
        <Separator orientation="vertical" className="h-4" />
        <Breadcrumb>
          <BreadcrumbList className="text-xs font-medium">
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Quản trị
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
                {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center: Command Palette Trigger Button (Ctrl + K) */}
      <button
        type="button"
        data-tour="command-palette"
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-3 px-3.5 h-8.5 w-64 lg:w-80 rounded-[6px] border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer select-none active:scale-[0.99]"
        title="Tìm kiếm nhanh (Ctrl + K)"
      >
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left truncate">Tìm nhanh mọi thứ...</span>
        <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] border border-border bg-background font-mono text-[10px] text-muted-foreground font-semibold">
          Ctrl K
        </kbd>
      </button>

      {/* Right: Help ?, Theme Toggle, Notifications */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Search Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onOpenCommandPalette}
          className="md:hidden size-8 rounded-[6px]"
          title="Tìm kiếm (Ctrl + K)"
        >
          <Search size={14} />
        </Button>

        {/* Mascot Tour Guide Trigger Button: sleek '?' icon */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onStartTour}
          className="size-8 rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-[0.98]"
          title="Hướng dẫn sử dụng hệ thống (?)"
          aria-label="Hướng dẫn sử dụng"
        >
          <HelpCircle size={15} />
        </Button>

        {/* Dark/Light Mode Theme Toggle */}
        <div data-tour="theme-toggle">
          <ThemeToggle />
        </div>

        {/* Real-time Notifications Bell */}
        <div data-tour="notifications">
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
