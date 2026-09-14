import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { FlittController } from './flitt.controller';
import { FlittService } from './flitt.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }])],
  controllers: [FlittController],
  providers: [FlittService],
  exports: [FlittService],
})
export class PaymentsModule {}
