import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PasskeyIcon from '@/components/ui/PasskeyIcon';
import { cn } from '@/lib/utils';

/**
 * Reusable Passkey login button for Admin authentication screens
 * @param {Object} props
 * @param {boolean} [props.isLoading=false] - Loading spinner state
 * @param {() => void} props.onClick - Click handler to trigger passkey ceremony
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.className] - Additional classes
 */
export default function PasskeyLoginButton({
  isLoading = false,
  onClick,
  disabled = false,
  className = '',
}) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        'h-10 w-full rounded-[6px] border-border text-xs font-semibold text-foreground hover:bg-accent transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <PasskeyIcon size={18} variant="duotone" />
      )}
      <span>Đăng nhập bằng Passkey</span>
    </Button>
  );
}
