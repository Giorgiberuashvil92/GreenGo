import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PushNotificationsService } from '../notifications/push-notifications.service';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private pushNotificationsService: PushNotificationsService,
  ) {}

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

  async updatePushToken(
    id: string,
    dto: UpdatePushTokenDto,
  ): Promise<{
    ok: true;
    pushEnabled: boolean;
    pushPlatform?: 'ios' | 'android';
  }> {
    const user = await this.findOne(id);
    const token = (dto.fcmToken || dto.pushToken || '').trim();
    if (!token) {
      throw new BadRequestException('fcmToken ან pushToken სავალდებულოა');
    }

    user.fcmToken = token;
    if (dto.pushPlatform) {
      user.pushPlatform = dto.pushPlatform;
    }
    user.pushEnabled = true;
    user.pushTokenUpdatedAt = new Date();
    if (user.preferences) {
      user.preferences.notifications = true;
    }
    await user.save();

    return {
      ok: true,
      pushEnabled: true,
      pushPlatform: user.pushPlatform,
    };
  }

  async notifyOrderStatus(params: {
    userId: string;
    orderId: string;
    status: string;
    restaurantName?: string;
  }): Promise<void> {
    if (!this.pushNotificationsService.isReady()) {
      this.logger.warn('FCM არ არის მზად — მომხმარებლის notify გამოტოვებულია');
      return;
    }

    const user = await this.userModel
      .findById(params.userId)
      .select('fcmToken pushEnabled preferences')
      .lean()
      .exec();

    if (!user?.fcmToken) {
      this.logger.log(`User ${params.userId}: FCM token არ არის`);
      return;
    }
    if (
      user.pushEnabled === false ||
      user.preferences?.notifications === false
    ) {
      this.logger.log(`User ${params.userId}: push გამორთულია`);
      return;
    }

    const copy = customerPushCopy(params.status, params.restaurantName);
    if (!copy) return;

    const result = await this.pushNotificationsService.send([
      {
        token: user.fcmToken,
        title: copy.title,
        body: copy.body,
        data: {
          type: 'order_status',
          orderId: String(params.orderId),
          status: params.status,
        },
      },
    ]);

    this.logger.log(
      `FCM customer ${params.orderId} ${params.status}: ok=${result.successCount} fail=${result.failureCount}`,
    );

    if (result.invalidTokens.length > 0) {
      await this.userModel
        .updateMany(
          { fcmToken: { $in: result.invalidTokens } },
          { $unset: { fcmToken: 1 }, $set: { pushEnabled: false } },
        )
        .exec();
    }
  }
}

function customerPushCopy(
  status: string,
  restaurantName?: string,
): { title: string; body: string } | null {
  const place = restaurantName?.trim() || 'რესტორანი';
  switch (status) {
    case 'confirmed':
      return {
        title: 'შეკვეთა დადასტურდა',
        body: `${place} იღებს თქვენს შეკვეთას`,
      };
    case 'preparing':
      return {
        title: 'მზადდება',
        body: `${place} ამზადებს თქვენს შეკვეთას`,
      };
    case 'ready':
      return {
        title: 'შეკვეთა მზადაა',
        body: 'კურიერი მალე წამოიღებს',
      };
    case 'delivering':
      return {
        title: 'კურიერი გზაშია',
        body: 'შეკვეთა მოგაწოდებათ მალე',
      };
    case 'delivered':
      return {
        title: 'მიწოდებულია',
        body: 'გმადლობთ, რომ GreenGo აირჩიეთ!',
      };
    case 'cancelled':
      return {
        title: 'შეკვეთა გაუქმდა',
        body: 'თქვენი შეკვეთა გაუქმებულია',
      };
    default:
      return null;
  }
}
