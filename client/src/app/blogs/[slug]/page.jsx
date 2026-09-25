import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import blogService from '../../../services/blog.service';
import BlogSubNav from '../../../components/blog/BlogSubNav';
import BlogDetailHeader from '../../../components/blog/BlogDetailHeader';
import BlogTableOfContents from '../../../components/blog/BlogTableOfContents';
import BlogDetailContent from '../../../components/blog/BlogDetailContent';
import BlogRelatedPosts from '../../../components/blog/BlogRelatedPosts';
import BlogSidebar from '../../../components/blog/BlogSidebar';
import BlogViewTracker from '../../../components/blog/BlogViewTracker';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug || slug === 'news') return { title: 'Tin tức công nghệ & Đánh giá | SHOP' };

  const post = await blogService.getServerBlogPostBySlug(slug);
  if (!post) {
    return {
      title: 'Tin tức | SHOP',
    };
  }

  const title = post.metaTitle || post.title || 'Tin tức | SHOP';
  const description = post.metaDescription || post.excerpt || '';
  const image = post.thumbnailUrl || '';

  return {
    title: `${title} | SHOP`,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) notFound();

  // If slug is 'news', redirect to the main blog page
  if (slug === 'news') {
    redirect('/blogs');
  }

  // 1. Fetch post detail & common resources
  const [post, categories, tags, trendingResult] = await Promise.all([
    blogService.getServerBlogPostBySlug(slug),
    blogService.getServerBlogCategories(),
    blogService.getServerBlogTags(),
    blogService.getServerBlogPosts({ sort: 'views', limit: 5 }),
  ]);

  // If not a post, check if it matches a category slug and redirect
  if (!post) {
    const matchedCategory = (categories || []).find((c) => c.slug === slug);
    if (matchedCategory) {
      redirect(`/blogs?category=${slug}`);
    }
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-white">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Không tìm thấy bài viết
        </h2>
        <p className="text-sm text-slate-500 mb-6 max-w-md">
          Bài viết bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác.
        </p>
        <Link href="/blogs">
          <Button className="flex items-center gap-2 bg-[#284ea1] hover:bg-[#1e3b82] text-white rounded-xl shadow-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang tin tức</span>
          </Button>
        </Link>
      </div>
    );
  }

  // 2. Fetch related posts
  let relatedPosts = post.relatedPostIds || [];
  if (!relatedPosts || relatedPosts.length === 0) {
    const primaryCatId = post.categories?.[0]?._id;
    if (primaryCatId) {
      const fallbackRelated = await blogService.getServerBlogPosts({
        categoryId: primaryCatId,
        limit: 4,
      });
      relatedPosts = (fallbackRelated?.data || []).filter((p) => p.slug !== post.slug);
    }
  }

  const trendingPosts = trendingResult?.data || [];
  const primaryCategorySlug = post.categories?.[0]?.slug || '';

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen">
      {/* Category sub-navigation bar */}
      <BlogSubNav categories={categories} />

      {/* View tracking trigger (runs once on client mount) */}
      <BlogViewTracker slug={post.slug} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Article Content (8 cols on desktop) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-7 shadow-2xs">
            {/* Header / Meta */}
            <BlogDetailHeader post={post} />

            {/* Table of contents */}
            {post.tableOfContents && post.tableOfContents.length > 0 && (
              <BlogTableOfContents items={post.tableOfContents} />
            )}

            {/* Post Rich Content */}
            <BlogDetailContent content={post.content} tags={post.tags || []} />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <BlogRelatedPosts posts={relatedPosts} />
            )}
          </div>

          {/* Sidebar (4 cols on desktop) */}
          <div className="lg:col-span-4 sticky top-28">
            <BlogSidebar
              trendingPosts={trendingPosts}
              categories={categories}
              tags={tags}
              currentCategory={primaryCategorySlug}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
