import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

@Entity()
export class Fondo {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  titulo?: string;

  @Column({ nullable: true, type: 'text' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  @IsArray()
  @IsOptional()
  @Type(() => String)
  colores: string[]; // Almacena ObjectIds de MongoDB como strings

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  @IsArray()
  @IsOptional()
  @Type(() => String)
  etiquetas: string[]; // Almacena ObjectIds de MongoDB como strings

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  imagen?: string; // ObjectId de la imagen en MongoDB

  // Nuevo campo para la fecha de publicación
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_publicacion: Date;

  // Nuevo campo para el número de descargas
  @Column({ type: 'int', default: 0 })
  @IsNumber()
  numero_descargas: number;
}
