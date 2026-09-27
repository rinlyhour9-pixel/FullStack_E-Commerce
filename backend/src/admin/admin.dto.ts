import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
export class UpdateStatusDto { @IsIn(['pending','processing','shipped','delivered','cancelled']) status: string; }
export class UpdateStockDto { @Type(() => Number) @IsInt() @Min(0) stock: number; }
export class AdminOrderQueryDto { @IsOptional() @IsIn(['pending','processing','shipped','delivered','cancelled']) status?: string; }
