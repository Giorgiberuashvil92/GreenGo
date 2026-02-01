import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true })
  title: string;

  @Prop()
  oldPrice?: string;

  @Prop()
  newPrice?: string;

  @Prop({ required: true })
  image: string; // URL or path to image

  @Prop()
  description?: string;

  @Prop()
  link?: string; // Optional link when banner is clicked

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number; // For sorting/ordering banners

  @Prop()
  startDate?: Date; // When banner should start showing

  @Prop()
  endDate?: Date; // When banner should stop showing
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
