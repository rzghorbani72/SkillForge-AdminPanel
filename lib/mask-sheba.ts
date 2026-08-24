/** Shows the bank prefix and the last 4 digits — recognisable, useless if leaked. */
export function maskSheba(sheba: string | null | undefined): string {
  if (!sheba) return '—';
  if (sheba.length <= 10) return sheba;
  return `${sheba.slice(0, 6)}${'*'.repeat(sheba.length - 10)}${sheba.slice(-4)}`;
}
