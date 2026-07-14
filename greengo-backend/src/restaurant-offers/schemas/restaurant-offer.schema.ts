import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantOfferDocument = RestaurantOffer & Document;

export type RestaurantOfferDiscountType = 'percentage' | 'delivery_fixed';

@Schema({ timestamps: true })
export class RestaurantOffer {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    enum: ['percentage', 'delivery_fixed'],
    required: true,
  })
  discountType: RestaurantOfferDiscountType;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'MenuItem' }], default: [] })
  menuItemIds: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop()
  startsAt?: Date;

  @Prop()
  expiresAt?: Date;
}

export const RestaurantOfferSchema =
  SchemaFactory.createForClass(RestaurantOffer);

RestaurantOfferSchema.index({ restaurantId: 1, isActive: 1, sortOrder: 1 });
