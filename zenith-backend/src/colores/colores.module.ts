import { Module } from '@nestjs/common';
import { ColoresService } from './colores.service';
import { ColoresController } from './colores.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Color, ColorSchema } from './entities/color.entity';

@Module({
  controllers: [ColoresController],
  providers: [ColoresService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Color.name,
        schema: ColorSchema,
      },
    ]),
  ],
})
export class ColoresModule {}
