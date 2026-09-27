import { BadRequestException } from '@nestjs/common';
import { allowsRole, assertStock, calculateOrderTotals, catalogWhere, customerOrderWhere } from './store-rules';

describe('store rules', () => {
  it('allows only the required role for protected routes', () => {
    expect(allowsRole('admin', ['admin'])).toBe(true);
    expect(allowsRole('customer', ['admin'])).toBe(false);
    expect(allowsRole('customer', [])).toBe(true);
  });
  it('builds catalog filters for category, skin type, and search', () => {
    expect(catalogWhere({ category: 'serums,masks', skinType: 'dry,sensitive', search: 'barrier' })).toEqual({
      active: true,
      category: { slug: { in: ['serums', 'masks'] } },
      skinTypes: { hasSome: ['dry', 'sensitive', 'all'] },
      OR: ['name', 'tagline', 'description'].map((field) => ({ [field]: { contains: 'barrier', mode: 'insensitive' } })),
    });
  });
  it('applies price range groups for multi-select shop filters', () => {
    expect(catalogWhere({ priceBuckets: 'under-30,50-70' })).toEqual({ active: true, AND: [{ OR: [{ price: { gte: 0, lt: 30 } }, { price: { gte: 50, lt: 70 } }] }] });
  });
  it('calculates shipping, tax, and total from server subtotal', () => {
    expect(calculateOrderTotals(40, 6, 50, 0.08)).toEqual({ subtotal: 40, shipping: 6, tax: 3.2, total: 49.2 });
    expect(calculateOrderTotals(50, 6, 50, 0.08)).toEqual({ subtotal: 50, shipping: 0, tax: 4, total: 54 });
  });
  it('rejects a checkout quantity that exceeds stock', () => {
    expect(() => assertStock(1, 2, 'Velvet Clay Cleanser')).toThrow(BadRequestException);
    expect(() => assertStock(2, 2)).not.toThrow();
  });
  it('scopes customer order reads to both order id and owner id', () => {
    expect(customerOrderWhere('customer-1', 'order-9')).toEqual({ id: 'order-9', userId: 'customer-1' });
    expect(customerOrderWhere('customer-2', 'order-9').userId).not.toBe('customer-1');
  });
});
