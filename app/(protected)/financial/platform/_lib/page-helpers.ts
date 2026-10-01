export function profitMargin(revenue: number, cost: number) {
  if (revenue === 0) return 0;
  return ((revenue - cost) / revenue) * 100;
}
