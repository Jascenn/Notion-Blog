import OriginalHomepage from '@/app/page';

export const revalidate = 60;

export default async function OriginalPreviewPage() {
  return <OriginalHomepage />;
}
