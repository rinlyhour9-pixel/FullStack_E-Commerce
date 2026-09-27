import { BadRequestException } from '@nestjs/common';

export function allowsRole(userRole: string, requiredRoles: string[]) { return requiredRoles.length === 0 || requiredRoles.includes(userRole); }
export function catalogWhere(query: any) {
  const where: any = { active: true };
  if (query.category) { const values = String(query.category).split(',').filter(Boolean); where.category = { slug: values.length > 1 ? { in: values } : values[0] }; }
  if (query.skinType && query.skinType !== 'all') where.skinTypes = { hasSome: [...String(query.skinType).split(',').filter(Boolean), 'all'] };
  if (query.search) where.OR = ['name', 'tagline', 'description'].map((field) => ({ [field]: { contains: query.search, mode: 'insensitive' } }));
  if (query.priceBuckets) {
    const ranges: Record<string, { gte: number; lt?: number }> = { 'under-30': { gte: 0, lt: 30 }, '30-50': { gte: 30, lt: 50 }, '50-70': { gte: 50, lt: 70 }, 'over-70': { gte: 70 } };
    const priceOptions = String(query.priceBuckets).split(',').map((key) => ranges[key]).filter(Boolean);
    where.AND = [{ OR: priceOptions.map((price) => ({ price })) }];
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) where.price = { ...(query.minPrice === undefined ? {} : { gte: Number(query.minPrice) }), ...(query.maxPrice === undefined ? {} : { lt: Number(query.maxPrice) }) };
  return where;
}
function round(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
export function calculateOrderTotals(subtotal: number, shippingFee = 6, freeShippingThreshold = 50, taxRate = 0.08) {
  const amount = round(subtotal), shipping = amount > 0 && amount < freeShippingThreshold ? round(shippingFee) : 0;
  const tax = round(amount * taxRate);
  return { subtotal: amount, shipping, tax, total: round(amount + shipping + tax) };
}
export function assertStock(available: number, requested: number, productName = 'Item') { if (requested < 1 || available < requested) throw new BadRequestException(`Insufficient stock for ${productName}`); }
export function customerOrderWhere(userId: string, orderId: string) { return { id: orderId, userId }; }
