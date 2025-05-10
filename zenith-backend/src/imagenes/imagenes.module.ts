import { Module } from '@nestjs/common';
import { ImagenesService } from './imagenes.service';
import { ImagenesController } from './imagenes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Imagen, ImagenSchema } from './entities/imagen.entity';

@Module({
  controllers: [ImagenesController],
  providers: [ImagenesService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Imagen.name,
        schema: ImagenSchema,
      },
    ]),
  ],
  exports: [ImagenesService],
})
export class ImagenesModule {}
