import Link from 'next/link';
import type { Metadata } from 'next';
import { DEMO_VARIANTS } from '@/components/demo/HomepageVariants';
import styles from './demo.module.css';

export const metadata: Metadata = {
  title: '首页 Demo 方案选择',
  description: 'lingyi.bio 首页本地设计方案对比。',
  robots: { index: false, follow: false },
};

export default function DemoGallery() {
  return (
    <div className={styles.gallery}>
      <header className={styles.galleryHeader}>
        <span>LOCAL DESIGN REVIEW</span>
        <h1>选择一个更像你的首页。</h1>
        <p>四个方案均保留原来的主题颜色与 LingYi Logo；D 是根据本轮反馈合成的推荐方向。</p>
      </header>

      <div className={styles.galleryGrid}>
        {DEMO_VARIANTS.map((variant) => (
          <Link key={variant.id} href={`/demo/${variant.id}`} className={styles.galleryCard}>
            <div className={`${styles.galleryPreview} ${styles[`preview_${variant.id}`]}`} aria-hidden="true">
              <span className={styles.previewLogo}>LingYi</span>
              <div className={styles.previewHero} />
              <div className={styles.previewLine} />
              <div className={styles.previewLineShort} />
              <div className={styles.previewBlocks}><i /><i /><i /></div>
            </div>
            <div className={styles.galleryCardCopy}>
              <span>{variant.mark}</span>
              <div><h2>{variant.name}</h2><p>{variant.description}</p></div>
              <b>打开方案 →</b>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
