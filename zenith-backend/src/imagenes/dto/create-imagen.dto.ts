import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateImagenDto {
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsNumber()
  @IsPositive()
  width: number;

  @IsNumber()
  @IsPositive()
  height: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['mobile', 'desktop'])
  tipo: 'mobile' | 'desktop';
}
