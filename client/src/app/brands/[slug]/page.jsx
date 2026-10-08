import { redirect } from 'next/navigation';

export default async function BrandSlugRedirect({ params }) {
  const { slug } = await params;
  redirect(`/search?brand=${encodeURIComponent(slug || '')}`);
}
