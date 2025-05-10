import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFondoDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  descripcion?: string;

  @IsArray()
  @IsString({ each: true }) // Valida que cada elemento sea string (ObjectId de MongoDB)
  colores: string[];

  @IsArray()
  @IsString({ each: true })
  etiquetas: string[];

  @IsString()
  imagen: string;
}
