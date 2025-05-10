/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Color } from './entities/color.entity';
import { Model } from 'mongoose';

@Injectable()
export class ColoresService {
  constructor(
    @InjectModel(Color.name)
    private readonly colorModel: Model<Color>,
  ) {}

  async create(createColorDto: CreateColorDto) {
    try {
      const color = new this.colorModel(createColorDto);
      await color.save();
      return color;
    } catch (error) {
      handleError(error);
    }
  }

  async findAll() {
    return await this.colorModel.find().exec();
  }

  async findOne(id: string) {
    const color = await this.colorModel.findById(id);
    if (!color) {
      throw new NotFoundException(`Color con ID ${id} no encontrado`);
    }
    return color;
  }

  async update(id: string, updateColorDto: UpdateColorDto) {
    const color = await this.colorModel.findByIdAndUpdate(id, updateColorDto, {
      new: true, // Retorna el documento actualizado
      runValidators: true, // Aplica validaciones
    });

    if (!color) {
      throw new NotFoundException(`Color con ID ${id} no encontrado`);
    }

    return color;
  }

  async remove(id: string) {
    const color = await this.colorModel.findByIdAndDelete(id);
    if (!color) {
      throw new NotFoundException(`Color con ID ${id} no encontrado`);
    }
    return { message: `Color con ID ${id} eliminado` };
  }
}

function handleError(error: any) {
  if (error.code === 11000) {
    throw new BadRequestException(
      `El color ya existe -> ${JSON.stringify(error.keyValue)}`,
    );
  }
  console.log(error);
  throw new InternalServerErrorException(
    'Error en la operación -> revisar logs',
  );
}
