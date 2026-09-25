'use client';

import React from 'react';
import { BlogCard } from './BlogCard';

export const BlogRelatedPosts = ({ posts = [] }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="w-full mt-10 pt-8 border-t border-gray-200">
      <div className="mb-5">
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight uppercase">
          Bài viết liên quan
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {posts.slice(0, 3).map((post) => (
          <BlogCard key={post._id || post.slug} post={post} viewMode="grid" />
        ))}
      </div>
    </section>
  );
};

export default BlogRelatedPosts;
