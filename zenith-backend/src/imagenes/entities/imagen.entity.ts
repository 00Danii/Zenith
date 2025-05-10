import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Imagen extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true, enum: ['mobile', 'desktop'] })
  tipo: 'mobile' | 'desktop';
}

export const ImagenSchema = SchemaFactory.createForClass(Imagen);
