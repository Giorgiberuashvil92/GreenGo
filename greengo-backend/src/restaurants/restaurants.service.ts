import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const createdRestaurant = new this.restaurantModel(createRestaurantDto);
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
    const updatedRestaurant = await this.restaurantModel
      .findByIdAndUpdate(id, updateRestaurantDto, { new: true })
      .exec();
    if (!updatedRestaurant) {
      throw new NotFoundException(`რესტორნი ID ${id} ვერ მოიძებნა`);
    }
    return updatedRestaurant;
  }

  async remove(id: string): Promise<void> {
    const result = await this.restaurantModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`რესტორნი ID ${id} ვერ მოიძებნა`);
    }
  }
}
