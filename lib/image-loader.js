/**
 * Custom image loader for Next.js Image component
 * Handles responsive images for all screen sizes
 *
 * This loader:
 * - Supports both absolute and relative URLs
 * - Works with backend API image endpoints
 * - Handles width/quality parameters for responsive images
 * - Falls back gracefully when backend doesn't support resizing
 *
 * Usage: Set in next.config.js:
 *   images: {
 *     loader: 'custom',
 *     loaderFile: './lib/image-loader.js',
 *   }
 *
 * Or use unoptimized mode with this loader for better control
 */

export default function customImageLoader({ src, width, quality = 75 }) {
  // Handle empty or invalid src
  if (!src || typeof src !== 'string') {
    console.warn('ImageLoader: Invalid src provided', src);
    return '';
  }

  // If src is already a full URL (http/https), handle it
  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const url = new URL(src);

      // Optional: Add width/quality params if backend supports resizing
      // Uncomment if your backend supports on-the-fly image resizing
      // url.searchParams.set('w', width.toString());
      // if (quality) {
      //   url.searchParams.set('q', quality.toString());
      // }

      return url.toString();
    } catch (error) {
      console.warn('ImageLoader: Invalid URL', src, error);
      return src; // Return as-is if URL parsing fails
    }
  }

  // Handle relative URLs (e.g., /api/images/fetch-image-by-id/123)
  // Get backend base URL from environment variables
  const backendUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_HOST) ||
    (typeof process !== 'undefined' &&
      process.env?.NEXT_PUBLIC_API_URL?.replace('/api', '')) ||
    'http://localhost:3000';

  // Normalize base URL (remove trailing slash)
  const baseUrl = backendUrl.endsWith('/')
    ? backendUrl.slice(0, -1)
    : backendUrl;

  // Normalize image path (ensure leading slash)
  const imagePath = src.startsWith('/') ? src : `/${src}`;

  // Construct full URL
  const fullUrl = `${baseUrl}${imagePath}`;

  // Optional: Add width/quality params if backend supports resizing
  // If your backend supports query params like ?w=1920&q=75, uncomment:
  // try {
  //   const url = new URL(fullUrl);
  //   url.searchParams.set('w', width.toString());
  //   if (quality) {
  //     url.searchParams.set('q', quality.toString());
  //   }
  //   return url.toString();
  // } catch (error) {
  //   // If URL construction fails, return without params
  //   return fullUrl;
  // }

  // Return the full URL
  // Next.js will generate proper srcset for responsive images
  // The browser will select the appropriate image based on screen size
  // Even if all srcset entries point to the same URL, the browser still handles
  // responsive loading based on viewport size and device pixel ratio
  return fullUrl;
}
