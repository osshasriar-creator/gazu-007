import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubtotal,
  calculateShipping,
  applyPromoDiscount,
  calculateOrderTotal,
  validateEmail,
  formatCurrency,
  type CartLineItem,
} from './cartRules';

test('calculateSubtotal handles empty array', () => {
  assert.equal(calculateSubtotal([]), 0);
});

test('calculateSubtotal computes regular and sale prices correctly', () => {
  const items: CartLineItem[] = [
    {
      id: 'item-1',
      productId: 'p-1',
      name: 'Overshirt',
      price: 1500,
      quantity: 2,
      size: 'M',
      color: 'Charcoal',
      image: '',
    },
    {
      id: 'item-2',
      productId: 'p-2',
      name: 'Graphic Tee',
      price: 900,
      salePrice: 750,
      quantity: 1,
      size: 'L',
      color: 'Slate',
      image: '',
    },
  ];

  // 1500 * 2 + 750 * 1 = 3750
  assert.equal(calculateSubtotal(items), 3750);
});

test('calculateShipping provides free delivery above threshold', () => {
  assert.equal(calculateShipping(0, 999), 0);
  assert.equal(calculateShipping(500, 999, 120), 120);
  assert.equal(calculateShipping(999, 999, 120), 0);
  assert.equal(calculateShipping(1200, 999, 120), 0);
});

test('applyPromoDiscount validates and applies percentage', () => {
  const result1 = applyPromoDiscount(1000, 'GAZU10');
  assert.equal(result1.valid, true);
  assert.equal(result1.discountPercentage, 10);
  assert.equal(result1.discountAmount, 100);

  const result2 = applyPromoDiscount(2000, 'gazu20'); // case insensitive
  assert.equal(result2.valid, true);
  assert.equal(result2.discountAmount, 400);

  const invalid = applyPromoDiscount(1000, 'INVALID');
  assert.equal(invalid.valid, false);
  assert.equal(invalid.discountAmount, 0);
});

test('calculateOrderTotal applies discount and adds shipping', () => {
  // subtotal 2000, discount 200, shipping 0
  assert.equal(calculateOrderTotal(2000, 200, 0), 1800);
  // subtotal 500, discount 50, shipping 120
  assert.equal(calculateOrderTotal(500, 50, 120), 570);
});

test('validateEmail checks standard email addresses', () => {
  assert.equal(validateEmail('test@example.com'), true);
  assert.equal(validateEmail('user.name+tag@sub.domain.co'), true);
  assert.equal(validateEmail('notanemail'), false);
  assert.equal(validateEmail('@missinguser.com'), false);
  assert.equal(validateEmail('missingdomain@'), false);
  assert.equal(validateEmail(''), false);
});

test('formatCurrency outputs formatted string with symbol', () => {
  assert.equal(formatCurrency(999, '৳'), '৳999');
  assert.equal(formatCurrency(2450, '৳'), '৳2,450');
});
