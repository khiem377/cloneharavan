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
import CommentContentRenderer from './CommentContentRenderer';

/**
 * CommentRichEditor — Bộ soạn thảo bình luận & phản hồi chuẩn Markdown kèm toolbar, Mention Pill và tab Xem trước
 * 
 * Hỗ trợ:
 * - Toolbar định dạng: Đậm, Nghiêng, Trích dẫn, Danh sách, Code, Block Code, Ảnh, Link, Gạch ngang
 * - Tab Xem trước (Live Preview): xem trực quan định dạng trước khi gửi
 * - Mention Pill badge: @Tên_người_được_trả_lời
 * - Phím tắt: Ctrl + Enter / Cmd + Enter để gửi nhanh
 */
export default function CommentRichEditor({
  value = '',
  onChange,
  onSubmit,
  onCancel,
  replyTo = null, // { name: 'Admin 1', _id?: string }
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

  // Helper chèn cú pháp Markdown quanh vùng chọn
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

  // Xử lý phím tắt: Ctrl + Enter để gửi, Ctrl + B in đậm, Ctrl + I in nghiêng
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
    {
      id: 'bold',
      label: 'In đậm (Ctrl+B)',
      icon: <Bold size={14} strokeWidth={2.5} />,
      action: () => insertFormat('**', '**', 'văn bản đậm'),
    },
    {
      id: 'italic',
      label: 'In nghiêng (Ctrl+I)',
      icon: <Italic size={14} strokeWidth={2.5} />,
      action: () => insertFormat('*', '*', 'văn bản nghiêng'),
    },
    {
      id: 'quote',
      label: 'Trích dẫn',
      icon: <Quote size={14} strokeWidth={2.5} />,
      action: () => insertFormat('> ', '', 'trích dẫn'),
    },
    {
      id: 'ul',
      label: 'Danh sách',
      icon: <List size={14} strokeWidth={2.5} />,
      action: () => insertFormat('- ', '', 'mục danh sách'),
    },
    {
      id: 'ol',
      label: 'Danh sách số',
      icon: <ListOrdered size={14} strokeWidth={2.5} />,
      action: () => insertFormat('1. ', '', 'mục danh sách'),
    },
    {
      id: 'code',
      label: 'Code nội dòng',
      icon: <Code size={14} strokeWidth={2.5} />,
      action: () => insertFormat('`', '`', 'code'),
    },
    {
      id: 'codeblock',
      label: 'Khối Code',
      icon: <SquareCode size={14} strokeWidth={2.5} />,
      action: () => insertFormat('```\n', '\n```', 'đoạn code'),
    },
    {
      id: 'image',
      label: 'Chèn ảnh',
      icon: <ImageIcon size={14} strokeWidth={2.5} />,
      action: () => insertFormat('![', '](https://url-anh)', 'mô tả ảnh'),
    },
    {
      id: 'link',
      label: 'Chèn liên kết',
      icon: <LinkIcon size={14} strokeWidth={2.5} />,
      action: () => insertFormat('[', '](https://url)', 'tiêu đề liên kết'),
    },
    {
      id: 'strikethrough',
      label: 'Gạch ngang',
      icon: <Strikethrough size={14} strokeWidth={2.5} />,
      action: () => insertFormat('~~', '~~', 'văn bản gạch ngang'),
    },
  ];

  return (
    <div
      className={`rounded-[6px] border border-slate-200 bg-white shadow-xs focus-within:border-[#284ea1] focus-within:ring-1 focus-within:ring-[#284ea1]/30 transition-all ${className}`}
    >
      {/* ── 1. Top Formatting Toolbar & Preview Switcher ──────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-1 px-3 py-1.5 border-b border-slate-100 bg-slate-50/70 rounded-t-[6px] select-none">
        {/* Nhóm nút format Markdown */}
        <div className="flex items-center flex-wrap gap-0.5">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.id}
              type="button"
              title={btn.label}
              aria-label={btn.label}
              onClick={btn.action}
              disabled={isPreview}
              className={`p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 active:scale-95 rounded-[4px] transition-all cursor-pointer ${
                isPreview ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        {/* Tab chuyển đổi Soạn thảo / Xem trước */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-[4px] text-[11px] font-medium ml-auto">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-2 py-0.5 rounded-[3px] transition-colors flex items-center gap-1 cursor-pointer ${
              !isPreview
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 size={11} />
            <span>Soạn thảo</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-2 py-0.5 rounded-[3px] transition-colors flex items-center gap-1 cursor-pointer ${
              isPreview
                ? 'bg-white text-blue-600 font-bold shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye size={11} />
            <span>Xem trước</span>
          </button>
        </div>
      </div>

      {/* ── 2. Editor Body (Mention Badge + Textarea / Preview) ─────────────── */}
      <div className="p-3 flex flex-col gap-2">
        {/* Mention Badge nếu đang ở chế độ Trả lời (chuẩn Image 2) */}
        {replyTo && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 shadow-xs select-none">
              <span>@{typeof replyTo === 'string' ? replyTo : replyTo.name || 'Người dùng'}</span>
              {onRemoveReplyTo && (
                <button
                  type="button"
                  onClick={onRemoveReplyTo}
                  className="hover:bg-blue-200/60 rounded-full p-0.5 transition-colors cursor-pointer"
                  title="Bỏ tag người này"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          </div>
        )}

        {/* Chế độ Xem trước hoặc Textarea */}
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
            className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent border-0 outline-hidden resize-y min-h-[64px] leading-relaxed font-normal"
          />
        )}
      </div>

      {/* ── 3. Bottom Footer (Gợi ý phím tắt & Nút gửi) ───────────────────── */}
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
              className="h-8 text-xs font-semibold px-3 text-slate-600 hover:text-slate-900 rounded-[6px] border-slate-200 cursor-pointer active:scale-95"
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
            className="h-8 text-xs font-semibold px-4 bg-[#284ea1] hover:bg-[#1e3c7d] text-white rounded-[6px] shadow-xs cursor-pointer active:scale-[0.98] transition-all flex items-center gap-1.5"
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
