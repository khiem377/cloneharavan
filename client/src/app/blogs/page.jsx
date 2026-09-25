import React from 'react';
import blogService from '../../services/blog.service';
import BlogSubNav from '../../components/blog/BlogSubNav';
import BlogHeroFeatured from '../../components/blog/BlogHeroFeatured';
import BlogListSection from '../../components/blog/BlogListSection';
import BlogSidebar from '../../components/blog/BlogSidebar';

export const metadata = {
  title: 'Tin tức công nghệ, đánh giá thiết bị & thủ thuật mới nhất | SHOP',
  description:
    'Cập nhật tin tức công nghệ, đánh giá laptop, PC linh kiện, thủ thuật phần mềm và các chương trình khuyến mãi hấp dẫn nhất.',
};

export default async function BlogPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams?.page, 10) || 1;
  const keyword = resolvedParams?.keyword || resolvedParams?.q || resolvedParams?.search || '';
  const categorySlug = resolvedParams?.category || '';
  const tagSlug = resolvedParams?.tag || '';
  const sort = resolvedParams?.sort || 'newest';

  // 1. Fetch categories & tags
  const [categories, tags, trendingResult] = await Promise.all([
    blogService.getServerBlogCategories(),
    blogService.getServerBlogTags(),
    blogService.getServerBlogPosts({ sort: 'views', limit: 5 }),
  ]);

  // Find category ID if slug provided
  let categoryId = undefined;
  if (categorySlug) {
    const matchedCategory = categories.find((c) => c.slug === categorySlug);
    if (matchedCategory) {
      categoryId = matchedCategory._id;
    }
  }

  // 2. Fetch posts with filters
  const postsResult = await blogService.getServerBlogPosts({
    page,
    limit: 10,
    keyword: keyword || undefined,
    categoryId,
    tag: tagSlug || undefined,
    sort,
  });

  const posts = postsResult?.data || [];
  const pagination = postsResult?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const trendingPosts = trendingResult?.data || [];

  // 3. Featured posts for hero on page 1 without active filters
  let featuredPosts = [];
  const isFirstPageDefault = page === 1 && !keyword && !categorySlug && !tagSlug;
  if (isFirstPageDefault) {
    const featuredResult = await blogService.getServerBlogPosts({
      isFeatured: true,
      limit: 5,
    });
    featuredPosts = (featuredResult?.data && featuredResult.data.length > 0)
      ? featuredResult.data
      : posts.slice(0, 5);
  }

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen">
      {/* Category SubNav Bar */}
      <BlogSubNav categories={categories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Featured Section (Page 1) */}
        {isFirstPageDefault && featuredPosts.length > 0 && (
          <BlogHeroFeatured posts={featuredPosts} />
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Post Feed (65-70% width) */}
          <div className="lg:col-span-8">
            <BlogListSection posts={posts} pagination={pagination} />
          </div>

          {/* Sticky Sidebar (30-35% width) */}
          <div className="lg:col-span-4 sticky top-28">
            <BlogSidebar
              trendingPosts={trendingPosts}
              categories={categories}
              tags={tags}
              currentCategory={categorySlug}
              currentTag={tagSlug}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
