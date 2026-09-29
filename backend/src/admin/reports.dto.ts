import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
export class ReportQueryDto {
  @IsIn(['day', 'month', 'year']) period: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' }) date: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(-840) @Max(840) tz?: number;
}
