import Script from 'next/script';

/**
 * Google Analytics 4 page-view tracking.
 *
 * Runs alongside Umami (see Analytics.tsx); neither replaces the other.
 * The measurement ID is a public identifier that is visible in the page
 * source anyway, so it is kept as a plain constant here.
 */
const GA_MEASUREMENT_ID = 'G-E4M631F46C';

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        id="ga4-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
