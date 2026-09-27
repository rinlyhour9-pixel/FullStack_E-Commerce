import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

export class PosSaleLineDto {
  @IsString() @MaxLength(80) variantId: string;
  @Type(() => Number) @IsInt() @Min(1) quantity: number;
}

export class CreatePosSaleDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => PosSaleLineDto) items: PosSaleLineDto[];
  @IsIn(['cash', 'card', 'qr']) paymentMethod: 'cash' | 'card' | 'qr';
  @IsOptional() @IsString() @MaxLength(120) customerName?: string;
}
