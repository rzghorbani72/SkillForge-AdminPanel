import { DEFAULT_GEO_SERVICE_HOSTS } from './security/config';
import { assertAllowedExternalFetchUrl } from './security/ssrf';

/**
 * Custom image loader for Next.js Image component.
 * Only allows relative paths or absolute URLs on whitelisted Mentoma hosts.
 */

const LOCAL_PANEL_HOSTS = new Set(['localhost', '127.0.0.1']);

const ALLOWED_IMAGE_HOSTS = new Set([
  'admin.mentoma.com',
  'admin.mentoma.ir',
  'api.mentoma.com',
  'api.mentoma.ir',
  'panel-academy.darkube.ir',
  'api-academy.darkube.ir',
  ...LOCAL_PANEL_HOSTS
]);

function isAllowedImageHost(hostname) {
  const host = hostname.toLowerCase();
  if (ALLOWED_IMAGE_HOSTS.has(host)) return true;
  return (
    host.endsWith('.mentoma.com') ||
    host.endsWith('.mentoma.ir') ||
    host.endsWith('.darkube.ir')
  );
}

export default function customImageLoader({ src, width, quality = 75 }) {
  if (!src || typeof src !== 'string') {
    console.warn('ImageLoader: Invalid src provided', src);
    return '';
  }

  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const url = new URL(src);
      if (!isAllowedImageHost(url.hostname)) {
        console.warn('ImageLoader: Blocked external host', url.hostname);
        return '';
      }
      return url.toString();
    } catch (error) {
      console.warn('ImageLoader: Invalid URL', src, error);
      return '';
    }
  }

  const panelHost =
    process.env?.NEXT_PUBLIC_HOST?.replace(/\/$/, '') ||
    'http://localhost:4000';

  const baseUrl = panelHost.endsWith('/') ? panelHost.slice(0, -1) : panelHost;
  const imagePath = src.startsWith('/') ? src : `/${src}`;
  return `${baseUrl}${imagePath}`;
}
