import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FondosModule } from './fondos/fondos.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ImagenesModule } from './imagenes/imagenes.module';
import { EtiquetasModule } from './etiquetas/etiquetas.module';
import { ColoresModule } from './colores/colores.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/zenithDBMongo'),
    FondosModule,
    CommonModule,
    ImagenesModule,
    EtiquetasModule,
    ColoresModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
