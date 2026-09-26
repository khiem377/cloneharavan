import React from 'react';
import BlogDetailPage, { generateMetadata as baseGenerateMetadata } from '../page';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  return baseGenerateMetadata({ params: { slug: resolvedParams?.articleSlug } });
}

export default async function NestedBlogDetailPage({ params }) {
  const resolvedParams = await params;
  return <BlogDetailPage params={{ slug: resolvedParams?.articleSlug }} />;
}
