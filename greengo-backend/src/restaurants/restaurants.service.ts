import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { MenuItemsService } from '../menu-items/menu-items.service';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { DuplicateRestaurantDto } from './dto/duplicate-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,
    private readonly menuItemsService: MenuItemsService,
  ) {}

  private stripDocumentIds<T extends Record<string, any>>(value: T): Omit<T, '_id' | 'id'> {
    const { _id: _ignoredId, id: _ignoredVirtualId, ...rest } = value;
    return rest;
  }

  private sanitizeRestaurantClone(source: Record<string, any>) {
    const {
      _id: _sourceId,
      id: _sourceVirtualId,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      businessPasswordHash: _businessPasswordHash,
      __v: _version,
      location,
      contact,
      features,
      menuCategories,
      ...restaurantFields
    } = source;

    return {
      ...restaurantFields,
      location: location ? this.stripDocumentIds(location) : location,
      contact: contact ? this.stripDocumentIds(contact) : contact,
      features: features ? this.stripDocumentIds(features) : features,
      menuCategories: Array.isArray(menuCategories)
        ? menuCategories.map((category) => this.stripDocumentIds(category))
        : [],
    };
  }

  private sanitizeMenuItemClone(source: Record<string, any>) {
    const {
      _id: _itemId,
      id: _itemVirtualId,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      restaurantId: _restaurantId,
      __v: _version,
      ...itemRest
    } = source;

    return itemRest;
  }

  private async prepareBusinessCredentials<T extends CreateRestaurantDto | UpdateRestaurantDto>(
    dto: T,
  ): Promise<any> {
    const payload: any = { ...dto };

    if (payload.businessUsername) {
      payload.businessUsername = payload.businessUsername.trim().toLowerCase();
    }

    if (payload.businessPassword) {
      payload.businessPasswordHash = await bcrypt.hash(payload.businessPassword, 10);
      delete payload.businessPassword;
    }

    return payload;
  }

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const payload = await this.prepareBusinessCredentials(createRestaurantDto);
    const createdRestaurant = new this.restaurantModel(payload);
    return createdRestaurant.save();
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    categories?: string[]; // Multiple categories support
    isActive?: boolean;
    priceRange?: string;
    minRating?: number;
    maxDeliveryTime?: number;
    sortBy?: string;
  }): Promise<{ data: Restaurant[]; total: number; page: number; limit: number }> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      categories,
      isActive,
      priceRange,
      minRating,
      maxDeliveryTime,
      sortBy
    } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Support both single category and multiple categories
    if (categories && categories.length > 0) {
      // Multiple categories - restaurant must have at least one of them
      filter.categories = { $in: categories };
    } else if (category) {
      // Single category for backward compatibility
      filter.categories = { $in: [category] };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Filter by price range
    if (priceRange) {
      filter.priceRange = priceRange;
    }

    // Filter by minimum rating
    if (minRating !== undefined) {
      filter.rating = { $gte: minRating };
    }

    // Filter by maximum delivery time
    if (maxDeliveryTime !== undefined) {
      // This is a bit complex - we need to parse deliveryTime string
      // For now, we'll filter client-side, but we can add regex here if needed
      // filter.deliveryTime = { $regex: `^[0-9]+-?[0-9]*$` };
    }

    // Build sort object
    let sort: any = { createdAt: -1 }; // Default sort
    if (sortBy) {
      switch (sortBy) {
        case 'rating':
          sort = { rating: -1 };
          break;
        case 'fastest':
          // Sort by deliveryTime - we'll need to parse it
          sort = { deliveryTime: 1 };
          break;
        case 'cheapest':
          sort = { deliveryFee: 1 };
          break;
        case 'closest':
          // For closest, we'd need user location
          sort = { name: 1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    const [data, total] = await Promise.all([
      this.restaurantModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .exec(),
      this.restaurantModel.countDocuments(filter).exec(),
    ]);

    // Apply maxDeliveryTime filter client-side (since deliveryTime is a string)
    let filteredData = data;
    if (maxDeliveryTime !== undefined) {
      filteredData = data.filter((restaurant) => {
        const timeStr = restaurant.deliveryTime.replace(/[^0-9-]/g, '');
        const timeRange = timeStr.split('-');
        if (timeRange.length > 1) {
          const maxDeliveryTimeValue = parseInt(timeRange[timeRange.length - 1]);
          return maxDeliveryTimeValue <= maxDeliveryTime;
        } else {
          const singleTime = parseInt(timeRange[0]);
          return singleTime <= maxDeliveryTime;
        }
      });
    }

    return {
      data: filteredData,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`რესტორნი ID ${id} ვერ მოიძებნა`);
    }
    return restaurant;
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const payload = await this.prepareBusinessCredentials(updateRestaurantDto);
    const updatedRestaurant = await this.restaurantModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
    if (!updatedRestaurant) {
      throw new NotFoundException(`რესტორნი ID ${id} ვერ მოიძებნა`);
    }
    return updatedRestaurant;
  }

  async remove(id: string): Promise<void> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`რესტორნი ID ${id} ვერ მოიძებნა`);
    }

    await this.menuItemsService.deleteByRestaurant(id);
    await this.restaurantModel.findByIdAndDelete(id).exec();
  }

  async duplicate(
    sourceId: string,
    duplicateDto: DuplicateRestaurantDto,
  ): Promise<{ restaurant: Restaurant; menuItemsCount: number }> {
    const source = await this.restaurantModel.findById(sourceId).exec();
    if (!source) {
      throw new NotFoundException(`რესტორნი ID ${sourceId} ვერ მოიძებნა`);
    }

    const sourceObj = source.toObject({ virtuals: false }) as Record<string, any>;
    const sanitizedRestaurant = this.sanitizeRestaurantClone(sourceObj);

    const location = {
      ...sanitizedRestaurant.location,
      ...(duplicateDto.location ?? {}),
    };

    const newRestaurantData = {
      ...sanitizedRestaurant,
      name: duplicateDto.name?.trim() || `${source.name} (კოპია)`,
      rating: 0,
      reviewCount: 0,
      isActive: duplicateDto.isActive ?? false,
      businessUsername: duplicateDto.businessUsername,
      businessPassword: duplicateDto.businessPassword,
      location,
    };

    try {
      const payload = await this.prepareBusinessCredentials(
        newRestaurantData as CreateRestaurantDto,
      );
      const newRestaurant = await this.restaurantModel.create(payload);
      const menuItemsCount = await this.copyMenuItems(
        sourceId,
        String(newRestaurant._id),
      );

      return {
        restaurant: newRestaurant,
        menuItemsCount,
      };
    } catch (error: any) {
      if (error.code === 11000 || error.message?.includes('duplicate')) {
        throw new BadRequestException(
          'business username უკვე გამოყენებულია. გამოიყენეთ სხვა username.',
        );
      }

      throw error;
    }
  }

  async copyMenu(
    targetId: string,
    sourceRestaurantId: string,
  ): Promise<{ menuItemsCount: number }> {
    const [target, source] = await Promise.all([
      this.restaurantModel.findById(targetId).exec(),
      this.restaurantModel.findById(sourceRestaurantId).exec(),
    ]);

    if (!target) {
      throw new NotFoundException(`რესტორნი ID ${targetId} ვერ მოიძებნა`);
    }

    if (!source) {
      throw new NotFoundException(
        `საწყისი რესტორანი ID ${sourceRestaurantId} ვერ მოიძებნა`,
      );
    }

    if (targetId === sourceRestaurantId) {
      throw new BadRequestException('საწყისი და სამიზნე რესტორანი ერთი და იგივეა');
    }

    const existingItems =
      await this.menuItemsService.findByRestaurant(targetId);
    if (existingItems.length > 0) {
      throw new BadRequestException(
        'ამ რესტორანს უკვე აქვს პროდუქტები. ჯერ წაშალეთ არსებული მენიუ ან გამოიყენეთ ახალი ფილიალი.',
      );
    }

    const menuItemsCount = await this.copyMenuItems(
      sourceRestaurantId,
      String(target._id),
    );

    return { menuItemsCount };
  }

  private async copyMenuItems(
    sourceRestaurantId: string,
    targetRestaurantId: string,
  ): Promise<number> {
    const menuItems =
      await this.menuItemsService.findByRestaurant(sourceRestaurantId);

    const clonedItems = menuItems.map((item) => {
      const itemObj = (item as any).toObject({ virtuals: false }) as Record<string, any>;
      return {
        ...this.sanitizeMenuItemClone(itemObj),
        restaurantId: targetRestaurantId,
      };
    });

    if (clonedItems.length > 0) {
      await this.menuItemsService.bulkCreate(clonedItems);
    }

    return clonedItems.length;
  }
}
