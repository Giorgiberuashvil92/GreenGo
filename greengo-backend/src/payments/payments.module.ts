import { BogController } from './bog.controller';
import { BogService } from './bog.service';
import {
  BogPaymentIntent,
  BogPaymentIntentSchema,
} from './schemas/bog-payment-intent.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { FlittController } from './flitt.controller';
import { FlittService } from './flitt.service';
import {
  PaymentIntent,
  PaymentIntentSchema,
} from './schemas/payment-intent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: BogPaymentIntent.name, schema: BogPaymentIntentSchema },
      { name: PaymentIntent.name, schema: PaymentIntentSchema },
    ]),
  ],
  controllers: [FlittController, BogController],
  providers: [FlittService, BogService],
  exports: [FlittService, BogService],
})
export class PaymentsModule {}
