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
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('courierId') courierId?: string,
    @Query('forCourier') forCourier?: string, // courierId for checking active orders
    @Query('type') type?: string, // deliveryType alias for mobile app compatibility
  ) {
    return this.ordersService.findAll({
      page,
      limit,
      status,
      userId,
      restaurantId,
      courierId,
      forCourier,
      deliveryType: type, // Map 'type' to 'deliveryType'
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Get(':id/tracking')
  getTracking(@Param('id') id: string) {
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
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
