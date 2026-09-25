import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import HomepageVariant, { DEMO_VARIANTS, type DemoVariant } from '@/components/demo/HomepageVariants';
import { getPostsOnly } from '@/lib/notion';

export const metadata: Metadata = {
  title: '首页 Demo',
  robots: { index: false, follow: false },
};

export const revalidate = 60;

export function generateStaticParams() {
  return DEMO_VARIANTS.map((variant) => ({ variant: variant.id }));
}

export default async function DemoVariantPage({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  if (!DEMO_VARIANTS.some((item) => item.id === variant)) notFound();

  const posts = await getPostsOnly();
  return <HomepageVariant variant={variant as DemoVariant} posts={posts} />;
}
