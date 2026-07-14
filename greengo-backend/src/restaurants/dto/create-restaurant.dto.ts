import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsObject,
  IsMongoId,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;
}

class ContactDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;
}

class MenuCategoryDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

class FeaturesDto {
  @IsBoolean()
  @IsOptional()
  hasDelivery?: boolean;

  @IsBoolean()
  @IsOptional()
  hasPickup?: boolean;

  @IsBoolean()
  @IsOptional()
  hasDineIn?: boolean;

  @IsBoolean()
  @IsOptional()
  acceptsOnlineOrders?: boolean;

  @IsBoolean()
  @IsOptional()
  hasParking?: boolean;

  @IsBoolean()
  @IsOptional()
  isWheelchairAccessible?: boolean;
}

export class CreateRestaurantDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rating?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reviewCount?: number;

  @IsNumber()
  @Min(0)
  deliveryFee: number;

  @IsString()
  deliveryTime: string;

  @IsString()
  image: string;

  @IsString()
  heroImage: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  businessUsername?: string;

  @IsString()
  @IsOptional()
  businessPassword?: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ValidateNested()
  @Type(() => ContactDto)
  @IsOptional()
  contact?: ContactDto;

  @IsObject()
  @IsOptional()
  workingHours?: { [key: string]: string };

  @ValidateNested()
  @Type(() => FeaturesDto)
  @IsOptional()
  features?: FeaturesDto;

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuCategoryDto)
  @IsOptional()
  menuCategories?: MenuCategoryDto[];

  @IsString()
  @IsOptional()
  priceRange?: '€' | '€€' | '€€€' | '€€€€';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cuisine?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergens?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  paymentMethods?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  listPreviewMenuItemIds?: string[];
}

