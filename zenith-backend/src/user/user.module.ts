import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { ImagenesModule } from '../imagenes/imagenes.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ImagenesModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
