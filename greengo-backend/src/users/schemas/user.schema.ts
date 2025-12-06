import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop()
  name?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  email?: string;

  @Prop()
  profileImage?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({
    type: {
      language: { type: String, enum: ['ka', 'en'], default: 'ka' },
      notifications: { type: Boolean, default: true },
    },
    default: {
      language: 'ka',
      notifications: true,
    },
  })
  preferences: {
    language: 'ka' | 'en';
    notifications: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

