import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MenuItem,
  MenuItemDocument,
} from '../menu-items/schemas/menu-item.schema';
import { CreateRestaurantOfferDto } from './dto/create-restaurant-offer.dto';
import { UpdateRestaurantOfferDto } from './dto/update-restaurant-offer.dto';
import {
  RestaurantOffer,
  RestaurantOfferDiscountType,
  RestaurantOfferDocument,
} from './schemas/restaurant-offer.schema';

const MENU_ITEM_SELECT =
  'name description price image heroImage category restaurantId';

@Injectable()
export class RestaurantOffersService {
  constructor(
    @InjectModel(RestaurantOffer.name)
    private readonly offerModel: Model<RestaurantOfferDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
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
    return this.findOne(String(saved._id));
  }

  async findAll(restaurantId?: string): Promise<RestaurantOffer[]> {
    const filter: Record<string, unknown> = {};
    if (restaurantId) {
      filter.restaurantId = new Types.ObjectId(restaurantId);
    }

    const offers = await this.offerModel
      .find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()
      .exec();

    return this.hydrateOffers(offers);
  }

  /** პუბლიკური: მხოლოდ აქტიური და ვადაში */
  async findActiveByRestaurant(
    restaurantId: string,
  ): Promise<RestaurantOffer[]> {
    if (!restaurantId || !Types.ObjectId.isValid(restaurantId)) {
      throw new BadRequestException('არასწორი რესტორნის ID');
    }

    const now = new Date();
    const offers = await this.offerModel
      .find({
        restaurantId: new Types.ObjectId(restaurantId),
        isActive: true,
        $and: [
          {
            $or: [
              { startsAt: { $exists: false } },
              { startsAt: null },
              { startsAt: { $lte: now } },
            ],
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
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()
      .exec();

    return this.hydrateOffers(offers);
  }

  async findOne(id: string): Promise<RestaurantOffer> {
    const offer = await this.offerModel.findById(id).lean().exec();

    if (!offer) {
      throw new NotFoundException(`შეთავაზება ID ${id} ვერ მოიძებნა`);
    }

    const [hydrated] = await this.hydrateOffers([offer]);
    return hydrated;
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
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`შეთავაზება ID ${id} ვერ მოიძებნა`);
    }

    const [hydrated] = await this.hydrateOffers([updated]);
    return hydrated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.offerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`შეთავაზება ID ${id} ვერ მოიძებნა`);
    }
  }

  /** menuItemIds-ს ცალკე ვტვირთავთ (populate Nest-ში საიმედოდ არ მუშაობდა) */
  private async hydrateOffers(
    offers: Array<Record<string, unknown>>,
  ): Promise<RestaurantOffer[]> {
    const allIds = new Set<string>();
    for (const offer of offers) {
      const ids = (offer.menuItemIds as unknown[]) || [];
      for (const id of ids) {
        allIds.add(String(id));
      }
    }

    if (allIds.size === 0) {
      return offers as unknown as RestaurantOffer[];
    }

    const items = await this.menuItemModel
      .find({ _id: { $in: [...allIds].map((id) => new Types.ObjectId(id)) } })
      .select(MENU_ITEM_SELECT)
      .lean()
      .exec();

    const byId = new Map(items.map((item) => [String(item._id), item]));

    return offers.map((offer) => {
      const ids = (offer.menuItemIds as unknown[]) || [];
      return {
        ...offer,
        menuItemIds: ids
          .map((id) => byId.get(String(id)))
          .filter(Boolean),
      } as unknown as RestaurantOffer;
    });
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
