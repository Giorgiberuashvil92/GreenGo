import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentIntentDocument = PaymentIntent & Document;

@Schema({ timestamps: true })
export class PaymentIntent {
  @Prop({ type: Types.ObjectId, required: true })
  orderId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  flittOrderId: string;

  @Prop({ type: Object, required: true })
  orderPayload: Record<string, unknown>;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ['pending', 'paid', 'failed'], default: 'pending' })
  status: 'pending' | 'paid' | 'failed';

  @Prop()
  flittPaymentId?: string;
}

export const PaymentIntentSchema = SchemaFactory.createForClass(PaymentIntent);
