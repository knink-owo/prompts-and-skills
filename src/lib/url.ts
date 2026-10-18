const RAW_BASE = import.meta.env.BASE_URL || '/';
const BASE = RAW_BASE === '/' ? '' : RAW_BASE.replace(/\/+$/, '');

/**
 * Prefix an internal path with Astro's base path.
 * External URLs, protocol-relative URLs, anchors, mailto: and data: are left alone.
 */
export function href(path: string): string {
  if (!path) return BASE || '/';

  if (
    /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(path) ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:') ||
    path.startsWith('data:') ||
    path.startsWith('#')
  ) {
    return path;
  }

  const clean = path.startsWith('/') ? path : `/${path}`;
  if (!BASE) return clean;
  if (clean === BASE || clean.startsWith(`${BASE}/`)) return clean;
  return `${BASE}${clean}`;
}

/** Encode each path segment for canonical URLs and sitemaps. */
export function encodePath(path: string): string {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/** Build an absolute URL from a site origin and an internal path. */
export function absoluteUrl(path: string, siteUrl: URL | string): string {
  return new URL(href(path), siteUrl).toString();
}
