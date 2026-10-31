import React from 'react';

export function GenerateConfirmDialog({ existingCount, newCount, onReplace, onAppend, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-sm flex-col rounded-[6px] border border-border bg-background p-5 shadow-sm text-foreground gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-1">Đã có {existingCount} biến thể</h3>
          <p className="text-sm text-muted-foreground">
            Sản phẩm này đã có {existingCount} biến thể. Bạn muốn làm gì với {newCount} biến thể được tạo mới?
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="h-9 rounded-[6px] bg-destructive text-destructive-foreground text-sm font-medium cursor-pointer hover:bg-destructive/90 active:scale-[0.98] transition-all"
            onClick={onReplace}
          >
            Xóa {existingCount} cái cũ → Tạo {newCount} biến thể mới
          </button>
          <button
            type="button"
            className="h-9 rounded-[6px] bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all shadow-xs"
            onClick={onAppend}
          >
            Giữ cũ + Thêm {newCount} biến thể mới
          </button>
          <button
            type="button"
            className="h-9 rounded-[6px] border border-border text-sm text-muted-foreground hover:bg-accent hover:text-foreground active:scale-[0.98] cursor-pointer transition-all"
            onClick={onCancel}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-sm flex-col rounded-[6px] border border-border bg-background p-5 shadow-sm text-foreground gap-4">
        <h3 className="text-sm font-semibold">Xác nhận xóa</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="h-8 px-4 rounded-[6px] border border-border text-sm text-muted-foreground hover:bg-accent active:scale-[0.98] cursor-pointer transition-all"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            type="button"
            className="h-8 px-4 rounded-[6px] bg-destructive text-destructive-foreground text-sm font-medium cursor-pointer hover:bg-destructive/90 active:scale-[0.98] transition-all"
            onClick={onConfirm}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
