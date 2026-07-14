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
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

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

@Controller('orders')
@UseGuards(OptionalJwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    console.log('📦 Received order request:', JSON.stringify(createOrderDto, null, 2));
    try {
      return this.ordersService.create(createOrderDto);
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtRequestUser | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('courierId') courierId?: string,
    @Query('forCourier') forCourier?: string,
    @Query('type') type?: string,
  ) {
    const scopedRestaurantId = resolveRestaurantIdForBusiness(user, restaurantId);

    return this.ordersService.findAll({
      page,
      limit,
      status,
      userId,
      restaurantId: scopedRestaurantId,
      courierId,
      forCourier,
      deliveryType: type,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    const order = await this.ordersService.findOne(id);
    assertBusinessRestaurantAccess(user, restaurantIdFromDoc(order.restaurantId));
    return order;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body()
    body: { status: string; preparationMinutes?: number },
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    if (user?.type === 'business') {
      const order = await this.ordersService.findOne(id);
      assertBusinessRestaurantAccess(user, restaurantIdFromDoc(order.restaurantId));
    }
    return this.ordersService.updateStatus(id, body.status, {
      preparationMinutes: body.preparationMinutes,
    });
  }

  @Get(':id/tracking')
  async getTracking(
    @Param('id') id: string,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    if (user?.type === 'business') {
      const order = await this.ordersService.findOne(id);
      assertBusinessRestaurantAccess(user, restaurantIdFromDoc(order.restaurantId));
    }
    return this.ordersService.getOrderTracking(id);
  }

  @Patch(':id/assign-courier')
  assignCourier(
    @Param('id') id: string,
    @Body('courierId') courierId?: string,
  ) {
    return this.ordersService.assignCourier(id, courierId);
  }

  @Post(':id/reject')
  rejectOrder(
    @Param('id') id: string,
    @Body('courierId') courierId?: string,
  ) {
    return this.ordersService.rejectOrder(id, courierId);
  }

  @Get(':id/delivery-info')
  getDeliveryInfo(@Param('id') id: string) {
    return this.ordersService.getDeliveryInfo(id);
  }

  @Get('analytics/recent')
  getRecentAnalytics() {
    return this.ordersService.getRecentOrdersAnalytics();
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtRequestUser | undefined,
  ) {
    if (user?.type === 'business') {
      const order = await this.ordersService.findOne(id);
      assertBusinessRestaurantAccess(user, restaurantIdFromDoc(order.restaurantId));
    }
    return this.ordersService.remove(id);
  }
}
