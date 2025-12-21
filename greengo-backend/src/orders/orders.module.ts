import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CouriersModule } from '../couriers/couriers.module';
import { Restaurant, RestaurantSchema } from '../restaurants/schemas/restaurant.schema';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
    CouriersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
