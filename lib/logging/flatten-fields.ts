import type { LogFields, LogPrimitive } from './logger';

const isPrimitive = (v: unknown): v is LogPrimitive =>
  v == null || ['string', 'number', 'boolean'].includes(typeof v);

/**
 * Runtime guard behind the compile-time flat-fields rule. One nested object
 * level becomes `parent_child` keys, arrays become `key` (joined) + `key_count`,
 * anything deeper is dropped so no nested JSON ever reaches Loki.
 */
export function flattenFields(fields: Record<string, unknown>): LogFields {
  const out: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (isPrimitive(value)) {
      out[key] = value;
    } else if (Array.isArray(value)) {
      out[key] = value.filter(isPrimitive).map(String).join(',');
      out[`${key}_count`] = value.length;
    } else if (typeof value === 'object') {
      for (const [sub, subValue] of Object.entries(value)) {
        if (isPrimitive(subValue)) out[`${key}_${sub}`] = subValue;
      }
    }
  }
  return out;
}
