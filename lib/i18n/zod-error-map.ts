import { z } from 'zod';
import { t } from './index';
import type { LanguageCode } from './config';

function countParam(value: number | bigint): number {
  return typeof value === 'bigint' ? Number(value) : value;
}

/**
 * Maps Zod's English default issues to i18n keys (or fully translated
 * strings when a count is needed). FormMessage runs t() on the message:
 * known keys are translated; already-localized text is returned as-is.
 */
export function applyZodErrorMap(language: LanguageCode): void {
  z.setErrorMap((issue, ctx) => {
    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        if (issue.received === 'undefined' || issue.received === 'null') {
          return { message: 'validation.required' };
        }
        return { message: 'validation.invalidType' };

      case z.ZodIssueCode.too_small: {
        if (issue.type === 'string') {
          if (issue.minimum === 1) {
            return { message: 'validation.required' };
          }
          return {
            message: t('validation.minChars', language, {
              count: countParam(issue.minimum),
            }),
          };
        }
        if (issue.type === 'number' || issue.type === 'bigint') {
          return {
            message: t('validation.minNumber', language, {
              count: countParam(issue.minimum),
            }),
          };
        }
        if (issue.type === 'array') {
          return {
            message: t('validation.minItems', language, {
              count: countParam(issue.minimum),
            }),
          };
        }
        break;
      }

      case z.ZodIssueCode.too_big: {
        if (issue.type === 'string') {
          return {
            message: t('validation.maxChars', language, {
              count: countParam(issue.maximum),
            }),
          };
        }
        if (issue.type === 'number' || issue.type === 'bigint') {
          return {
            message: t('validation.maxNumber', language, {
              count: countParam(issue.maximum),
            }),
          };
        }
        if (issue.type === 'array') {
          return {
            message: t('validation.maxItems', language, {
              count: countParam(issue.maximum),
            }),
          };
        }
        break;
      }

      case z.ZodIssueCode.invalid_string:
        if (issue.validation === 'email') {
          return { message: 'validation.invalidEmail' };
        }
        if (issue.validation === 'url') {
          return { message: 'validation.invalidUrl' };
        }
        return { message: 'validation.invalidString' };

      case z.ZodIssueCode.invalid_enum_value:
      case z.ZodIssueCode.invalid_literal:
        return { message: 'validation.invalidOption' };

      case z.ZodIssueCode.invalid_date:
        return { message: 'validation.invalidDate' };

      case z.ZodIssueCode.not_finite:
        return { message: 'validation.invalidNumber' };

      default:
        break;
    }

    return { message: ctx.defaultError };
  });
}
