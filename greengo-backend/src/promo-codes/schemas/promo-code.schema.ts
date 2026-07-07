import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PromoCodeDocument = PromoCode & Document;

@Schema({ timestamps: true })
export class PromoCode {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop()
  description?: string;

  @Prop({
    enum: ['percentage', 'free_delivery', 'fixed_total', 'fixed'],
    required: true,
  })
  discountType: 'percentage' | 'free_delivery' | 'fixed_total' | 'fixed';

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ default: 0, min: 0 })
  minOrderAmount: number;

  @Prop({ min: 0 })
  maxDiscount?: number;

  @Prop()
  startsAt?: Date;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ min: 1 })
  usageLimit?: number;

  @Prop({ default: 0, min: 0 })
  usedCount: number;
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);
