const DEFAULT_SITE_URL = 'https://lingyi.bio';

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(configured).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteHostname(): string {
  return new URL(getSiteUrl()).hostname;
}

export function getUmamiDomains(): string {
  const configured = process.env.NEXT_PUBLIC_UMAMI_DOMAINS?.trim();
  if (configured) return configured;

  const hostname = getSiteHostname();
  return hostname.startsWith('www.') ? hostname : `${hostname},www.${hostname}`;
}

export function absoluteSiteUrl(pathname = '/'): string {
  return new URL(pathname, `${getSiteUrl()}/`).toString();
}
