import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CreateCourierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsEnum(['available', 'busy', 'offline'])
  @IsOptional()
  status?: 'available' | 'busy' | 'offline';

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  currentLocation?: LocationDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

