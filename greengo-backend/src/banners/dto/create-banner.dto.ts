import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateBannerDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  oldPrice?: string;

  @IsString()
  @IsOptional()
  newPrice?: string;

  @IsString()
  image: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsOptional()
  @ValidateIf((_, value) => value != null && value !== '')
  @IsMongoId()
  restaurantId?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  placement?: 'top' | 'mid';

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
