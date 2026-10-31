import React, { Suspense } from 'react';
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

  const [categoriesRaw, tagsRaw, trendingResult] = await Promise.all([
    blogService.getServerBlogCategories().catch(() => []),
    blogService.getServerBlogTags().catch(() => []),
    blogService.getServerBlogPosts({ sort: 'views', limit: 5 }).catch(() => ({ data: [] })),
  ]);

  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : (categoriesRaw?.data || []);
  const tags = Array.isArray(tagsRaw) ? tagsRaw : (tagsRaw?.data || []);

  let categoryId = undefined;
  if (categorySlug && Array.isArray(categories)) {
    const matchedCategory = categories.find((c) => c?.slug === categorySlug);
    if (matchedCategory) {
      categoryId = matchedCategory._id;
    }
  }

  let tagId = undefined;
  if (tagSlug && Array.isArray(tags)) {
    const matchedTag = tags.find((t) => t?.slug === tagSlug);
    if (matchedTag) {
      tagId = matchedTag._id;
    }
  }

  const postsResult = await blogService.getServerBlogPosts({
    page,
    limit: 10,
    keyword: keyword || undefined,
    categoryId,
    tag: tagId || tagSlug || undefined,
    sort,
  }).catch(() => ({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }));

  const posts = postsResult?.data || [];
  const pagination = postsResult?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const trendingPosts = trendingResult?.data || [];

  let featuredPosts = [];
  const isFirstPageDefault = page === 1 && !keyword && !categorySlug && !tagSlug;
  if (isFirstPageDefault) {
    const featuredResult = await blogService.getServerBlogPosts({
      isFeatured: true,
      limit: 5,
    }).catch(() => null);
    featuredPosts = (featuredResult?.data && featuredResult.data.length > 0)
      ? featuredResult.data
      : posts.slice(0, 5);
  }

  return (
    <div className="w-full bg-[#f8fafc] min-h-[100dvh]">
      <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200" />}>
        <BlogSubNav categories={categories} />
      </Suspense>

      <main className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-8 py-6 sm:py-8">
        {isFirstPageDefault && featuredPosts.length > 0 && (
          <BlogHeroFeatured posts={featuredPosts} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="h-40 bg-white rounded-[6px] border border-slate-200" />}>
              <BlogListSection posts={posts} pagination={pagination} />
            </Suspense>
          </div>

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

