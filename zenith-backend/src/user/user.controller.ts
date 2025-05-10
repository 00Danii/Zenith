/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  UseGuards,
  Patch,
  Delete,
  Body,
  Req,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagenesService } from 'src/imagenes/imagenes.service';
import * as multer from 'multer';
import * as path from 'path';

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: './uploads', // Carpeta donde se guardarán las imágenes
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private readonly imagenesService: ImagenesService,
  ) {}

  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user.userId; // o req.user.id, dependiendo cómo generas el token
    const user = await this.userService.findById(userId); // ajusta según tu servicio
    return {
      nombre: user.nombre,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      coverImageUrl: user.coverImageUrl,
    };
  }

  @Patch('update')
  update(@Req() req, @Body() dto: UpdateUserDto) {
    return this.userService.update(req.user.userId, dto);
  }

  @Delete('delete')
  remove(@Req() req) {
    return this.userService.remove(req.user.userId);
  }

  // Dentro del controller o un nuevo endpoint dedicado a la subida
  @Post('upload/profile-image')
  @UseInterceptors(FileInterceptor('imagen', { storage }))
  async uploadProfileImage(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagen = await this.imagenesService.subirImagen(file);
    await this.userService.setProfileImage(req.user.userId, imagen.url);
    return { message: 'Imagen de perfil actualizada', url: imagen.url };
  }

  @Post('upload/cover-image')
  @UseInterceptors(FileInterceptor('imagen', { storage }))
  async uploadCoverImage(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagen = await this.imagenesService.subirImagen(file);
    await this.userService.setCoverImage(req.user.userId, imagen.url);
    return { message: 'Imagen de portada actualizada', url: imagen.url };
  }
}
