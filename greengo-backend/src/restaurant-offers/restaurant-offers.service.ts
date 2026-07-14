import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateRestaurantOfferDto } from './dto/create-restaurant-offer.dto';
import { UpdateRestaurantOfferDto } from './dto/update-restaurant-offer.dto';
import {
  RestaurantOffer,
  RestaurantOfferDiscountType,
  RestaurantOfferDocument,
} from './schemas/restaurant-offer.schema';

const MENU_ITEM_POPULATE = {
  path: 'menuItemIds',
  select: 'name description price image heroImage category restaurantId',
};

@Injectable()
export class RestaurantOffersService {
  constructor(
    @InjectModel(RestaurantOffer.name)
    private readonly offerModel: Model<RestaurantOfferDocument>,
  ) {}

  async create(dto: CreateRestaurantOfferDto): Promise<RestaurantOffer> {
    this.assertDiscount(dto.discountType, dto.discountValue, dto.menuItemIds);

    const created = new this.offerModel({
      restaurantId: new Types.ObjectId(dto.restaurantId),
      title: dto.title.trim(),
      description: dto.description?.trim(),
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      menuItemIds: (dto.menuItemIds ?? []).map((id) => new Types.ObjectId(id)),
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    const saved = await created.save();
    return this.offerModel
      .findById(saved._id)
      .populate(MENU_ITEM_POPULATE)
      .exec() as Promise<RestaurantOffer>;
  }

  async findAll(restaurantId?: string): Promise<RestaurantOffer[]> {
    const filter: Record<string, unknown> = {};
    if (restaurantId) {
      filter.restaurantId = new Types.ObjectId(restaurantId);
    }

    return this.offerModel
      .find(filter)
      .populate(MENU_ITEM_POPULATE)
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  /** პუბლიკური: მხოლოდ აქტიური და ვადაში */
  async findActiveByRestaurant(
    restaurantId: string,
  ): Promise<RestaurantOffer[]> {
    if (!restaurantId || !Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestException('არასწორი რესტორნის ID');
    }

    const now = new Date();
    return this.offerModel
      .find({
        restaurantId: new Types.ObjectId(restaurantId),
        isActive: true,
        $and: [
          {
            $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }],
          },
          {
            $or: [
              { expiresAt: { $exists: false } },
              { expiresAt: null },
              { expiresAt: { $gte: now } },
            ],
          },
        ],
      })
      .populate(MENU_ITEM_POPULATE)
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<RestaurantOffer> {
    const offer = await this.offerModel
      .findById(id)
      .populate(MENU_ITEM_POPULATE)
      .exec();

    if (!offer) {
      throw new NotFoundException(`შეთავაზება ID ${id} ვერ მოიძებნა`);
    }
    return offer;
  }

  async update(
    id: string,
    dto: UpdateRestaurantOfferDto,
  ): Promise<RestaurantOffer> {
    const existing = await this.findOne(id);
    const nextType =
      (dto.discountType as RestaurantOfferDiscountType | undefined) ??
      existing.discountType;
    const nextValue = dto.discountValue ?? existing.discountValue;
    const nextMenuIds =
      dto.menuItemIds ??
      (existing.menuItemIds || []).map((item) =>
        typeof item === 'object' && item && '_id' in item
          ? String((item as { _id: Types.ObjectId })._id)
          : String(item),
      );

    this.assertDiscount(nextType, nextValue, nextMenuIds);

    const payload: Record<string, unknown> = { ...dto };
    if (dto.restaurantId) {
      payload.restaurantId = new Types.ObjectId(dto.restaurantId);
    }
    if (dto.title != null) {
      payload.title = dto.title.trim();
    }
    if (dto.description != null) {
      payload.description = dto.description.trim();
    }
    if (dto.menuItemIds) {
      payload.menuItemIds = dto.menuItemIds.map(
        (mid) => new Types.ObjectId(mid),
      );
    }
    if (dto.startsAt) {
      payload.startsAt = new Date(dto.startsAt);
    }
    if (dto.expiresAt) {
      payload.expiresAt = new Date(dto.expiresAt);
    }

    const updated = await this.offerModel
      .findByIdAndUpdate(id, payload, { new: true })
      .populate(MENU_ITEM_POPULATE)
      .exec();

    if (!updated) {
      throw new NotFoundException(`შეთავაზება ID ${id} ვერ მოიძებნა`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.offerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`შეთავაზება ID ${id} ვერ მოიძებნა`);
    }
  }

  private assertDiscount(
    discountType: RestaurantOfferDiscountType,
    discountValue: number,
    menuItemIds?: string[],
  ): void {
    if (discountType === 'percentage') {
      if (discountValue <= 0 || discountValue > 100) {
        throw new BadRequestException(
          'პროცენტული ფასდაკლება უნდა იყოს 1-100 შორის',
        );
      }
      if (!menuItemIds || menuItemIds.length === 0) {
        throw new BadRequestException(
          'პროცენტული შეთავაზებისთვის აირჩიეთ მინიმუმ ერთი პროდუქტი',
        );
      }
      return;
    }

    if (discountType === 'delivery_fixed' && discountValue <= 0) {
      throw new BadRequestException(
        'მიტანის ფასდაკლება უნდა იყოს 0-ზე მეტი',
      );
    }
  }
}
