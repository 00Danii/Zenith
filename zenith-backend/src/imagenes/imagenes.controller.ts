/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagenesService } from './imagenes.service';
// import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';
import * as multer from 'multer';
import * as path from 'path';
import { Response } from 'express';

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: './uploads', // Carpeta donde se guardarán las imágenes
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

@Controller('imagenes')
export class ImagenesController {
  constructor(private readonly imagenesService: ImagenesService) {}

  // @Post()
  // create(@Body() createImagenDto: CreateImagenDto) {
  //   return this.imagenesService.create(createImagenDto);
  // }

  @Get()
  findAll() {
    return this.imagenesService.findAll();
  }

  @Get('original/:id')
  getOriginalImage(@Param('id') id: string, @Res() res: Response) {
    return this.imagenesService.getOriginalImageById(id, res);
  }

  @Get('resized/:id')
  getResizedImage(@Param('id') id: string, @Res() res: Response) {
    return this.imagenesService.getResizedImageById(id, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imagenesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImagenDto: UpdateImagenDto) {
    return this.imagenesService.update(id, updateImagenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagenesService.remove(id);
  }

  /**
   * Nuevo endpoint para subir imágenes.
   */
  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage }))
  async subirImagen(@UploadedFile() file: Express.Multer.File) {
    return this.imagenesService.subirImagen(file);
  }
}
