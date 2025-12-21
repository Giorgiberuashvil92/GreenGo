import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourierDocument = Courier & Document;

@Schema({ timestamps: true })
export class Courier {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop()
  email?: string;

  @Prop()
  profileImage?: string;

  @Prop({
    enum: ['available', 'busy', 'offline'],
    default: 'offline',
  })
  status: 'available' | 'busy' | 'offline';

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
    lastUpdated: {
      type: Date,
    },
    _id: false, // Don't create _id for subdocument
  })
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number];
    lastUpdated: Date;
  };

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  currentOrderId?: Types.ObjectId;

  @Prop({ default: 0 })
  totalDeliveries: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CourierSchema = SchemaFactory.createForClass(Courier);

// Create 2dsphere index for geospatial queries (sparse - only indexes documents with currentLocation)
CourierSchema.index({ 'currentLocation': '2dsphere' }, { sparse: true });

// Helper method to get latitude and longitude
CourierSchema.methods.getLocation = function() {
  if (!this.currentLocation || !this.currentLocation.coordinates) {
    return null;
  }
  return {
    latitude: this.currentLocation.coordinates[1],
    longitude: this.currentLocation.coordinates[0],
    lastUpdated: this.currentLocation.lastUpdated,
  };
};

