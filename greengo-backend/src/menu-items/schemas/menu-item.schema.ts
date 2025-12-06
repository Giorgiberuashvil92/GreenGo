import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  image: string;

  @Prop()
  heroImage?: string;

  @Prop({ required: true })
  category: string;

  @Prop({ default: false })
  isPopular: boolean;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({
    type: [
      {
        id: String,
        name: String,
        icon: String,
        canRemove: Boolean,
        isDefault: Boolean,
      },
    ],
  })
  ingredients?: Array<{
    id: string;
    name: string;
    icon: string;
    canRemove: boolean;
    isDefault: boolean;
  }>;

  @Prop({
    type: [
      {
        id: String,
        name: String,
        price: Number,
        image: String,
      },
    ],
  })
  drinks?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

