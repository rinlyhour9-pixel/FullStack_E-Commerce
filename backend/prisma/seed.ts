import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { baseProducts } from '../../src/data/products';

const prisma = new PrismaClient();
const categories = [
  ['cleansers', 'Cleansers'], ['serums', 'Serums'], ['moisturizers', 'Moisturizers'],
  ['masks', 'Masks'], ['sun-care', 'Sun Care'], ['body', 'Body'],
];

async function main() {
  const categoryRows = new Map<string, string>();
  for (const [slug, name] of categories) {
    const row = await prisma.category.upsert({ where: { slug }, update: { name }, create: { slug, name } });
    categoryRows.set(slug, row.id);
  }
  for (const item of baseProducts) {
    const categoryId = categoryRows.get(item.category)!;
    const data = { name: item.name, tagline: item.tagline, description: item.description, howToUse: item.howToUse, ingredients: item.ingredients, skinTypes: item.skinTypes, price: item.price, compareAtPrice: item.compareAtPrice ?? null, currency: item.currency, badges: item.badges ?? [], rating: item.rating, reviewCount: item.reviewCount, categoryId, active: true };
    await prisma.product.upsert({ where: { slug: item.slug }, update: data, create: { id: item.id, slug: item.slug, ...data } });
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: item.slug } });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({ data: item.images.map((path, position) => ({ productId: product.id, path, position })) });
    for (const variant of item.variants) {
      const variantId = `${item.id}-${variant.id}`;
      await prisma.productVariant.upsert({ where: { id: variantId }, update: { label: variant.label, priceModifier: variant.priceModifier, stock: variant.stock, active: true, productId: product.id }, create: { id: variantId, label: variant.label, priceModifier: variant.priceModifier, stock: variant.stock, productId: product.id } });
    }
    for (const review of item.reviews) {
      await prisma.productReview.upsert({ where: { id: review.id }, update: { author: review.author, rating: review.rating, title: review.title, body: review.body, verified: review.verified, date: new Date(`${review.date}T12:00:00Z`), productId: product.id }, create: { id: review.id, author: review.author, rating: review.rating, title: review.title, body: review.body, verified: review.verified, date: new Date(`${review.date}T12:00:00Z`), productId: product.id } });
    }
  }
  console.log(`Seeded ${baseProducts.length} products and ${categories.length} categories.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
