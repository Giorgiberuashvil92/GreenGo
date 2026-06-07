import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: any): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`მომხმარებელი ID ${id} ვერ მოიძებნა`);
    }
    return user;
  }

  async findByPhone(phoneNumber: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phoneNumber }).exec();
  }

  async update(id: string, updateUserDto: any): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`მომხმარებელი ID ${id} ვერ მოიძებნა`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`მომხმარებელი ID ${id} ვერ მოიძებნა`);
    }
  }

  private mapPaymentCard(card: {
    _id?: { toString(): string };
    type: 'visa' | 'mastercard' | 'amex';
    lastFour: string;
    maskedNumber: string;
    isPrimary?: boolean;
  }) {
    return {
      id: card._id?.toString() || '',
      type: card.type,
      lastFour: card.lastFour,
      maskedNumber: card.maskedNumber,
      isPrimary: !!card.isPrimary,
    };
  }

  async getPaymentCards(userId: string) {
    const user = await this.findOne(userId);
    return (user.paymentCards || []).map((card) =>
      this.mapPaymentCard(card as any),
    );
  }

  private detectCardType(digits: string): 'visa' | 'mastercard' | 'amex' {
    if (/^4/.test(digits)) return 'visa';
    if (/^3[47]/.test(digits)) return 'amex';
    return 'mastercard';
  }

  async addPaymentCard(userId: string, cardNumber: string) {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) {
      throw new BadRequestException('არასწორი ბარათის ნომერი');
    }
    const lastFour = digits.slice(-4);
    const type = this.detectCardType(digits);

    const user = await this.findOne(userId);
    const cards = user.paymentCards || [];
    const isFirst = cards.length === 0;
    const maskedNumber = `**** ${lastFour}`;

    user.paymentCards.push({
      type,
      lastFour,
      maskedNumber,
      isPrimary: isFirst,
    } as any);

    await user.save();
    const added = user.paymentCards[user.paymentCards.length - 1];
    return this.mapPaymentCard(added as any);
  }

  async deletePaymentCard(userId: string, cardId: string) {
    const user = await this.findOne(userId);
    const card = (user.paymentCards as any)?.id?.(cardId);
    if (!card) {
      throw new NotFoundException('ბარათი ვერ მოიძებნა');
    }
    const wasPrimary = card.isPrimary;
    card.deleteOne();
    if (wasPrimary && user.paymentCards.length > 0) {
      user.paymentCards[0].isPrimary = true;
    }
    await user.save();
    return { success: true };
  }

  async setPrimaryPaymentCard(userId: string, cardId: string) {
    const user = await this.findOne(userId);
    let found = false;
    for (const card of user.paymentCards || []) {
      const isTarget = (card as any)._id?.toString() === cardId;
      card.isPrimary = isTarget;
      if (isTarget) found = true;
    }
    if (!found) {
      throw new NotFoundException('ბარათი ვერ მოიძებნა');
    }
    await user.save();
    return this.getPaymentCards(userId);
  }
}
