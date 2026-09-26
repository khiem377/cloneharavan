'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Tag as TagIcon } from 'lucide-react';

const injectHeadingIds = (html) => {
  if (!html) return '';
  return html.replace(/<h([23])(.*?)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
    if (attrs.includes('id=')) return match;
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const id = cleanText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
  });
};

export const BlogDetailContent = ({ content = '', tags = [] }) => {
  const processedContent = useMemo(() => injectHeadingIds(content), [content]);

  return (
    <div className="w-full">
      {/* Blog HTML Content */}
      <article
        className="blog-prose text-slate-800 text-sm sm:text-base leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm font-bold text-slate-900">
            <TagIcon className="w-4 h-4 text-emerald-600" />
            <span>Từ khóa liên quan:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag._id || tag.slug}
                href={`/blogs?tag=${tag.slug}`}
              >
                <Badge
                  variant="outline"
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 border-gray-200 text-xs px-2.5 py-1 transition-colors cursor-pointer"
                >
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Content styling via styled scoped CSS */}
      <style jsx global>{`
        .blog-prose h2 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.35rem;
          border-bottom: 1px solid #f1f5f9;
          scroll-margin-top: 100px;
        }
        .blog-prose h3 {
          font-size: 1.15rem;
          font-weight: 600;
          color: #1e293b;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          scroll-margin-top: 100px;
        }
        .blog-prose p {
          margin-bottom: 1rem;
          line-height: 1.8;
          color: #334155;
        }
        .blog-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.25rem auto;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
          display: block;
        }
        .blog-prose blockquote {
          border-left: 4px solid #284ea1;
          padding-left: 1rem;
          font-style: italic;
          color: #475569;
          margin: 1.25rem 0;
          background: #f8fafc;
          padding: 0.75rem 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .blog-prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
          color: #334155;
        }
        .blog-prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
          color: #334155;
        }
        .blog-prose li {
          margin-bottom: 0.35rem;
          line-height: 1.7;
        }
        .blog-prose a {
          color: #284ea1;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .blog-prose a:hover {
          color: #1e3b82;
        }
        .blog-prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.25rem 0;
          font-size: 0.875rem;
        }
        .blog-prose th,
        .blog-prose td {
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .blog-prose th {
          background-color: #f1f5f9;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default BlogDetailContent;
