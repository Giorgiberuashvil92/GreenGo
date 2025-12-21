import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';

class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class UpdateLocationDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}

