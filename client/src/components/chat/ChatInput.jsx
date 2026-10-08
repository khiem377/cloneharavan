'use client';

import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatInput({
  input,
  setInput,
  loading,
  onSendMessage,
  textareaRef,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-2.5 sm:p-3 shrink-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSendMessage();
        }}
        className="flex items-end gap-2"
      >
        <div className="flex-1 relative rounded-[6px] border border-slate-300 focus-within:border-[#284ea1] bg-slate-50 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về sản phẩm, giá bán, khuyến mãi..."
            className="w-full text-xs sm:text-[13px] bg-transparent text-slate-800 placeholder:text-slate-400 p-2.5 outline-hidden resize-none max-h-24 leading-normal"
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full bg-[#284ea1] hover:bg-[#1e3b82] text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-2xs p-0"
          title="Gửi tin nhắn"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4 -ml-0.5" />
          )}
        </Button>
      </form>
      <div className="mt-1 text-center">
        <span className="text-[10px] text-slate-400">
          Chuyên viên tư vấn SHOP luôn sẵn sàng phục vụ anh/chị
        </span>
      </div>
    </div>
  );
}
