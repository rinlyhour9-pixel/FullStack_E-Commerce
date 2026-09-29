import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, Roles } from '../auth/auth.decorators';
import { CatalogService } from '../catalog/catalog.service';
import { ProductInputDto } from '../catalog/catalog.dto';
import { CommerceService } from '../commerce/commerce.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminOrderQueryDto, UpdateStatusDto, UpdateStockDto } from './admin.dto';
import { CreatePosSaleDto } from './pos.dto';
import { PosService } from './pos.service';
import { ReportQueryDto } from './reports.dto';
import { ReportsService } from './reports.service';

@ApiTags('admin') @ApiBearerAuth() @UseGuards(AuthGuard) @Roles('admin') @Controller('admin')
export class AdminController {
  constructor(private catalog: CatalogService, private commerce: CommerceService, private prisma: PrismaService, private pos: PosService, private reports: ReportsService) {}
  @Get('products') products() { return this.catalog.adminList(); }
  @Get('reports') report(@Query() query: ReportQueryDto) { return this.reports.report(query); }
  @Get('pos/config') posConfig() { return this.pos.getConfig(); }
  @Get('pos/sales') posSales() { return this.pos.listSales(); }
  @Post('pos/sales') createPosSale(@CurrentUser() user: any, @Body() body: CreatePosSaleDto) { return this.pos.createSale(user.id, body); }
  @Post('products/upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (_req, _file, callback) => {
        const directory = join(__dirname, '..', '..', 'uploads');
        mkdirSync(directory, { recursive: true });
        callback(null, directory);
      },
      filename: (_req, file, callback) => {
        const extension = file.mimetype === 'image/jpeg' ? '.jpg' : file.mimetype === 'image/png' ? '.png' : '.webp';
        callback(null, `${randomUUID()}${extension}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(new BadRequestException('Upload a JPG, PNG, or WebP image.'), false);
      callback(null, true);
    },
  }))
  uploadProductImage(@UploadedFile() file?: { filename: string }) {
    if (!file) throw new BadRequestException('Choose an image to upload.');
    return { path: `/uploads/${file.filename}` };
  }
  @Post('products') createProduct(@Body() body: ProductInputDto) { return this.catalog.create(body); }
  @Patch('products/:id') updateProduct(@Param('id') id: string, @Body() body: ProductInputDto) { return this.catalog.update(id, body); }
  @Delete('products/:id') deleteProduct(@Param('id') id: string) { return this.catalog.remove(id); }
  @Patch('products/:productId/variants/:variantId/stock') async stock(@Param('productId') productId: string, @Param('variantId') variantId: string, @Body() body: UpdateStockDto) {
    const result = await this.prisma.productVariant.updateMany({ where: { id: variantId, productId }, data: { stock: body.stock } });
    if (!result.count) throw new NotFoundException('Variant not found');
    return this.catalog.byId(productId);
  }
  @Get('orders') orders(@Query() query: AdminOrderQueryDto) { return this.commerce.adminOrders(query.status); }
  @Get('orders/:id') order(@Param('id') id: string) { return this.commerce.adminOrder(id); }
  @Patch('orders/:id/status') updateOrder(@Param('id') id: string, @Body() body: UpdateStatusDto) { return this.commerce.updateStatus(id, body.status); }
  @Get('customers') async customers() {
    return this.prisma.user.findMany({ where: { role: 'customer' }, select: { id: true, name: true, email: true, createdAt: true, orders: { select: { total: true, status: true, createdAt: true } } }, orderBy: { createdAt: 'desc' } }).then((users) => users.map((user) => {
      const purchases = user.orders.filter((order) => order.status !== 'cancelled').sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, orderCount: user.orders.length, totalSpent: purchases.reduce((sum, order) => sum + Number(order.total), 0), lastOrderAt: purchases[0]?.createdAt ?? null };
    }));
  }
  @Get('stats') async stats() {
    const [customers, products, webOrders, webGross, posSales, posGross] = await Promise.all([
      this.prisma.user.count({ where: { role: 'customer' } }),
      this.prisma.product.count({ where: { active: true } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ where: { status: { not: 'cancelled' } }, _sum: { total: true } }),
      this.prisma.posSale.count(),
      this.prisma.posSale.aggregate({ _sum: { total: true } }),
    ]);
    const revenue = Number(webGross._sum.total ?? 0) + Number(posGross._sum.total ?? 0);
    const transactions = webOrders + posSales;
    return { customers, products, orders: transactions, webOrders, posSales, revenue, averageTicket: transactions ? revenue / transactions : 0 };
  }
}
