import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateRestaurantOfferDto } from './dto/create-restaurant-offer.dto';
import { UpdateRestaurantOfferDto } from './dto/update-restaurant-offer.dto';
import { RestaurantOffersService } from './restaurant-offers.service';

@Controller('restaurant-offers')
export class RestaurantOffersController {
  constructor(
    private readonly restaurantOffersService: RestaurantOffersService,
  ) {}

  @Post()
  create(@Body() createDto: CreateRestaurantOfferDto) {
    return this.restaurantOffersService.create(createDto);
  }

  /** ?restaurantId=&active=true — აპისთვის მხოლოდ აქტიური */
  @Get()
  findAll(
    @Query('restaurantId') restaurantId?: string,
    @Query('active') active?: string,
  ) {
    if (restaurantId && active === 'true') {
      return this.restaurantOffersService.findActiveByRestaurant(restaurantId);
    }
    return this.restaurantOffersService.findAll(restaurantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantOffersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRestaurantOfferDto,
  ) {
    return this.restaurantOffersService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantOffersService.remove(id);
  }
}
