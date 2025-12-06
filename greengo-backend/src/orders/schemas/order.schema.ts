import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({
    type: [
      {
        menuItemId: { type: Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        specialInstructions: String,
      },
    ],
    required: true,
  })
  items: Array<{
    menuItemId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }>;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  deliveryFee: number;

  @Prop({
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'delivering',
      'delivered',
      'cancelled',
    ],
    default: 'pending',
  })
  status: string;

  @Prop({
    enum: ['card', 'cash', 'greengo_balance'],
    required: true,
  })
  paymentMethod: string;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      instructions: String,
    },
    required: true,
  })
  deliveryAddress: {
    street: string;
    city: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
  };

  @Prop({ default: Date.now })
  orderDate: Date;

  @Prop({ required: true })
  estimatedDelivery: Date;

  @Prop()
  actualDelivery?: Date;

  @Prop()
  promoCode?: string;

  @Prop()
  notes?: string;

  @Prop({ default: 0 })
  tip?: number;

  @Prop({
    enum: ['delivery', 'pickup'],
    default: 'delivery',
  })
  deliveryType?: 'delivery' | 'pickup';
}

export const OrderSchema = SchemaFactory.createForClass(Order);

