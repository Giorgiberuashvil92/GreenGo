import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';

class OrderItemDto {
  @IsString()
  menuItemId: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

class CoordinatesDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

class DeliveryAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  @IsString()
  @IsOptional()
  instructions?: string;
}

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsString()
  restaurantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsNumber()
  @Min(0)
  deliveryFee: number;

  @IsEnum(['card', 'cash', 'greengo_balance'])
  paymentMethod: 'card' | 'cash' | 'greengo_balance';

  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @IsDateString()
  estimatedDelivery: string;

  @IsString()
  @IsOptional()
  promoCode?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tip?: number;

  @IsEnum(['delivery', 'pickup'])
  @IsOptional()
  deliveryType?: 'delivery' | 'pickup';
}

