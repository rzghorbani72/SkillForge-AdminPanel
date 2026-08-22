import { langApiVersionPath } from '@/lib/api-lang';

/** Same-origin API URL of a stored image, by id. */
export function imageByIdSrc(id: string | number): string {
  return `${langApiVersionPath()}/images/fetch-image-by-id/${id}`;
}
