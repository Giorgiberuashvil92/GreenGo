import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantOfferDto } from './create-restaurant-offer.dto';

export class UpdateRestaurantOfferDto extends PartialType(
  CreateRestaurantOfferDto,
) {}
