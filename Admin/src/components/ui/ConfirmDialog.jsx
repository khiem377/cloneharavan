import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ConfirmDialog({
  title = 'Xác nhận',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  variant = 'danger',
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              variant === 'danger'
                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2 text-sm text-muted-foreground">
          {message}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
