import { IsEmail, IsInt, IsString, Max, MaxLength, Min, MinLength, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
export class CartItemDto {
  @IsString() variantId: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(99) quantity: number;
}
export class ShippingAddressDto {
  @IsString() @MinLength(2) @MaxLength(240) address: string;
  @IsString() @MinLength(2) @MaxLength(100) city: string;
  @IsString() @MinLength(2) @MaxLength(30) postalCode: string;
  @IsString() @MinLength(2) @MaxLength(100) country: string;
}
export class CreateOrderDto {
  @IsString() @MinLength(2) @MaxLength(100) customerName: string;
  @IsEmail() @MaxLength(254) customerEmail: string;
  @IsDefined() @ValidateNested() @Type(() => ShippingAddressDto) shippingAddress: ShippingAddressDto;
}
