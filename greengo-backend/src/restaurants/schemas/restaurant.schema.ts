import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ required: true })
  deliveryFee: number;

  @Prop({ required: true })
  deliveryTime: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  heroImage: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: {
      latitude: Number,
      longitude: Number,
      address: String,
      city: String,
      district: String,
      postalCode: String,
    },
    required: true,
  })
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    district?: string;
    postalCode?: string;
  };

  @Prop({
    type: {
      phone: String,
      email: String,
      website: String,
    },
  })
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };

  @Prop({ type: Map, of: String })
  workingHours?: { [key: string]: string };

  @Prop({
    type: {
      hasDelivery: { type: Boolean, default: true },
      hasPickup: { type: Boolean, default: false },
      hasDineIn: { type: Boolean, default: false },
      acceptsOnlineOrders: { type: Boolean, default: true },
      hasParking: { type: Boolean, default: false },
      isWheelchairAccessible: { type: Boolean, default: false },
    },
  })
  features?: {
    hasDelivery: boolean;
    hasPickup: boolean;
    hasDineIn: boolean;
    acceptsOnlineOrders: boolean;
    hasParking: boolean;
    isWheelchairAccessible: boolean;
  };

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ enum: ['€', '€€', '€€€', '€€€€'], default: '€€' })
  priceRange: string;

  @Prop({ type: [String], default: [] })
  cuisine: string[];

  @Prop({ type: [String], default: [] })
  allergens: string[];

  @Prop({ type: [String], default: [] })
  paymentMethods: string[];
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

