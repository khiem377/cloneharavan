'use client';

import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Quote,
  List,
  ListOrdered,
  Code,
  SquareCode,
  Image as ImageIcon,
  Link as LinkIcon,
  Strikethrough,
  X,
  Send,
  Eye,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CommentContentRenderer from './CommentContentRenderer';

export default function CommentRichEditor({
  value = '',
  onChange,
  onSubmit,
  onCancel,
  replyTo = null,
  onRemoveReplyTo,
  placeholder = 'Viết bình luận của bạn...',
  submitting = false,
  submitLabel = 'BÌNH LUẬN',
  autoFocus = false,
  minRows = 3,
  className = '',
}) {
  const textareaRef = useRef(null);
  const [isPreview, setIsPreview] = useState(false);

  const insertFormat = (prefix, suffix = '', defaultText = '') => {
    if (isPreview) setIsPreview(false);

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value || '';
    const selectedText = currentText.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const nextValue = currentText.substring(0, start) + replacement + currentText.substring(end);

    onChange?.(nextValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorStart = start + prefix.length;
      const newCursorEnd = newCursorStart + selectedText.length;
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!submitting && value.trim()) {
        onSubmit?.();
      }
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      insertFormat('**', '**', 'văn bản đậm');
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault();
      insertFormat('*', '*', 'văn bản nghiêng');
    }
  };

  const toolbarButtons = [
    { id: 'bold', label: 'In đậm (Ctrl+B)', icon: <Bold size={13} strokeWidth={2.5} />, action: () => insertFormat('**', '**', 'văn bản đậm') },
    { id: 'italic', label: 'In nghiêng (Ctrl+I)', icon: <Italic size={13} strokeWidth={2.5} />, action: () => insertFormat('*', '*', 'văn bản nghiêng') },
    { id: 'quote', label: 'Trích dẫn', icon: <Quote size={13} strokeWidth={2.5} />, action: () => insertFormat('> ', '', 'trích dẫn') },
    { id: 'ul', label: 'Danh sách', icon: <List size={13} strokeWidth={2.5} />, action: () => insertFormat('- ', '', 'mục danh sách') },
    { id: 'ol', label: 'Danh sách số', icon: <ListOrdered size={13} strokeWidth={2.5} />, action: () => insertFormat('1. ', '', 'mục danh sách') },
    { id: 'code', label: 'Code', icon: <Code size={13} strokeWidth={2.5} />, action: () => insertFormat('`', '`', 'code') },
    { id: 'codeblock', label: 'Khối Code', icon: <SquareCode size={13} strokeWidth={2.5} />, action: () => insertFormat('```\n', '\n```', 'đoạn code') },
    { id: 'image', label: 'Ảnh', icon: <ImageIcon size={13} strokeWidth={2.5} />, action: () => insertFormat('![', '](https://url-anh)', 'mô tả ảnh') },
    { id: 'link', label: 'Link', icon: <LinkIcon size={13} strokeWidth={2.5} />, action: () => insertFormat('[', '](https://url)', 'tiêu đề liên kết') },
    { id: 'strikethrough', label: 'Gạch ngang', icon: <Strikethrough size={13} strokeWidth={2.5} />, action: () => insertFormat('~~', '~~', 'văn bản gạch ngang') },
  ];

  return (
    <div className={`rounded-[6px] border border-slate-200 bg-white shadow-xs focus-within:border-[#284ea1] transition-all ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-1 px-2.5 py-1.5 border-b border-slate-100 bg-slate-50/70 rounded-t-[6px] select-none">
        <div className="flex items-center flex-wrap gap-0.5">
          {toolbarButtons.map((btn) => (
            <Button
              key={btn.id}
              type="button"
              variant="ghost"
              size="icon"
              aria-label={btn.label}
              onClick={btn.action}
              disabled={isPreview}
              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-[4px]"
            >
              {btn.icon}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-[4px] text-[11px] font-medium ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(false)}
            className={`h-6 px-2 text-[11px] rounded-[3px] flex items-center gap-1 ${
              !isPreview ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 size={11} />
            <span>Soạn thảo</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(true)}
            className={`h-6 px-2 text-[11px] rounded-[3px] flex items-center gap-1 ${
              isPreview ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye size={11} />
            <span>Xem trước</span>
          </Button>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {replyTo && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border-blue-200">
              <span>@{typeof replyTo === 'string' ? replyTo : replyTo.name || 'Người dùng'}</span>
              {onRemoveReplyTo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onRemoveReplyTo}
                  className="h-4 w-4 p-0 hover:bg-blue-200/60 rounded-full"
                  aria-label="Bỏ tag người này"
                >
                  <X size={11} />
                </Button>
              )}
            </Badge>
          </div>
        )}

        {isPreview ? (
          <div className="w-full min-h-[64px] p-2 bg-slate-50/50 rounded-[4px] border border-dashed border-slate-200 text-xs sm:text-sm">
            {value.trim() ? (
              <CommentContentRenderer content={value} />
            ) : (
              <span className="text-slate-400 italic">Chưa có nội dung để xem trước...</span>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            autoFocus={autoFocus}
            rows={minRows}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent border-0 outline-hidden resize-y min-h-[64px] leading-relaxed font-normal p-0"
          />
        )}
      </div>

      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-slate-50/40 rounded-b-[6px]">
        <span className="text-[11px] text-slate-400 hidden sm:inline select-none">
          Nhấn <kbd className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">Enter</kbd> để gửi
        </span>

        <div className="flex items-center gap-2 ml-auto">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-8 text-xs font-semibold px-3 text-slate-600 hover:text-slate-900 rounded-[6px] border-slate-200 active:scale-95"
            >
              HỦY
            </Button>
          )}

          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={submitting || !value.trim()}
            onClick={onSubmit}
            className="h-8 text-xs font-semibold px-4 bg-[#284ea1] hover:bg-[#1e3c7d] text-white rounded-[6px] shadow-xs active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            {submitting ? (
              <span>ĐANG GỬI...</span>
            ) : (
              <>
                <span>{submitLabel}</span>
                <Send size={12} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
