import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('categories') categories?: string, // Multiple categories (comma-separated)
    @Query('isActive') isActive?: string,
    @Query('priceRange') priceRange?: string,
    @Query('minRating') minRating?: string,
    @Query('rating') rating?: string, // Alias for minRating for frontend compatibility
    @Query('maxDeliveryTime') maxDeliveryTime?: string,
    @Query('deliveryTime') deliveryTime?: string, // Alias for maxDeliveryTime for frontend compatibility
    @Query('sortBy') sortBy?: string,
  ) {
    // Convert string to boolean if provided
    let isActiveBool: boolean | undefined;
    if (isActive !== undefined && isActive !== null) {
      isActiveBool = isActive === 'true';
    }

    // Parse numeric filters - support both minRating/rating and maxDeliveryTime/deliveryTime
    let minRatingNum: number | undefined;
    if (rating) {
      minRatingNum = parseFloat(rating);
    } else if (minRating) {
      minRatingNum = parseFloat(minRating);
    }

    let maxDeliveryTimeNum: number | undefined;
    if (deliveryTime) {
      maxDeliveryTimeNum = parseInt(deliveryTime);
    } else if (maxDeliveryTime) {
      maxDeliveryTimeNum = parseInt(maxDeliveryTime);
    }

    // Parse categories array (comma-separated)
    let categoriesArray: string[] | undefined;
    if (categories) {
      categoriesArray = categories.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
    }
    
    return this.restaurantsService.findAll({
      page,
      limit,
      search,
      category,
      categories: categoriesArray,
      isActive: isActiveBool,
      priceRange,
      minRating: minRatingNum,
      maxDeliveryTime: maxDeliveryTimeNum,
      sortBy,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantsService.remove(id);
  }
}
