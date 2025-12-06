import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const createdOrder = new this.orderModel({
      ...createOrderDto,
      orderDate: new Date(),
      estimatedDelivery: new Date(createOrderDto.estimatedDelivery),
    });
    return createdOrder.save();
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    restaurantId?: string;
  }): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, userId, restaurantId } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('userId', 'name phoneNumber')
        .populate('restaurantId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'name phoneNumber')
      .populate('restaurantId', 'name')
      .exec();
    if (!order) {
      throw new NotFoundException(`შეკვეთა ID ${id} ვერ მოიძებნა`);
    }
    return order;
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const updateData: any = { status };
    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'name phoneNumber')
      .populate('restaurantId', 'name')
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`შეკვეთა ID ${id} ვერ მოიძებნა`);
    }
    return updatedOrder;
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`შეკვეთა ID ${id} ვერ მოიძებნა`);
    }
  }
}
