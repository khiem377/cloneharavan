'use client';

import React, { useState } from 'react';
import { BlogCard } from './BlogCard';
import { BlogFilterBar } from './BlogFilterBar';
import { BlogPaginationWrapper } from './BlogPaginationWrapper';


export const BlogListSection = ({
  posts = [],
  pagination = { page: 1, totalPages: 1, total: 0 },
}) => {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="w-full">
      <BlogFilterBar
        total={pagination.total || 0}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {posts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-gray-200 p-8 shadow-2xs">
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Không tìm thấy bài viết nào
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
            Hiện chưa có bài viết nào phù hợp với danh mục hoặc từ khóa bạn đang tìm. Vui lòng thử lại với từ khóa khác.
          </p>
          <a
            href="/blogs"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#284ea1] text-white text-xs font-semibold hover:bg-[#1f3d80] transition shadow-2xs"
          >
            Xem tất cả bài viết
          </a>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'
                : 'space-y-3.5'
            }
          >
            {posts.map((post) => (
              <BlogCard
                key={post._id || post.slug}
                post={post}
                viewMode={viewMode}
              />
            ))}
          </div>

          <BlogPaginationWrapper
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
          />
        </>
      )}
    </div>
  );
};

export default BlogListSection;
