export interface ErrorFields {
  error_name: string;
  error_message: string;
  error_code?: string;
  error_stack?: string;
}

const str = (v: unknown): string | undefined =>
  typeof v === 'string' || typeof v === 'number' ? String(v) : undefined;

/** The only way to log an error: name/message/code/stack as flat keys. */
export function errorFields(err: unknown): ErrorFields {
  if (err instanceof Error) {
    const code = 'code' in err ? str(err.code) : undefined;
    return {
      error_name: err.name,
      error_message: err.message,
      ...(code ? { error_code: code } : {}),
      ...(err.stack ? { error_stack: err.stack } : {}),
    };
  }
  return { error_name: 'UnknownError', error_message: str(err) ?? String(err) };
}
