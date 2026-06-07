import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HomeSectionDocument = HomeSection & Document;

export type HomeSectionLayout = 'carousel' | 'list' | 'banner';

@Schema({ timestamps: true })
export class HomeSection {
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ['carousel', 'list', 'banner'], default: 'carousel' })
  layout: HomeSectionLayout;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  showSeeAll: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Restaurant' }], default: [] })
  restaurantIds: Types.ObjectId[];
}

export const HomeSectionSchema = SchemaFactory.createForClass(HomeSection);
