import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePosSaleDto } from './pos.dto';

function round(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }

@Injectable()
export class PosService {
  constructor(private prisma: PrismaService) {}

  getConfig() {
    const rate = Number(process.env.TAX_RATE ?? 0.08);
    return { taxRate: Number.isFinite(rate) && rate >= 0 ? rate : 0.08, currency: 'USD' };
  }

  async listSales() {
    const rows = await this.prisma.posSale.findMany({
      include: { items: true, staff: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map((sale) => this.mapSale(sale));
  }

  async createSale(staffId: string, input: CreatePosSaleDto) {
    const requestedIds = input.items.map((line) => line.variantId);
    if (new Set(requestedIds).size !== requestedIds.length) throw new BadRequestException('Each product variant can appear only once in a sale.');

    const sale = await this.prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: requestedIds }, active: true, product: { active: true } },
        include: { product: { include: { images: { orderBy: { position: 'asc' } } } } },
      });
      if (variants.length !== requestedIds.length) throw new BadRequestException('A product in this sale is no longer available. Refresh and try again.');
      const byId = new Map(variants.map((variant) => [variant.id, variant]));
      const priced = input.items.map((line) => {
        const variant = byId.get(line.variantId)!;
        const unitPrice = round(Number(variant.product.price) + Number(variant.priceModifier));
        return { line, variant, unitPrice, lineTotal: round(unitPrice * line.quantity) };
      });
      const subtotal = round(priced.reduce((sum, row) => sum + row.lineTotal, 0));
      const tax = round(subtotal * this.getConfig().taxRate);
      const total = round(subtotal + tax);

      for (const { line, variant } of priced) {
        const result = await tx.productVariant.updateMany({
          where: { id: variant.id, active: true, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (result.count !== 1) throw new BadRequestException(`Insufficient stock for ${variant.product.name} (${variant.label}).`);
      }

      const receiptNumber = `POS-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
      return tx.posSale.create({
        data: {
          receiptNumber,
          paymentMethod: input.paymentMethod,
          customerName: input.customerName?.trim() || null,
          subtotal,
          tax,
          total,
          staffId,
          items: { create: priced.map(({ line, variant, unitPrice, lineTotal }) => ({
            productId: variant.productId,
            productName: variant.product.name,
            variantId: variant.id,
            variantLabel: variant.label,
            imagePath: variant.product.images[0]?.path ?? '',
            quantity: line.quantity,
            unitPrice,
            lineTotal,
          })) },
        },
        include: { items: true, staff: { select: { name: true } } },
      });
    });
    return this.mapSale(sale);
  }

  private mapSale(sale: any) {
    return {
      id: sale.id,
      receiptNumber: sale.receiptNumber,
      paymentMethod: sale.paymentMethod,
      customerName: sale.customerName,
      staffName: sale.staff.name,
      createdAt: sale.createdAt.toISOString(),
      subtotal: Number(sale.subtotal),
      tax: Number(sale.tax),
      total: Number(sale.total),
      items: sale.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
        imagePath: item.imagePath,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
    };
  }
}
