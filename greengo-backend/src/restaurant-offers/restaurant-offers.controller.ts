import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  assertBusinessRestaurantAccess,
  resolveRestaurantIdForBusiness,
} from '../auth/business-scope';
import type { JwtRequestUser } from '../auth/jwt.strategy';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CreateRestaurantOfferDto } from './dto/create-restaurant-offer.dto';
import { UpdateRestaurantOfferDto } from './dto/update-restaurant-offer.dto';
import { RestaurantOffersService } from './restaurant-offers.service';

function restaurantIdFromDoc(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const doc = value as {
      _id?: { toString(): string };
      toString?: () => string;
    };
    if (doc._id) return doc._id.toString();
    if (typeof doc.toString === 'function') {
      const asString = doc.toString();
      if (asString && asString !== '[object Object]') return asString;
    }
  }
  return String(value);
}

@Controller('restaurant-offers')
@UseGuards(OptionalJwtAuthGuard)
export class RestaurantOffersController {
  constructor(
    private readonly restaurantOffersService: RestaurantOffersService,
  ) {}

  @Post()
  create(
    @Body() createDto: CreateRestaurantOfferDto,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    if (user?.type === 'business') {
      createDto = {
        ...createDto,
        restaurantId: user.restaurantId,
      };
    }
    return this.restaurantOffersService.create(createDto);
  }

  /** ?restaurantId=&active=true — აპისთვის მხოლოდ აქტიური */
  @Get()
  findAll(
    @CurrentUser() user: JwtRequestUser | undefined,
    @Query('restaurantId') restaurantId?: string,
    @Query('active') active?: string,
  ) {
    const scopedRestaurantId = resolveRestaurantIdForBusiness(
      user,
      restaurantId,
    );

    if (scopedRestaurantId && active === 'true') {
      return this.restaurantOffersService.findActiveByRestaurant(
        scopedRestaurantId,
      );
    }
    return this.restaurantOffersService.findAll(scopedRestaurantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    const offer = await this.restaurantOffersService.findOne(id);
    assertBusinessRestaurantAccess(
      user,
      restaurantIdFromDoc(offer.restaurantId),
    );
    return offer;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRestaurantOfferDto,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    if (user?.type === 'business') {
      const existing = await this.restaurantOffersService.findOne(id);
      assertBusinessRestaurantAccess(
        user,
        restaurantIdFromDoc(existing.restaurantId),
      );
      const { restaurantId: _ignored, ...safeDto } = updateDto ?? {};
      updateDto = safeDto;
    }
    return this.restaurantOffersService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    if (user?.type === 'business') {
      const existing = await this.restaurantOffersService.findOne(id);
      assertBusinessRestaurantAccess(
        user,
        restaurantIdFromDoc(existing.restaurantId),
      );
    }
    return this.restaurantOffersService.remove(id);
  }
}
