import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { FlittController } from './flitt.controller';
import { FlittService } from './flitt.service';
import { PaymentIntent, PaymentIntentSchema } from './schemas/payment-intent.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Order.name, schema: OrderSchema },
    { name: PaymentIntent.name, schema: PaymentIntentSchema },
  ])],
  controllers: [FlittController],
  providers: [FlittService],
  exports: [FlittService],
})
export class PaymentsModule {}
