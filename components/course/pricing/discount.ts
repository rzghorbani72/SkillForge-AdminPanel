/** A "before discount" price only means something above what the buyer pays. */
export const isBeforeDiscountValid = (
  price: number,
  beforeDiscount: number
): boolean => beforeDiscount === 0 || beforeDiscount > price;

export const discountPercent = (
  price: number,
  beforeDiscount: number | null
): number | null =>
  beforeDiscount && beforeDiscount > price
    ? Math.round((1 - price / beforeDiscount) * 100)
    : null;
