import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
  ) {}

  async create(createMenuItemDto: any): Promise<MenuItem> {
    const createdMenuItem = new this.menuItemModel(createMenuItemDto);
    return createdMenuItem.save();
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    restaurantId?: string;
    category?: string;
    search?: string;
  }): Promise<{ data: MenuItem[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, restaurantId, category, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.menuItemModel
        .find(filter)
        .populate('restaurantId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
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
      .find({ restaurantId })
      .sort({ category: 1, createdAt: -1 })
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
