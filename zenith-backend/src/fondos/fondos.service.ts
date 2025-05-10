/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Fondo } from './entities/fondo.entity';
import { CreateFondoDto } from './dto/create-fondo.dto';
import { UpdateFondoDto } from './dto/update-fondo.dto';
import { PaginacionDto } from '../common/dtos/paginacion.dto';
import { Color } from 'src/colores/entities/color.entity';
import { Etiqueta } from 'src/etiquetas/entities/etiqueta.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FondosService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Fondo)
    private readonly fondoRepository: Repository<Fondo>,

    @InjectModel('Color')
    private readonly coloresModel: Model<Color>,

    @InjectModel('Etiqueta')
    private readonly etiquetasModel: Model<Etiqueta>,
  ) {}

  async create(createFondoDto: CreateFondoDto) {
    try {
      const fondo = this.fondoRepository.create(createFondoDto);
      await this.fondoRepository.save(fondo);
      return fondo;
    } catch (error) {
      this.handleExeption(error);
    }
  }

  // async findAll(paginacionDto: PaginacionDto) {
  //   const { limit = 100, offset = 0 } = paginacionDto;
  //   return await this.fondoRepository.find({ take: limit, skip: offset });
  // }

  async findAll(paginacionDto: PaginacionDto) {
    const {
      limit = 0,
      offset = 0,
      search,
      colores = [],
      etiquetas = [],
    } = paginacionDto;

    // Paso 1: Convertir nombres de colores a IDs
    const colorIds = colores.length
      ? await this.coloresModel
          .find({ nombre: { $in: colores } })
          .select('_id')
          .lean()
          .then((docs) => docs.map((d) => String(d._id)))
      : [];

    // Paso 2: Convertir nombres de etiquetas a IDs
    const etiquetaIds = etiquetas.length
      ? await this.etiquetasModel
          .find({ nombre: { $in: etiquetas } })
          .select('_id')
          .lean()
          .then((docs) => docs.map((d) => String(d._id)))
      : [];

    // Paso 3: Buscar texto en colores y etiquetas
    const colorSearchIds = await this.coloresModel
      .find({ nombre: new RegExp(search ?? '', 'i') }) // insensible a mayúsculas
      .select('_id')
      .lean()
      .then((docs) => docs.map((d) => String(d._id)));

    const etiquetaSearchIds = await this.etiquetasModel
      .find({ nombre: new RegExp(search ?? '', 'i') })
      .select('_id')
      .lean()
      .then((docs) => docs.map((d) => String(d._id)));

    // const colorSearchIds = coloresPorNombre.map((c) => String(c._id));
    // const etiquetaSearchIds = etiquetasPorNombre.map((e) => String(e._id));

    const query = this.fondoRepository
      .createQueryBuilder('fondo')
      .take(limit)
      .skip(offset);

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(fondo.titulo) LIKE :search', {
            search: `%${search.toLowerCase()}%`,
          });
          qb.orWhere('LOWER(fondo.descripcion) LIKE :search', {
            search: `%${search.toLowerCase()}%`,
          });

          if (colorSearchIds.length > 0) {
            qb.orWhere('fondo.colores && ARRAY[:...colorSearchIds]', {
              colorSearchIds,
            });
          }

          if (etiquetaSearchIds.length > 0) {
            qb.orWhere('fondo.etiquetas && ARRAY[:...etiquetaSearchIds]', {
              etiquetaSearchIds,
            });
          }
        }),
      );
    }

    if (colorIds.length > 0) {
      query.andWhere('fondo.colores && ARRAY[:...colorIds]', { colorIds });
    }

    if (etiquetaIds.length > 0) {
      query.andWhere('fondo.etiquetas && ARRAY[:...etiquetaIds]', {
        etiquetaIds,
      });
    }

    query.orderBy('fondo.fecha_publicacion', 'DESC');
    const fondos = await query.getMany();

    return fondos;
  }

  async countAll(): Promise<number> {
    try {
      return await this.fondoRepository.count();
    } catch (error) {
      this.handleExeption(error);
    }
    return 0;
  }

  async findOne(id: string): Promise<Fondo> {
    const fondo = await this.fondoRepository.findOne({ where: { id } });
    if (!fondo) {
      throw new NotFoundException(`Fondo con id ${id} no encontrado`);
    }
    return fondo;
  }

  async update(id: string, updateFondoDto: UpdateFondoDto) {
    // const fondo = await this.findOne(id);
    // Object.assign(fondo, updateFondoDto);
    // return await this.fondoRepository.save(fondo);

    const fondo = await this.fondoRepository.preload({ id, ...updateFondoDto });
    if (!fondo) throw new NotFoundException(`Fondo con id ${id} no encontrado`);
    return await this.fondoRepository.save(fondo);
  }

  async remove(id: string) {
    const result = await this.fondoRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Fondo con id ${id} no encontrado`);
    }
    return result;
  }

  private handleExeption(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Error del servidor');
  }

  // Recomendados
  async getFondosRecomendados(tags: string[]) {
    // Si no hay etiquetas, devolver 8 fondos al azar
    if (!tags || tags.length === 0) {
      return await this.fondoRepository
        .createQueryBuilder('fondo')
        .orderBy('RANDOM()') // Ordenar aleatoriamente
        .take(8) // Tomar 8
        .getMany();
    }

    // Buscar IDs de etiquetas por nombre
    const etiquetaIds = await this.etiquetasModel
      .find({ nombre: { $in: tags } })
      .select('_id')
      .lean()
      .then((docs) => docs.map((d) => String(d._id)));

    // Si no se encontraron IDs para las etiquetas, devolver array vacío
    if (etiquetaIds.length === 0) return [];

    // Buscar fondos que contengan alguna de las etiquetas, ordenar aleatoriamente y tomar 8
    return await this.fondoRepository
      .createQueryBuilder('fondo')
      .where('fondo.etiquetas && ARRAY[:...etiquetaIds]', { etiquetaIds })
      .orderBy('RANDOM()') // Ordenar aleatoriamente
      .limit(8) // Limitar a 8 resultados
      .getMany();
  }

  // Nuevos métodos para los endpoints
  async getTotalDescargas(): Promise<number> {
    try {
      const result = await this.fondoRepository
        .createQueryBuilder('fondo')
        .select('SUM(fondo.numero_descargas)', 'total')
        .getRawOne();
      return result?.total || 0;
    } catch (error) {
      this.handleExeption(error);
    }
    return 0;
  }

  async getFondosMasDescargados(): Promise<Fondo[]> {
    try {
      return await this.fondoRepository
        .createQueryBuilder('fondo')
        .where('fondo.numero_descargas > 0')
        .orderBy('fondo.numero_descargas', 'DESC')
        .take(15)
        .getMany();
    } catch (error) {
      this.handleExeption(error);
    }
    return [];
  }

  async getEtiquetasPopularesDesdeFondosDescargados(): Promise<any[]> {
    try {
      const fondosMasDescargados = await this.getFondosMasDescargados();
      const etiquetasIds = fondosMasDescargados.flatMap(
        (fondo) => fondo.etiquetas,
      );
      const counts: { [key: string]: number } = {};

      etiquetasIds.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });

      const etiquetas = await this.etiquetasModel.find({
        _id: { $in: Object.keys(counts) },
      });

      return etiquetas
        .map((etiqueta) => ({
          etiqueta: etiqueta.nombre,
          count: counts[String(etiqueta._id)] || 0,
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      this.handleExeption(error);
    }

    return [];
  }

  async getColoresPopularesDesdeFondosDescargados(): Promise<any[]> {
    try {
      const fondosMasDescargados = await this.getFondosMasDescargados();
      const colores = fondosMasDescargados.flatMap((fondo) => fondo.colores);
      const counts: { [key: string]: number } = {};

      colores.forEach((color) => {
        counts[color] = (counts[color] || 0) + 1;
      });

      const coloresData = await this.coloresModel.find({
        _id: { $in: Object.keys(counts) },
      });

      return coloresData
        .map((color) => ({
          color: color.nombre,
          count: counts[String(color._id)] || 0,
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      this.handleExeption(error);
    }

    return [];
  }

  /**
   * Incrementa el número de descargas de un fondo específico.
   * @param id - ID del fondo a actualizar.
   * @param incremento - Cantidad a incrementar.
   * @returns El fondo actualizado.
   */
  async incrementarDescargas(id: string, incremento: number): Promise<Fondo> {
    if (!incremento || typeof incremento !== 'number') {
      throw new BadRequestException('El incremento debe ser un número válido.');
    }

    const fondo = await this.fondoRepository.findOne({ where: { id } });
    if (!fondo) {
      throw new NotFoundException(`Fondo con id ${id} no encontrado`);
    }

    fondo.numero_descargas += incremento;

    try {
      return await this.fondoRepository.save(fondo);
    } catch (error) {
      this.handleExeption(error);
    }

    // Ensure a return statement in case of an unexpected error
    throw new InternalServerErrorException(
      'No se pudo incrementar las descargas.',
    );
  }
}
