import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginacionDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  etiquetas?: string; // comma-separated

  @IsOptional()
  @IsString()
  colores?: string; // comma-separated

  @IsOptional()
  @IsString()
  tipo?: string;
}
