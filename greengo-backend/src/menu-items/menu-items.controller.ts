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
import { MenuItemsService } from './menu-items.service';

function restaurantIdFromDoc(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const doc = value as { _id?: { toString(): string }; toString?: () => string };
    if (doc._id) return doc._id.toString();
    if (typeof doc.toString === 'function') {
      const asString = doc.toString();
      if (asString && asString !== '[object Object]') return asString;
    }
  }
  return String(value);
}

@Controller('menu-items')
@UseGuards(OptionalJwtAuthGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  create(
    @Body() createMenuItemDto: any,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    if (user?.type === 'business') {
      createMenuItemDto = {
        ...createMenuItemDto,
        restaurantId: user.restaurantId,
      };
    }
    return this.menuItemsService.create(createMenuItemDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtRequestUser | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('restaurantId') restaurantId?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('isPopular') isPopular?: string,
  ) {
    let isPopularBool: boolean | undefined;
    if (isPopular === 'true') isPopularBool = true;
    if (isPopular === 'false') isPopularBool = false;

    const scopedRestaurantId = resolveRestaurantIdForBusiness(user, restaurantId);

    return this.menuItemsService.findAll({
      page,
      limit,
      restaurantId: scopedRestaurantId,
      category,
      search,
      isPopular: isPopularBool,
    });
  }

  @Get('restaurant/:restaurantId')
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    const scopedRestaurantId = resolveRestaurantIdForBusiness(user, restaurantId);
    return this.menuItemsService.findByRestaurant(scopedRestaurantId!);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    const item = await this.menuItemsService.findOne(id);
    assertBusinessRestaurantAccess(user, restaurantIdFromDoc(item.restaurantId));
    return item;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: any,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    if (user?.type === 'business') {
      const existing = await this.menuItemsService.findOne(id);
      assertBusinessRestaurantAccess(
        user,
        restaurantIdFromDoc(existing.restaurantId),
      );
      const { restaurantId: _ignored, ...safeDto } = updateMenuItemDto ?? {};
      updateMenuItemDto = safeDto;
    }
    return this.menuItemsService.update(id, updateMenuItemDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    if (user?.type === 'business') {
      const existing = await this.menuItemsService.findOne(id);
      assertBusinessRestaurantAccess(
        user,
        restaurantIdFromDoc(existing.restaurantId),
      );
    }
    return this.menuItemsService.remove(id);
  }
}
