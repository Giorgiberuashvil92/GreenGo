import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Restaurant,
  RestaurantDocument,
} from '../restaurants/schemas/restaurant.schema';
import { UpdateHomeSectionDto } from './dto/update-home-section.dto';
import {
  HomeSection,
  HomeSectionDocument,
} from './schemas/home-section.schema';

const DEFAULT_SECTIONS: Array<{
  slug: string;
  title: string;
  layout: 'carousel' | 'list' | 'banner';
  order: number;
  showSeeAll: boolean;
}> = [
  {
    slug: 'promo-banner',
    title: 'პრომო ბანერი',
    layout: 'banner',
    order: 1,
    showSeeAll: false,
  },
  {
    slug: 'nearby',
    title: 'შენთან ახლოს',
    layout: 'carousel',
    order: 2,
    showSeeAll: true,
  },
  {
    slug: 'popular',
    title: 'პოპულარული ობიექტები',
    layout: 'carousel',
    order: 3,
    showSeeAll: true,
  },
  {
    slug: 'highest-rated',
    title: 'ყველაზე რეიტინგული',
    layout: 'carousel',
    order: 4,
    showSeeAll: true,
  },
  {
    slug: 'promo-banner-mid',
    title: 'პრომო ბანერი (შუა)',
    layout: 'banner',
    order: 5,
    showSeeAll: false,
  },
  {
    slug: 'fastest-delivery',
    title: 'ყველაზე სწრაფი მიტანა',
    layout: 'carousel',
    order: 6,
    showSeeAll: true,
  },
  {
    slug: 'discounted',
    title: 'შეღავათიანი ფასები',
    layout: 'carousel',
    order: 7,
    showSeeAll: true,
  },
  {
    slug: 'city-favorites',
    title: 'ქალაქის რჩეულები',
    layout: 'carousel',
    order: 8,
    showSeeAll: true,
  },
  {
    slug: 'all-objects',
    title: 'ყველა ობიექტი',
    layout: 'list',
    order: 9,
    showSeeAll: false,
  },
];

@Injectable()
export class HomeSectionsService implements OnModuleInit {
  constructor(
    @InjectModel(HomeSection.name)
    private readonly homeSectionModel: Model<HomeSectionDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaults();
  }

  async ensureDefaults(): Promise<void> {
    for (const section of DEFAULT_SECTIONS) {
      const { order, slug, title, layout, showSeeAll } = section;
      await this.homeSectionModel.updateOne(
        { slug },
        {
          $set: { order },
          $setOnInsert: {
            slug,
            title,
            layout,
            showSeeAll,
            isActive: true,
            restaurantIds: [],
          },
        },
        { upsert: true },
      );
    }
  }

  async findAll(): Promise<HomeSection[]> {
    await this.ensureDefaults();
    return this.homeSectionModel.find().sort({ order: 1 }).exec();
  }

  async findOne(id: string): Promise<HomeSection> {
    const section = await this.homeSectionModel.findById(id).exec();
    if (!section) {
      throw new NotFoundException(`სექცია ID ${id} ვერ მოიძებნა`);
    }
    return section;
  }

  async findActiveForApp() {
    await this.ensureDefaults();
    const sections = await this.homeSectionModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .lean()
      .exec();

    const allIds = [
      ...new Set(
        sections.flatMap((s) =>
          (s.restaurantIds ?? []).map((id) => id.toString()),
        ),
      ),
    ].filter(Boolean);

    const restaurants = allIds.length
      ? await this.restaurantModel
          .find({ _id: { $in: allIds }, isActive: true })
          .lean()
          .exec()
      : [];

    const restaurantMap = new Map(
      restaurants.map((r) => [r._id.toString(), r]),
    );

    const fallbackAll = await this.restaurantModel
      .find({ isActive: true })
      .sort({ rating: -1 })
      .limit(50)
      .lean()
      .exec();

    return sections
      .map((section) => {
        const ids = (section.restaurantIds ?? []).map((id) => id.toString());
        let resolvedRestaurants = ids
          .map((id) => restaurantMap.get(id))
          .filter(Boolean);

        if (
          section.layout !== 'banner' &&
          resolvedRestaurants.length === 0 &&
          section.slug === 'all-objects'
        ) {
          resolvedRestaurants = fallbackAll;
        }

        return {
          ...section,
          restaurants: resolvedRestaurants,
        };
      })
      .filter(
        (section) =>
          section.layout === 'banner' || section.restaurants.length > 0,
      );
  }

  async update(
    id: string,
    updateDto: UpdateHomeSectionDto,
  ): Promise<HomeSection> {
    const payload: Record<string, unknown> = { ...updateDto };

    if (updateDto.restaurantIds) {
      payload.restaurantIds = updateDto.restaurantIds.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const updated = await this.homeSectionModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`სექცია ID ${id} ვერ მოიძებნა`);
    }

    return updated;
  }

  async addRestaurant(sectionId: string, restaurantId: string) {
    const section = await this.findOne(sectionId);
    const ids = section.restaurantIds.map((id) => id.toString());

    if (!ids.includes(restaurantId)) {
      ids.push(restaurantId);
    }

    return this.update(sectionId, { restaurantIds: ids });
  }

  async removeRestaurant(sectionId: string, restaurantId: string) {
    const section = await this.findOne(sectionId);
    const ids = section.restaurantIds
      .map((id) => id.toString())
      .filter((id) => id !== restaurantId);

    return this.update(sectionId, { restaurantIds: ids });
  }
}
