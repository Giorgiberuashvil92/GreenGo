import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CouriersModule } from '../couriers/couriers.module';
import { PaymentsModule } from '../payments/payments.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { Restaurant, RestaurantSchema } from '../restaurants/schemas/restaurant.schema';
import { UsersModule } from '../users/users.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
    AuthModule,
    CouriersModule,
    UsersModule,
    PromoCodesModule,
    PaymentsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
