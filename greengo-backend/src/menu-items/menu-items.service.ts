import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
  ) {}

  private buildRestaurantIdFilter(restaurantId: string) {
    if (Types.ObjectId.isValid(restaurantId)) {
      return {
        $in: [restaurantId, new Types.ObjectId(restaurantId)],
      };
    }

    return restaurantId;
  }

  async create(createMenuItemDto: any): Promise<MenuItem> {
    if (
      createMenuItemDto.order === undefined ||
      createMenuItemDto.order === null
    ) {
      const lastItem = await this.menuItemModel
        .findOne({
          restaurantId: this.buildRestaurantIdFilter(
            createMenuItemDto.restaurantId,
          ),
        })
        .sort({ order: -1, createdAt: -1 })
        .select('order')
        .exec();

      createMenuItemDto.order =
        typeof lastItem?.order === 'number' ? lastItem.order + 1 : 0;
    }

    const createdMenuItem = new this.menuItemModel(createMenuItemDto);
    return createdMenuItem.save();
  }

  async bulkCreate(items: any[]): Promise<any[]> {
    if (items.length === 0) {
      return [];
    }

    return this.menuItemModel.insertMany(items);
  }

  async deleteByRestaurant(restaurantId: string): Promise<number> {
    const result = await this.menuItemModel
      .deleteMany({ restaurantId: this.buildRestaurantIdFilter(restaurantId) })
      .exec();

    return result.deletedCount ?? 0;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    restaurantId?: string;
    category?: string;
    search?: string;
    isPopular?: boolean;
  }): Promise<{ data: MenuItem[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, restaurantId, category, search, isPopular } =
      query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (restaurantId) {
      filter.restaurantId = this.buildRestaurantIdFilter(restaurantId);
    }

    if (category) {
      filter.category = category;
    }

    if (isPopular === true || isPopular === false) {
      filter.isPopular = isPopular;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> =
      isPopular === true
        ? { popularOrder: 1, order: 1, category: 1, createdAt: -1 }
        : { order: 1, category: 1, createdAt: -1 };

    const [data, total] = await Promise.all([
      this.menuItemModel
        .find(filter)
        .populate(
          'restaurantId',
          'name description image heroImage deliveryFee deliveryTime rating isActive',
        )
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .exec(),
      this.menuItemModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    return this.menuItemModel
      .find({ restaurantId: this.buildRestaurantIdFilter(restaurantId) })
      .sort({ order: 1, category: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemModel
      .findById(id)
      .populate('restaurantId', 'name')
      .exec();
    if (!menuItem) {
      throw new NotFoundException(`მენიუ აიტემი ID ${id} ვერ მოიძებნა`);
    }
    return menuItem;
  }

  async update(id: string, updateMenuItemDto: any): Promise<MenuItem> {
    const updatedMenuItem = await this.menuItemModel
      .findByIdAndUpdate(id, updateMenuItemDto, { new: true })
      .exec();
    if (!updatedMenuItem) {
      throw new NotFoundException(`მენიუ აიტემი ID ${id} ვერ მოიძებნა`);
    }
    return updatedMenuItem;
  }

  async remove(id: string): Promise<void> {
    const result = await this.menuItemModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`მენიუ აიტემი ID ${id} ვერ მოიძებნა`);
    }
  }
}
