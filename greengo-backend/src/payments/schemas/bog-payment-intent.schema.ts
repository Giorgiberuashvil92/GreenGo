import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type BogPaymentIntentDocument = BogPaymentIntent & Document;
@Schema({ timestamps: true })
export class BogPaymentIntent {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  orderId: Types.ObjectId;
  @Prop({ unique: true, sparse: true })
  bogOrderId?: string;
  @Prop({ required: true })
  statusToken: string;
  @Prop({ type: Object, required: true })
  orderPayload: Record<string, unknown>;
  @Prop({ required: true })
  amount: number;
  @Prop({ enum: ['pending', 'paid', 'failed'], default: 'pending' })
  status: 'pending' | 'paid' | 'failed';
}
export const BogPaymentIntentSchema =
  SchemaFactory.createForClass(BogPaymentIntent);
