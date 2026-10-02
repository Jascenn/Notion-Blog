import Script from 'next/script';
import { getUmamiDomains } from '@/lib/site-config';

/**
 * Umami page-view and event tracking.
 *
 * The component renders nothing until a website ID is configured, so local
 * development and preview deployments do not send analytics accidentally.
 */
export default function Analytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  if (!websiteId) return null;

  const scriptUrl =
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';
  const allowedDomains = getUmamiDomains();

  return (
    <Script
      id="umami-analytics"
      src={scriptUrl}
      data-website-id={websiteId}
      data-domains={allowedDomains}
      data-do-not-track="true"
      data-performance="true"
      strategy="afterInteractive"
    />
  );
}
