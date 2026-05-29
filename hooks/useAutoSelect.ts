import { useEffect } from 'react';

/**
 * Auto-selects the only option when a select has exactly one item.
 * Place this alongside any Select field that receives dynamic options.
 *
 * @param options - Array of items with at least a `value` string field
 * @param onChange - The field's onChange handler (e.g. field.onChange from react-hook-form)
 * @param currentValue - The current selected value
 */
export function useAutoSelect(
  options: { value: string }[],
  onChange: (value: string) => void,
  currentValue?: string
) {
  useEffect(() => {
    if (options.length === 1 && !currentValue) {
      onChange(options[0].value);
    }
  }, [options, currentValue, onChange]);
}
