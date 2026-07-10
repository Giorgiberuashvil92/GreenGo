import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DuplicateLocationDto {
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class DuplicateRestaurantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  businessUsername: string;

  @IsString()
  businessPassword: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ValidateNested()
  @Type(() => DuplicateLocationDto)
  @IsOptional()
  location?: DuplicateLocationDto;
}
