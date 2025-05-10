/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FondosService } from './fondos.service';
import { CreateFondoDto } from './dto/create-fondo.dto';
import { UpdateFondoDto } from './dto/update-fondo.dto';
import { PaginacionDto } from 'src/common/dtos/paginacion.dto';

@Controller('fondos')
export class FondosController {
  constructor(private readonly fondosService: FondosService) {}

  @Post()
  create(@Body() createFondoDto: CreateFondoDto) {
    return this.fondosService.create(createFondoDto);
  }

  @Get()
  findAll(@Query() paginacionDto: PaginacionDto) {
    return this.fondosService.findAll(paginacionDto);
  }

  @Get('total')
  countAll() {
    return this.fondosService.countAll();
  }

  @Get('recomendados')
  getFondosRecomendados(@Query('etiquetas') tags: string) {
    const tagList = tags?.split(',') ?? [];
    return this.fondosService.getFondosRecomendados(tagList);
  }

  // Nuevos endpoints
  @Get('total-descargas')
  getTotalDescargas() {
    return this.fondosService.getTotalDescargas();
  }

  @Get('mas-descargados')
  getFondosMasDescargados() {
    return this.fondosService.getFondosMasDescargados();
  }

  @Get('etiquetas-populares')
  getEtiquetasPopulares() {
    return this.fondosService.getEtiquetasPopularesDesdeFondosDescargados();
  }

  @Get('colores-populares')
  getColoresPopulares() {
    return this.fondosService.getColoresPopularesDesdeFondosDescargados();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fondosService.findOne(id);
  }

  @Patch(':id/descargas')
  incrementarDescargas(
    @Param('id') id: string,
    @Body('incremento') incremento: number,
  ) {
    return this.fondosService.incrementarDescargas(id, incremento);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFondoDto: UpdateFondoDto) {
    return this.fondosService.update(id, updateFondoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fondosService.remove(id);
  }
}
