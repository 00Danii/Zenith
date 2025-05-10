/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';
import { Model } from 'mongoose';
import { Imagen } from './entities/imagen.entity';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
// import * as path from 'path';
import * as sharp from 'sharp';
import * as path from 'path';
import { Response } from 'express';

@Injectable()
export class ImagenesService {
  constructor(
    @InjectModel(Imagen.name)
    private readonly imagenModel: Model<Imagen>,
  ) {}

  async create(createImagenDto: CreateImagenDto) {
    try {
      const imagen = new this.imagenModel(createImagenDto);
      await imagen.save();
      return imagen;
    } catch (error) {
      handleError(error);
    }
  }

  async findAll() {
    return await this.imagenModel.find().exec();
  }

  async findOne(id: string) {
    const imagen = await this.imagenModel.findById(id);
    if (!imagen) {
      throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
    }
    return imagen;
  }

  async update(id: string, updateImagenDto: UpdateImagenDto) {
    const imagen = await this.imagenModel.findByIdAndUpdate(
      id,
      updateImagenDto,
      {
        new: true, // Devuelve el documento actualizado
        runValidators: true, // Valida los datos antes de actualizar
      },
    );

    if (!imagen) {
      throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
    }

    return imagen;
  }

  async remove(id: string) {
    const imagen = await this.imagenModel.findByIdAndDelete(id);
    if (!imagen) {
      throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
    }
    return { message: 'Imagen eliminada correctamente' };
  }

  /**
   * Método para subir una imagen localmente, obtener dimensiones y guardarla en la base de datos.
   */
  async subirImagen(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ninguna imagen.');
    }

    try {
      // Ruta donde se guardará la imagen
      const filePath = `uploads/${file.filename}`;

      // Obtener dimensiones de la imagen usando Sharp
      const metadata = await sharp(file.path).metadata();
      const { width, height } = metadata;

      if (!width || !height) {
        throw new BadRequestException(
          'No se pudieron obtener dimensiones de la imagen',
        );
      }

      const tipo = width >= 768 ? 'desktop' : 'mobile';

      // Generar URL local (cuando subas a Cloudinary, cambiarás esta lógica)
      const url = `http://localhost:3000/${filePath}`;

      // Guardar en MongoDB
      const nuevaImagen = new this.imagenModel({
        url,
        width,
        height,
        tipo: tipo,
      });

      await nuevaImagen.save();
      return nuevaImagen;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw new InternalServerErrorException('Error al procesar la imagen');
    }
  }

  // Método para obtener la imagen original por ID
  // y enviarla como respuesta
  async getOriginalImageById(id: string, res: Response): Promise<void> {
    const imagen = await this.imagenModel.findById(id);
    if (!imagen) {
      throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
    }

    if (!imagen.url) {
      throw new InternalServerErrorException('La imagen no tiene URL guardada');
    }

    const filename = path.basename(imagen.url);
    const imagePath = path.join(process.cwd(), 'uploads', filename);

    console.log('filename:', filename);
    console.log('imagePath:', imagePath);

    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('Archivo de imagen no encontrado');
    }

    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const buffer = await image.toBuffer();

    const shortId = id.slice(0, Math.floor(id.length / 4));
    //Este encabezado es lo que fuerza la descarga
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=zenith_${shortId}_HD.jpg`,
    );
    res.setHeader('Content-Type', `image/${metadata.format}`);

    res.send(buffer);
  }

  // Método para obtener la imagen redimensionada por ID
  // y enviarla como respuesta
  async getResizedImageById(id: string, res: Response): Promise<void> {
    const imagen = await this.imagenModel.findById(id);
    if (!imagen) {
      throw new NotFoundException(`Imagen con ID "${id}" no encontrada`);
    }

    const filename = path.basename(imagen.url);
    const imagePath = path.join(process.cwd(), 'uploads', filename);

    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('Archivo de imagen no encontrado');
    }

    const image = sharp(imagePath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new BadRequestException('No se pudo obtener tamaño de imagen');
    }

    const resizedBuffer = await image
      .resize({
        width: Math.floor(metadata.width * 0.5),
        height: Math.floor(metadata.height * 0.5),
      })
      .toBuffer();

    const shortId = id.slice(0, Math.floor(id.length / 4));
    //Este encabezado es lo que fuerza la descarga
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=zenith_${shortId}.jpg`,
    );
    res.setHeader('Content-Type', `image/${metadata.format}`);

    res.send(resizedBuffer);
  }
}

function handleError(error: any) {
  if (error.code === 11000) {
    throw new BadRequestException(
      `Imagen duplicada -> ${JSON.stringify(error.keyValue)}`,
    );
  }
  console.error(error);
  throw new InternalServerErrorException(
    'Error al procesar la solicitud -> revisar logs',
  );
}
