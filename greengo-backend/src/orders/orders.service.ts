import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CouriersService } from '../couriers/couriers.service';
import { Restaurant, RestaurantDocument } from '../restaurants/schemas/restaurant.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    private couriersService: CouriersService,
  ) {}

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate delivery fee based on distance
   * If distance > 10 km, add 1.20 GEL per additional kilometer
   */
  private calculateDeliveryFee(baseFee: number, distanceKm: number): number {
    if (distanceKm <= 10) {
      return baseFee;
    }
    const additionalKm = distanceKm - 10;
    const additionalFee = additionalKm * 1.20;
    return baseFee + additionalFee;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      console.log('📦 Creating order with DTO:', JSON.stringify(createOrderDto, null, 2));
      
      // Get restaurant location to calculate distance
      const restaurant = await this.restaurantModel
        .findById(createOrderDto.restaurantId)
        .select('location')
        .exec();

      if (!restaurant) {
        throw new NotFoundException(`რესტორანი ID ${createOrderDto.restaurantId} ვერ მოიძებნა`);
      }

      // Calculate distance between restaurant and delivery address
      const restaurantLat = restaurant.location.latitude;
      const restaurantLng = restaurant.location.longitude;
      const deliveryLat = createOrderDto.deliveryAddress.coordinates.lat;
      const deliveryLng = createOrderDto.deliveryAddress.coordinates.lng;

      const distanceKm = this.calculateDistance(
        restaurantLat,
        restaurantLng,
        deliveryLat,
        deliveryLng,
      );

      // Calculate delivery fee based on distance
      const baseDeliveryFee = createOrderDto.deliveryFee || 0;
      const calculatedDeliveryFee = this.calculateDeliveryFee(baseDeliveryFee, distanceKm);

      // Recalculate total amount with new delivery fee
      const itemsTotal = createOrderDto.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const newTotalAmount = itemsTotal + calculatedDeliveryFee + (createOrderDto.tip || 0);

      console.log(`📏 Distance: ${distanceKm.toFixed(2)} km, Base fee: ${baseDeliveryFee}, Calculated fee: ${calculatedDeliveryFee.toFixed(2)}`);
      console.log(`💰 Items total: ${itemsTotal.toFixed(2)}, New total: ${newTotalAmount.toFixed(2)}`);
      
      const createdOrder = new this.orderModel({
        ...createOrderDto,
        deliveryFee: calculatedDeliveryFee,
        totalAmount: newTotalAmount,
        orderDate: new Date(),
        estimatedDelivery: new Date(createOrderDto.estimatedDelivery),
      });
      
      const savedOrder = await createdOrder.save();
      console.log('✅ Order created successfully:', savedOrder._id);
      
      return savedOrder;
    } catch (error: any) {
      console.error('❌ Error in orders service create:', error);
      throw error;
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    restaurantId?: string;
    courierId?: string;
    forCourier?: string; // courierId for checking if courier has active order
  }): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, userId, restaurantId, courierId, forCourier } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (userId) {
      filter.userId = userId;
    }

    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }

    if (courierId) {
      filter.courierId = courierId;
    } else if (status === 'ready') {
      // Check if courier has active order (delivering or ready status)
      if (forCourier) {
        const activeOrder = await this.orderModel.findOne({
          courierId: forCourier,
          status: { $in: ['delivering', 'ready'] },
        }).exec();

        // If courier has active order, don't return available orders
        if (activeOrder) {
          return {
            data: [],
            total: 0,
            page,
            limit,
          };
        }
      }
      
      filter.$or = [
        { courierId: { $exists: false } },
        { courierId: null },
        { courierId: { $eq: null } },
      ];

      filter.status = { $nin: ['delivered', 'cancelled'] };
    } else if (status) {
      filter.status = status;
    }

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('userId', 'name phoneNumber')
        .populate('restaurantId', 'name location coordinates')
        .populate('courierId', 'name phoneNumber currentLocation status')
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
      .populate('restaurantId', 'name location')
      .populate('courierId', 'name phoneNumber currentLocation status')
      .exec();
    if (!order) {
      throw new NotFoundException(`შეკვეთა ID ${id} ვერ მოიძებნა`);
    }
    return order;
  }

  async getOrderTracking(id: string): Promise<any> {
    const order = await this.findOne(id);
    
    if (!order) {
      throw new NotFoundException(`შეკვეთა ID ${id} ვერ მოიძებნა`);
    }

    return {
      order: {
        id: (order as any)._id?.toString() || (order as any).id,
        status: order.status,
        deliveryAddress: order.deliveryAddress,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee,
        tip: order.tip,
        paymentMethod: order.paymentMethod,
      },
      restaurant: order.restaurantId,
      courier: order.courierId,
    };
  }

  async assignCourier(orderId: string, courierId?: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(`შეკვეთა ID ${orderId} ვერ მოიძებნა`);
    }

    if (order.deliveryType !== 'delivery') {
      throw new Error('მხოლოდ delivery შეკვეთებს შეუძლიათ კურიერის მინიჭება');
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw new Error('ამ შეკვეთას ვეღარ შეიძლება კურიერის მინიჭება');
    }

    // If courierId is provided, assign that courier
    // Status should be 'ready' when courier accepts, not 'delivering'
    // Status will change to 'delivering' when courier picks up the order
    if (courierId) {
      await this.couriersService.assignOrder(courierId, orderId);
      order.courierId = courierId as any;
      // Keep status as 'ready' - courier needs to pick up first
      // Status will be changed to 'delivering' when courier picks up
      if (order.status !== 'ready') {
        order.status = 'ready';
      }
      return order.save();
    }

    // Otherwise, find the nearest available courier
    const { lat, lng } = order.deliveryAddress.coordinates;
    const availableCouriers = await this.couriersService.findAvailableCouriers(
      lat,
      lng,
      10000000, // 3000km radius (temporary for testing - shows all orders regardless of location)
    );

    if (availableCouriers.length === 0) {
      throw new Error('ხელმისაწვდომი კურიერი ვერ მოიძებნა');
    }

    // Assign the first available courier (closest one)
    const courier = availableCouriers[0];
    const assignedCourierId = (courier as any)._id?.toString() || (courier as any).id;
    if (!assignedCourierId) {
      throw new Error('კურიერის ID ვერ მოიძებნა');
    }
    await this.couriersService.assignOrder(assignedCourierId, orderId);
    order.courierId = assignedCourierId as any;
    order.status = 'delivering';

    return order.save();
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`შეკვეთა ID ${id} ვერ მოიძებნა`);
    }

    // Validation: "ready" → "delivering" transition should only happen when courier picks up
    // This prevents admin from manually changing status from ready to delivering
    // Courier must use the pickup action which sets status to delivering
    if (order.status === 'ready' && status === 'delivering') {
      // Only allow if courier is assigned (this should be done via courier pickup action)
      if (!order.courierId) {
        throw new Error('კურიერი ჯერ არ არის მინიჭებული შეკვეთაზე. კურიერმა უნდა აიღოს შეკვეთა.');
      }
    }

    const updateData: any = { status };
    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'name phoneNumber')
      .populate('restaurantId', 'name')
      .populate('courierId', 'name phoneNumber currentLocation status')
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
