import { t as translate, type InterpolationParams } from './index';
import { currentLanguage } from '../current-language';

/**
 * Translate outside a React render — event handlers, hooks and toasts — in the
 * language the user picked. Components should keep using `useTranslation`.
 */
export function tNow(key: string, params?: InterpolationParams): string {
  return translate(key, currentLanguage(), params);
}
