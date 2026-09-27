import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, Roles } from '../auth/auth.decorators';
import { CatalogQueryDto, ReviewInputDto } from './catalog.dto';
import { CatalogService } from './catalog.service';

@ApiTags('catalog') @Controller()
export class CatalogController {
  constructor(private catalog: CatalogService) {}
  @Get('products') list(@Query() query: CatalogQueryDto) { return this.catalog.list(query); }
  @Get('products/:slug') bySlug(@Param('slug') slug: string) { return this.catalog.bySlug(slug); }
  @ApiBearerAuth() @UseGuards(AuthGuard) @Roles('customer') @Post('products/:id/reviews') review(@Param('id') id: string, @Body() body: ReviewInputDto, @CurrentUser() user: any) { return this.catalog.review(id, body, user); }
  @Get('categories') categories() { return this.catalog.categories(); }
}
