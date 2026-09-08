/**
 * Production CSP allows `https:` (and `'self'`), not `http:`. A playlist or
 * key minted as `http://api.mentoma.ir/...` is reported as (blocked:csp), and
 * the Referer is stripped on the HTTPS→HTTP downgrade. Localhost stays http.
 */
export function toPlayableMediaUrl(url: string): string {
  if (!url.startsWith('http://')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return url;
    }
    parsed.protocol = 'https:';
    return parsed.toString();
  } catch {
    return url;
  }
}
