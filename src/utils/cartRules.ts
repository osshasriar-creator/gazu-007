/**
 * Pure calculation and validation logic for GAZU Storefront
 */

export interface CartLineItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface PromoResult {
  valid: boolean;
  code: string;
  discountPercentage: number;
  discountAmount: number;
  message: string;
}

const PROMO_CODES: Record<string, number> = {
  GAZU10: 10,
  GAZU20: 20,
  WELCOME15: 15,
  FREESHIP: 100, // special code
};

/**
 * Calculates subtotal based on sale price (if present) or standard price.
 */
export function calculateSubtotal(items: CartLineItem[]): number {
  return items.reduce((sum, item) => {
    const effectivePrice = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
    return sum + effectivePrice * item.quantity;
  }, 0);
}

/**
 * Calculates shipping cost. Free if subtotal >= threshold.
 */
export function calculateShipping(subtotal: number, threshold: number = 999, standardRate: number = 120): number {
  if (subtotal <= 0) return 0;
  return subtotal >= threshold ? 0 : standardRate;
}

/**
 * Validates and applies a promo code.
 */
export function applyPromoDiscount(subtotal: number, code: string): PromoResult {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, code: '', discountPercentage: 0, discountAmount: 0, message: '' };
  }

  if (cleanCode in PROMO_CODES) {
    if (cleanCode === 'FREESHIP') {
      return {
        valid: true,
        code: cleanCode,
        discountPercentage: 0,
        discountAmount: 0,
        message: 'Free shipping promo code applied!',
      };
    }
    const percent = PROMO_CODES[cleanCode];
    const discountAmount = Math.round((subtotal * percent) / 100);
    return {
      valid: true,
      code: cleanCode,
      discountPercentage: percent,
      discountAmount,
      message: `${percent}% off applied with code ${cleanCode}!`,
    };
  }

  return {
    valid: false,
    code: cleanCode,
    discountPercentage: 0,
    discountAmount: 0,
    message: 'Invalid promo code. Try GAZU10 or WELCOME15',
  };
}

/**
 * Calculates final order total
 */
export function calculateOrderTotal(subtotal: number, discountAmount: number, shipping: number): number {
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  return afterDiscount + shipping;
}

/**
 * Validates email format strictly
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Format currency with configured symbol
 */
export function formatCurrency(amount: number, symbol: string = '৳'): string {
  return `${symbol}${amount.toLocaleString()}`;
}
