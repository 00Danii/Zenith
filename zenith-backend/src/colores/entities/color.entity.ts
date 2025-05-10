import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Color extends Document {
  @Prop({
    unique: true,
    required: true,
  })
  nombre: string;
}

export const ColorSchema = SchemaFactory.createForClass(Color);
