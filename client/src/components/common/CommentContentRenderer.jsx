'use client';

import React from 'react';

/**
 * CommentContentRenderer — Render nội dung bình luận hỗ trợ Markdown cơ bản và Mention pill tag
 */
export default function CommentContentRenderer({ content = '', className = '' }) {
  if (!content) return null;

  // Split by line to handle block quotes and list items
  const lines = content.split('\n');

  const renderLine = (line, lineIdx) => {
    // 1. Blockquote (> ...)
    if (line.startsWith('> ')) {
      return (
        <blockquote
          key={lineIdx}
          className="border-l-2 border-[#284ea1] pl-2.5 my-1 text-slate-600 italic text-xs sm:text-sm bg-blue-50/30 py-0.5 rounded-r-[4px]"
        >
          {renderInlineElements(line.slice(2))}
        </blockquote>
      );
    }

    // 2. Unordered List (- ...)
    if (line.startsWith('- ')) {
      return (
        <li key={lineIdx} className="ml-4 list-disc text-xs sm:text-sm text-slate-800 my-0.5">
          {renderInlineElements(line.slice(2))}
        </li>
      );
    }

    // 3. Ordered List (1. ...)
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      return (
        <li key={lineIdx} className="ml-4 list-decimal text-xs sm:text-sm text-slate-800 my-0.5">
          {renderInlineElements(olMatch[2])}
        </li>
      );
    }

    // 4. Code block (```)
    if (line.startsWith('```')) {
      return null; // Handled generally or as plain text line
    }

    // Regular line
    return (
      <p key={lineIdx} className="text-xs sm:text-sm text-slate-800 leading-relaxed my-0.5 min-h-[1.2em]">
        {renderInlineElements(line)}
      </p>
    );
  };

  return <div className={`flex flex-col gap-0.5 ${className}`}>{lines.map(renderLine)}</div>;
}

/**
 * Helper render các thành phần nội dòng (Mentions, Bold, Italic, Strikethrough, Code, Links, Images)
 */
function renderInlineElements(text) {
  if (!text) return null;

  // Regex nhận diện các mẫu:
  // - Image: !\[(.*?)\]\((.*?)\)
  // - Link: \[(.*?)\]\((.*?)\)
  // - Mention: @([\w\d_À-ỹ\s]+?)(?=[.,!?;:]|\s|$)
  // - Bold: \*\*(.*?)\*\*
  // - Italic: \*(.*?)\*
  // - Strikethrough: ~~(.*?)~~
  // - Code: `(.*?)`

  // Tokenize string with combined regex
  const pattern = /(!\[(.*?)\]\((.*?)\)|\[(.*?)\]\((.*?)\)|@([\w\d_À-ỹ\s]+?)(?=[.,!?;:]|\s|$)|`([^`]+)`|\*\*(.*?)\*\*|\*(.*?)\*|~~(.*?)~~)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Push raw text preceding match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];

    // Image ![alt](url)
    if (fullMatch.startsWith('![')) {
      const alt = match[2];
      const url = match[3];
      parts.push(
        <img
          key={match.index}
          src={url}
          alt={alt || 'Hình ảnh'}
          className="rounded-[6px] border border-slate-200 max-h-56 max-w-full object-cover my-1 inline-block"
          loading="lazy"
        />
      );
    }
    // Link [text](url)
    else if (fullMatch.startsWith('[')) {
      const linkText = match[4];
      const linkUrl = match[5];
      parts.push(
        <a
          key={match.index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline font-medium break-all"
        >
          {linkText || linkUrl}
        </a>
      );
    }
    // Mention @Name
    else if (fullMatch.startsWith('@')) {
      const name = match[6];
      parts.push(
        <span
          key={match.index}
          className="inline-flex items-center px-1.5 py-0.2 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs mr-1 select-none"
        >
          @{name}
        </span>
      );
    }
    // Inline Code `code`
    else if (fullMatch.startsWith('`')) {
      const code = match[7];
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-800 mx-0.5"
        >
          {code}
        </code>
      );
    }
    // Bold **text**
    else if (fullMatch.startsWith('**')) {
      const boldText = match[8];
      parts.push(
        <strong key={match.index} className="font-bold text-slate-900">
          {boldText}
        </strong>
      );
    }
    // Italic *text*
    else if (fullMatch.startsWith('*')) {
      const italicText = match[9];
      parts.push(
        <em key={match.index} className="italic text-slate-700">
          {italicText}
        </em>
      );
    }
    // Strikethrough ~~text~~
    else if (fullMatch.startsWith('~~')) {
      const delText = match[10];
      parts.push(
        <del key={match.index} className="line-through text-slate-400">
          {delText}
        </del>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
