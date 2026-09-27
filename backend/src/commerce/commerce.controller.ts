import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorators';
import { CartItemDto, CreateOrderDto } from './commerce.dto';
import { CommerceService } from './commerce.service';

@ApiTags('commerce') @ApiBearerAuth() @UseGuards(AuthGuard) @Controller()
export class CommerceController {
  constructor(private commerce: CommerceService) {}
  @Get('cart') cart(@CurrentUser() user: any) { return this.commerce.cart(user.id); }
  @Put('cart/items') setCart(@CurrentUser() user: any, @Body() body: CartItemDto) { return this.commerce.setCartItem(user.id, body); }
  @Delete('cart/items/:variantId') removeCart(@CurrentUser() user: any, @Param('variantId') id: string) { return this.commerce.removeCartItem(user.id, id); }
  @Delete('cart') clearCart(@CurrentUser() user: any) { return this.commerce.clearCart(user.id); }
  @Get('wishlist') wishlist(@CurrentUser() user: any) { return this.commerce.wishlist(user.id); }
  @Put('wishlist/:productId') addWishlist(@CurrentUser() user: any, @Param('productId') id: string) { return this.commerce.addWishlist(user.id, id); }
  @Delete('wishlist/:productId') removeWishlist(@CurrentUser() user: any, @Param('productId') id: string) { return this.commerce.removeWishlist(user.id, id); }
  @Post('orders') createOrder(@CurrentUser() user: any, @Body() body: CreateOrderDto) { return this.commerce.createOrder(user, body); }
  @Get('orders') orders(@CurrentUser() user: any) { return this.commerce.orders(user.id); }
  @Get('orders/:id') order(@CurrentUser() user: any, @Param('id') id: string) { return this.commerce.order(user.id, id); }
}
