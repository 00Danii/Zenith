import { Module } from '@nestjs/common';
import { FondosService } from './fondos.service';
import { FondosController } from './fondos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { Fondo } from './entities/fondo.entity';

// Importa directamente la clase y el schema
import { Color, ColorSchema } from 'src/colores/entities/color.entity';
import {
  Etiqueta,
  EtiquetaSchema,
} from 'src/etiquetas/entities/etiqueta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fondo]),
    MongooseModule.forFeature([
      { name: Color.name, schema: ColorSchema },
      { name: Etiqueta.name, schema: EtiquetaSchema },
    ]),
  ],
  controllers: [FondosController],
  providers: [FondosService],
})
export class FondosModule {}
