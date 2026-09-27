import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductInputDto, ReviewInputDto } from './catalog.dto';
import { catalogWhere } from '../common/store-rules';

const productInclude = { category: true, images: { orderBy: { position: 'asc' as const } }, variants: { where: { active: true } }, reviews: { orderBy: { date: 'desc' as const } } };
export function mapProduct(p: any) {
  return { id: p.id, slug: p.slug, name: p.name, tagline: p.tagline, description: p.description, howToUse: p.howToUse, ingredients: p.ingredients, category: p.category.slug, skinTypes: p.skinTypes, price: Number(p.price), ...(p.compareAtPrice == null ? {} : { compareAtPrice: Number(p.compareAtPrice) }), currency: p.currency, images: p.images.map((i: any) => i.path), variants: p.variants.map((v: any) => ({ id: v.id, label: v.label, priceModifier: Number(v.priceModifier), stock: v.stock })), rating: Number(p.rating), reviewCount: p.reviewCount, reviews: p.reviews.map((r: any) => ({ id: r.id, author: r.author, rating: r.rating, title: r.title, body: r.body, date: r.date.toISOString().slice(0, 10), verified: r.verified })), badges: p.badges };
}
function slugify(value: string) { return value.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-'); }

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}
  async list(query: any) {
    const page = Math.max(1, Number(query.page) || 1), limit = Math.min(60, Math.max(1, Number(query.limit) || 24));
    const where = catalogWhere(query);
    const orderBy: any = query.sort === 'price-asc' ? { price: 'asc' } : query.sort === 'price-desc' ? { price: 'desc' } : query.sort === 'rating' ? { rating: 'desc' } : query.sort === 'newest' ? { createdAt: 'desc' } : { name: 'asc' };
    const [rows, total] = await Promise.all([this.prisma.product.findMany({ where, include: productInclude, orderBy, skip: (page - 1) * limit, take: limit }), this.prisma.product.count({ where })]);
    return { items: rows.map(mapProduct), page, limit, total, pageCount: Math.ceil(total / limit) };
  }
  async bySlug(slug: string) { const p = await this.prisma.product.findFirst({ where: { slug, active: true }, include: productInclude }); if (!p) throw new NotFoundException('Product not found'); return mapProduct(p); }
  async byId(id: string) { const p = await this.prisma.product.findUnique({ where: { id }, include: productInclude }); if (!p) throw new NotFoundException('Product not found'); return mapProduct(p); }
  async categories() { return this.prisma.category.findMany({ orderBy: { name: 'asc' } }); }
  async adminList() { return (await this.prisma.product.findMany({ where: { active: true }, include: productInclude, orderBy: { createdAt: 'desc' } })).map(mapProduct); }
  private async categoryId(slug: string) { const c = await this.prisma.category.findUnique({ where: { slug } }); if (!c) throw new BadRequestException('Unknown category'); return c.id; }
  private productData(input: ProductInputDto, categoryId: string) { return { name: input.name, slug: slugify(input.name), tagline: input.tagline, description: input.description, howToUse: input.howToUse, ingredients: input.ingredients, skinTypes: input.skinTypes, price: input.price, compareAtPrice: input.compareAtPrice ?? null, currency: input.currency ?? 'USD', badges: input.badges ?? [], categoryId }; }
  async create(input: ProductInputDto) {
    const categoryId = await this.categoryId(input.category);
    let slug = slugify(input.name); if (await this.prisma.product.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    const p = await this.prisma.product.create({ data: { ...this.productData(input, categoryId), slug, images: { create: input.images.map((path, position) => ({ path, position })) }, variants: { create: input.variants.map(({ id: _id, ...v }) => v) } }, include: productInclude });
    return mapProduct(p);
  }
  async update(id: string, input: ProductInputDto) {
    const categoryId = await this.categoryId(input.category);
    const exists = await this.prisma.product.findUnique({ where: { id } }); if (!exists) throw new NotFoundException('Product not found');
    let slug = slugify(input.name); const collision = await this.prisma.product.findUnique({ where: { slug } }); if (collision && collision.id !== id) slug = `${slug}-${Date.now().toString(36)}`;
    const p = await this.prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      const { variants, images, ...data } = this.productData(input, categoryId) as any;
      await tx.productVariant.updateMany({ where: { productId: id }, data: { active: false } });
      for (const v of input.variants) {
        if (v.id && await tx.productVariant.findFirst({ where: { id: v.id, productId: id } })) await tx.productVariant.update({ where: { id: v.id }, data: { label: v.label, priceModifier: v.priceModifier, stock: v.stock, active: true } });
        else await tx.productVariant.create({ data: { label: v.label, priceModifier: v.priceModifier, stock: v.stock, productId: id } });
      }
      return tx.product.update({ where: { id }, data: { ...data, slug, images: { create: input.images.map((path, position) => ({ path, position })) } }, include: productInclude });
    });
    return mapProduct(p);
  }
  async remove(id: string) { await this.prisma.product.update({ where: { id }, data: { active: false } }).catch(() => { throw new NotFoundException('Product not found'); }); return { success: true }; }
  async review(id: string, input: ReviewInputDto, user: any) {
    const product = await this.prisma.product.findUnique({ where: { id } }); if (!product) throw new NotFoundException('Product not found');
    const verified = (await this.prisma.orderItem.count({ where: { productId: id, order: { userId: user.id, status: { in: ['processing','shipped','delivered'] } } } })) > 0;
    const review = await this.prisma.productReview.create({ data: { ...input, author: user.name, userId: user.id, productId: id, verified } });
    const agg = await this.prisma.productReview.aggregate({ where: { productId: id }, _avg: { rating: true }, _count: { _all: true } });
    await this.prisma.product.update({ where: { id }, data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count._all } });
    return { id: review.id, author: review.author, rating: review.rating, title: review.title, body: review.body, date: review.date.toISOString().slice(0, 10), verified: review.verified };
  }
}
