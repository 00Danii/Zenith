/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { UpdateEtiquetaDto } from './dto/update-etiqueta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Etiqueta } from './entities/etiqueta.entity';
import { Model } from 'mongoose';

@Injectable()
export class EtiquetasService {
  constructor(
    @InjectModel(Etiqueta.name)
    private readonly etiquetaModel: Model<Etiqueta>,
  ) {}

  async create(createEtiquetaDto: CreateEtiquetaDto) {
    try {
      const etiqueta = new this.etiquetaModel(createEtiquetaDto);
      await etiqueta.save();
      return etiqueta;
    } catch (error) {
      handleError(error);
    }
  }

  async findAll() {
    return await this.etiquetaModel.find().exec();
  }

  async findOne(id: string) {
    const etiqueta = await this.etiquetaModel.findById(id);
    if (!etiqueta) {
      throw new NotFoundException(`Etiqueta con ID ${id} no encontrada`);
    }
    return etiqueta;
  }

  async update(id: string, updateEtiquetaDto: UpdateEtiquetaDto) {
    const etiqueta = await this.etiquetaModel.findByIdAndUpdate(
      id,
      updateEtiquetaDto,
      { new: true, runValidators: true },
    );

    if (!etiqueta) {
      throw new NotFoundException(`Etiqueta con ID ${id} no encontrada`);
    }

    return etiqueta;
  }

  async remove(id: string) {
    const etiqueta = await this.etiquetaModel.findByIdAndDelete(id);
    if (!etiqueta) {
      throw new NotFoundException(`Etiqueta con ID ${id} no encontrada`);
    }
    return { message: `Etiqueta con ID ${id} eliminada` };
  }
}

function handleError(error: any) {
  if (error.code === 11000) {
    throw new BadRequestException(
      `La etiqueta ya existe -> ${JSON.stringify(error.keyValue)}`,
    );
  }
  console.log(error);
  throw new InternalServerErrorException(
    'Error en la operación -> revisar logs',
  );
}
