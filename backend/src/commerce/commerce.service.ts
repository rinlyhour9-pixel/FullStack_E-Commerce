import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { mapProduct } from '../catalog/catalog.service';
import { CartItemDto, CreateOrderDto } from './commerce.dto';
import { assertStock, calculateOrderTotals, customerOrderWhere } from '../common/store-rules';

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              category: true,
              images: { orderBy: { position: 'asc' as const } },
              variants: true,
              reviews: { orderBy: { date: 'desc' as const } },
            },
          },
        },
      },
    },
  },
};
function round(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }
function mapOrder(order: any) {
  return { id: order.id, createdAt: order.createdAt.toISOString(), customerName: order.customerName, customerEmail: order.customerEmail, items: order.items.map((i: any) => ({ productId: i.productId, productName: i.productName, variantId: i.variantId, variantLabel: i.variantLabel, artKey: i.artKey, quantity: i.quantity, unitPrice: Number(i.unitPrice), lineTotal: Number(i.lineTotal) })), shippingAddress: order.shippingAddress, subtotal: Number(order.subtotal), shipping: Number(order.shipping), tax: Number(order.tax), total: Number(order.total), status: order.status, paymentMethod: order.paymentMethod };
}

@Injectable()
export class CommerceService {
  constructor(private prisma: PrismaService) {}
  async cart(userId: string) {
    const cart = await this.prisma.cart.upsert({ where: { userId }, create: { userId }, update: {}, include: cartInclude });
    const lines = cart.items.filter((x: any) => x.variant.active && x.variant.product.active).map((x: any) => {
      const product = mapProduct({ ...x.variant.product, variants: x.variant.product.variants.filter((v: any) => v.active) });
      const variant = product.variants.find((v: any) => v.id === x.variantId);
      const unitPrice = round(product.price + Number(x.variant.priceModifier));
      return { line: { productId: product.id, variantId: x.variantId, quantity: x.quantity }, product, variant, unitPrice, lineTotal: round(unitPrice * x.quantity) };
    });
    return { lines: lines.map((x: any) => x.line), lineDetails: lines, itemCount: lines.reduce((n: number, x: any) => n + x.line.quantity, 0), subtotal: round(lines.reduce((n: number, x: any) => n + x.lineTotal, 0)) };
  }
  async setCartItem(userId: string, dto: CartItemDto) {
    const variant = await this.prisma.productVariant.findFirst({ where: { id: dto.variantId, active: true, product: { active: true } } });
    if (!variant) throw new NotFoundException('Product variant not found');
    if (dto.quantity > variant.stock) throw new BadRequestException('Requested quantity exceeds available stock');
    const cart = await this.prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
    await this.prisma.cartItem.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId: dto.variantId } }, create: { cartId: cart.id, variantId: dto.variantId, quantity: dto.quantity }, update: { quantity: dto.quantity } });
    return this.cart(userId);
  }
  async removeCartItem(userId: string, variantId: string) { const cart = await this.prisma.cart.findUnique({ where: { userId } }); if (cart) await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId } }); return this.cart(userId); }
  async clearCart(userId: string) { const cart = await this.prisma.cart.findUnique({ where: { userId } }); if (cart) await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } }); return { success: true }; }
  async wishlist(userId: string) {
    const saved = await this.prisma.wishlistItem.findMany({
      where: { userId, product: { active: true } },
      include: { product: { include: { category: true, images: { orderBy: { position: 'asc' } }, variants: { where: { active: true } }, reviews: { orderBy: { date: 'desc' } } } } },
    });
    return saved.map((row) => mapProduct(row.product));
  }
  async addWishlist(userId: string, productId: string) { if (!(await this.prisma.product.findFirst({ where: { id: productId, active: true } }))) throw new NotFoundException('Product not found'); await this.prisma.wishlistItem.upsert({ where: { userId_productId: { userId, productId } }, create: { userId, productId }, update: {} }); return this.wishlist(userId); }
  async removeWishlist(userId: string, productId: string) { await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } }); return this.wishlist(userId); }
  async createOrder(user: any, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({ where: { userId: user.id }, include: cartInclude });
    if (!cart || !cart.items.length) throw new BadRequestException('Your cart is empty');
    const priced = cart.items.map((item: any) => {
      if (!item.variant.active || !item.variant.product.active) throw new BadRequestException('A product in your cart is no longer available');
      const unitPrice = round(Number(item.variant.product.price) + Number(item.variant.priceModifier));
      return { item, unitPrice, lineTotal: round(unitPrice * item.quantity) };
    });
    const subtotal = round(priced.reduce((sum, x) => sum + x.lineTotal, 0));
    const totals = calculateOrderTotals(subtotal, Number(process.env.SHIPPING_FEE ?? 6), Number(process.env.FREE_SHIPPING_THRESHOLD ?? 50), Number(process.env.TAX_RATE ?? 0.08));
    const { shipping, tax, total } = totals;
    const order = await this.prisma.$transaction(async (tx) => {
      for (const { item } of priced) {
        const result = await tx.productVariant.updateMany({ where: { id: item.variantId, active: true, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (result.count !== 1) assertStock(0, item.quantity, `${item.variant.product.name} (${item.variant.label})`);
      }
      const created = await tx.order.create({ data: {
        userId: user.id, customerName: dto.customerName.trim(), customerEmail: user.email,
        shippingAddress: dto.shippingAddress as unknown as Prisma.InputJsonValue, subtotal, shipping, tax, total, paymentMethod: 'cash_on_delivery',
        items: { create: priced.map(({ item, unitPrice, lineTotal }) => ({ productId: item.variant.productId, variantId: item.variantId, productName: item.variant.product.name, variantLabel: item.variant.label, artKey: item.variant.product.images[0]?.path ?? '', quantity: item.quantity, unitPrice, lineTotal })) },
      }, include: { items: true } });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });
    return mapOrder(order);
  }
  async orders(userId: string) { return (await this.prisma.order.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: 'desc' } })).map(mapOrder); }
  async order(userId: string, id: string) { const found = await this.prisma.order.findFirst({ where: customerOrderWhere(userId, id), include: { items: true } }); if (!found) throw new NotFoundException('Order not found'); return mapOrder(found); }
  async adminOrders(status?: string) { const where = status ? { status: status as any } : {}; return (await this.prisma.order.findMany({ where, include: { items: true }, orderBy: { createdAt: 'desc' } })).map(mapOrder); }
  async adminOrder(id: string) { const found = await this.prisma.order.findUnique({ where: { id }, include: { items: true } }); if (!found) throw new NotFoundException('Order not found'); return mapOrder(found); }
  async updateStatus(id: string, status: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!current) throw new NotFoundException('Order not found');
      if (status === 'cancelled' && current.status !== 'cancelled') {
        if (current.status !== 'pending' && current.status !== 'processing') throw new BadRequestException('Only pending or processing orders can be cancelled');
        const changed = await tx.order.updateMany({ where: { id, status: { in: ['pending', 'processing'] } }, data: { status: 'cancelled' } });
        if (!changed.count) throw new BadRequestException('Order status changed; refresh and try again');
        for (const item of current.items) await tx.productVariant.updateMany({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      } else if (current.status !== status) {
        if (current.status === 'cancelled') throw new BadRequestException('Cancelled orders cannot be reopened');
        await tx.order.update({ where: { id }, data: { status: status as any } });
      }
      return tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    });
    return mapOrder(result);
  }
}
