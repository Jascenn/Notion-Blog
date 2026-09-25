import type { Metadata } from 'next';
import VersionCompareBar from '@/components/preview/VersionCompareBar';

export const metadata: Metadata = {
  title: '首页版本对比',
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VersionCompareBar />
      {children}
    </>
  );
}
