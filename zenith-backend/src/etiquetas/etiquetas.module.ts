import { Module } from '@nestjs/common';
import { EtiquetasService } from './etiquetas.service';
import { EtiquetasController } from './etiquetas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Etiqueta, EtiquetaSchema } from './entities/etiqueta.entity';

@Module({
  controllers: [EtiquetasController],
  providers: [EtiquetasService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Etiqueta.name,
        schema: EtiquetaSchema,
      },
    ]),
  ],
})
export class EtiquetasModule {}
