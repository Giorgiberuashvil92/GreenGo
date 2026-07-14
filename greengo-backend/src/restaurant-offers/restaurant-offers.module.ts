import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantOffersController } from './restaurant-offers.controller';
import { RestaurantOffersService } from './restaurant-offers.service';
import {
  RestaurantOffer,
  RestaurantOfferSchema,
} from './schemas/restaurant-offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RestaurantOffer.name, schema: RestaurantOfferSchema },
    ]),
  ],
  controllers: [RestaurantOffersController],
  providers: [RestaurantOffersService],
  exports: [RestaurantOffersService],
})
export class RestaurantOffersModule {}
