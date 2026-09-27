import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

export class ProductVariantDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @MinLength(1) @MaxLength(80) label: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) priceModifier: number;
  @Type(() => Number) @IsInt() @Min(0) stock: number;
}
export class ProductInputDto {
  @IsString() @MinLength(2) @MaxLength(160) name: string;
  @IsString() @MaxLength(200) tagline: string;
  @IsString() @MinLength(4) description: string;
  @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) howToUse: string[];
  @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) ingredients: string[];
  @IsString() @IsIn(['cleansers','serums','moisturizers','masks','sun-care','body']) category: string;
  @IsArray() @IsIn(['all','dry','oily','combination','sensitive'], { each: true }) skinTypes: string[];
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) compareAtPrice?: number;
  @IsOptional() @IsIn(['USD']) currency?: string;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(12) @IsString({ each: true }) images: string[];
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => ProductVariantDto) variants: ProductVariantDto[];
  @IsOptional() @IsArray() @IsIn(['new','bestseller','limited'], { each: true }) badges?: string[];
}
export class ReviewInputDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(5) rating: number;
  @IsString() @MinLength(2) @MaxLength(120) title: string;
  @IsString() @MinLength(4) @MaxLength(2000) body: string;
}

export class CatalogQueryDto {
  @IsOptional() @IsString() @MaxLength(120) search?: string;
  @IsOptional() @IsString() @MaxLength(120) category?: string;
  @IsOptional() @IsString() @Matches(/^(all|dry|oily|combination|sensitive)(,(all|dry|oily|combination|sensitive))*$/) skinType?: string;
  @IsOptional() @IsString() @IsIn(['featured','price-asc','price-desc','rating','newest']) sort?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(60) limit?: number;
  @IsOptional() @IsString() @MaxLength(80) priceBuckets?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;
}
