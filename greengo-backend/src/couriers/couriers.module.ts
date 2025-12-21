import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { CouriersController } from './couriers.controller';
import { CouriersService } from './couriers.service';
import { Courier, CourierSchema } from './schemas/courier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Courier.name, schema: CourierSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    AuthModule,
  ],
  controllers: [CouriersController],
  providers: [CouriersService],
  exports: [CouriersService],
})
export class CouriersModule {}

