import OriginalHomepage from '@/app/page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OriginalPreviewPage() {
  return <OriginalHomepage />;
}
