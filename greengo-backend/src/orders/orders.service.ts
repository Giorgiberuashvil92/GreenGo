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
    } else if (status === 'ready' || status === 'confirmed') {
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
      
      // Show orders without courier for courier to accept
      filter.$or = [
        { courierId: { $exists: false } },
        { courierId: null },
        { courierId: { $eq: null } },
      ];

      // If status is 'confirmed', show only confirmed orders
      // If status is 'ready', show orders that are not delivered or cancelled
      if (status === 'confirmed') {
        filter.status = 'confirmed';
      } else {
        filter.status = { $nin: ['delivered', 'cancelled'] };
      }
    } else if (status) {
      filter.status = status;
    }

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('userId', 'name phoneNumber')
        .populate('restaurantId', 'name location coordinates image heroImage')
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
      .populate('restaurantId', 'name location image heroImage')
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

    // კურიერის მინიჭება შეიძლება მხოლოდ მაშინ, როცა შეკვეთა უკვე დადასტურებულია რესტორანის მიერ
    // კურიერის მოძიება იწყება რესტორანის დადასტურების შემდეგ, მაგრამ კურიერი არ მიენიჭება ავტომატურად
    // კურიერმა უნდა დაადასტუროს თანხმობა, მხოლოდ ამის შემდეგ მიენიჭება რესტორანს
    if (order.status !== 'confirmed' && order.status !== 'preparing' && order.status !== 'ready') {
      throw new Error('კურიერის მინიჭება შეიძლება მხოლოდ დადასტურებული შეკვეთებისთვის. გთხოვთ ჯერ დაადასტუროთ შეკვეთა.');
    }

    // If courierId is provided, assign that courier (courier accepts the order)
    // After courier accepts, the order becomes visible to restaurant
    // Status automatically changes to 'preparing' when courier accepts
    if (courierId) {
      await this.couriersService.assignOrder(courierId, orderId);
      order.courierId = courierId as any;
      order.status = 'preparing';
      console.log(`✅ კურიერი ${courierId} დაადასტურა შეკვეთა ${orderId} - სტატუსი ავტომატურად გადავიდა 'preparing'-ზე`);
      return order.save();
    }

    // Otherwise, find the nearest available courier
    const { lat, lng } = order.deliveryAddress.coordinates;
    const availableCouriers = await this.couriersService.findAvailableCouriers(
      lat,
      lng,
      10000000, // 10000km radius (temporary for testing - shows all orders regardless of location)
    );

    if (availableCouriers.length === 0) {
      // If no available couriers found, don't throw error - just return order without courier
      // Admin can manually assign courier later
      return order;
    }

    // Assign the first available courier (closest one)
    const courier = availableCouriers[0];
    const assignedCourierId = (courier as any)._id?.toString() || (courier as any).id;
    if (!assignedCourierId) {
      throw new Error('კურიერის ID ვერ მოიძებნა');
    }
    await this.couriersService.assignOrder(assignedCourierId, orderId);
    order.courierId = assignedCourierId as any;
    order.status = 'preparing';
    console.log(`✅ კურიერი ${assignedCourierId} ავტომატურად მიენიჭა შეკვეთას ${orderId} - სტატუსი გადავიდა 'preparing'-ზე`);

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

    // თუ სტატუსი იცვლება "preparing"-ზე, დავრწმუნდეთ რომ კურიერი მინიჭებულია
    // მზადება შეიძლება დაიწყოს მხოლოდ მაშინ, როცა კურიერი უკვე მინიჭებულია
    if (status === 'preparing' && !order.courierId && order.deliveryType === 'delivery') {
      throw new Error('კურიერი ჯერ არ არის მინიჭებული. გთხოვთ დაელოდოთ კურიერის მინიჭებას.');
    }

    // თუ სტატუსი იცვლება "confirmed"-ზე (რესტორანის დადასტურება), დავიწყოთ კურიერის მოძიება
    // კურიერი არ მიენიჭება ავტომატურად - კურიერმა უნდა დაადასტუროს თანხმობა
    if (status === 'confirmed' && !order.courierId && order.deliveryType === 'delivery') {
      console.log(`🔍 კურიერის მოძიება იწყება შეკვეთისთვის ${id}`);
      console.log(`📋 შეკვეთა ${id} გამოჩნდება კურიერებს დადასტურებისთვის`);
      // კურიერი არ მიენიჭება ავტომატურად - კურიერმა უნდა დაადასტუროს თანხმობა
      // შეკვეთა გამოჩნდება კურიერებისთვის findAll-ში status='confirmed' და courierId=null-ით
    }

    const updateData: any = { status };
    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    // თუ კურიერი მინიჭებულია, განვაახლოთ order-ის courierId
    if (order.courierId) {
      updateData.courierId = order.courierId;
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

  /**
   * Get delivery information for courier
   * Returns detailed delivery requirements and information
   */
  async getDeliveryInfo(orderId: string): Promise<any> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('userId', 'name phoneNumber')
      .populate('restaurantId', 'name location address')
      .populate('courierId', 'name phoneNumber currentLocation status')
      .exec();

    if (!order) {
      throw new NotFoundException(`შეკვეთა ID ${orderId} ვერ მოიძებნა`);
    }

    if (order.deliveryType !== 'delivery') {
      throw new Error('ეს შეკვეთა არ არის მიტანის ტიპის');
    }

    const restaurant = order.restaurantId as any;
    const restaurantLat = restaurant.location.latitude;
    const restaurantLng = restaurant.location.longitude;
    const deliveryLat = order.deliveryAddress.coordinates.lat;
    const deliveryLng = order.deliveryAddress.coordinates.lng;

    // Calculate distance
    const distanceKm = this.calculateDistance(
      restaurantLat,
      restaurantLng,
      deliveryLat,
      deliveryLng,
    );

    // Calculate estimated time (assuming average speed of 30 km/h in city)
    const estimatedTimeMinutes = Math.ceil((distanceKm / 30) * 60);

    return {
      orderId: (order as any)._id?.toString() || (order as any).id,
      status: order.status,
      restaurant: {
        id: restaurant._id?.toString() || restaurant.id,
        name: restaurant.name,
        address: restaurant.location.address || `${restaurant.location.city}, ${restaurant.location.district || ''}`,
        coordinates: {
          lat: restaurantLat,
          lng: restaurantLng,
        },
        contact: restaurant.contact || {},
      },
      deliveryAddress: {
        street: order.deliveryAddress.street,
        city: order.deliveryAddress.city,
        coordinates: {
          lat: deliveryLat,
          lng: deliveryLng,
        },
        instructions: order.deliveryAddress.instructions || '',
      },
      customer: {
        name: (order.userId as any)?.name || 'N/A',
        phoneNumber: (order.userId as any)?.phoneNumber || 'N/A',
      },
      distance: {
        kilometers: Math.round(distanceKm * 10) / 10,
        meters: Math.round(distanceKm * 1000),
      },
      estimatedDeliveryTime: {
        minutes: estimatedTimeMinutes,
        formatted: `${estimatedTimeMinutes} წუთი`,
      },
      orderDetails: {
        items: order.items,
        totalAmount: order.totalAmount,
        deliveryFee: order.deliveryFee,
        tip: order.tip || 0,
        paymentMethod: order.paymentMethod,
        estimatedDelivery: order.estimatedDelivery,
        notes: order.notes || '',
      },
      courier: order.courierId ? {
        id: ((order.courierId as any)._id?.toString() || (order.courierId as any).id),
        name: (order.courierId as any)?.name || 'N/A',
        phoneNumber: (order.courierId as any)?.phoneNumber || 'N/A',
        status: (order.courierId as any)?.status || 'N/A',
      } : null,
    };
  }

  /**
   * Get analytics for orders in the last 30 minutes
   * Returns order count and determines if it's low, medium, or high
   */
  async getRecentOrdersAnalytics(): Promise<any> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const now = new Date();

    // Get orders created in the last 30 minutes
    const recentOrders = await this.orderModel
      .find({
        createdAt: { $gte: thirtyMinutesAgo, $lte: now },
      })
      .exec();

    const totalOrders = recentOrders.length;

    // Categorize by status
    const ordersByStatus = {
      pending: recentOrders.filter(o => o.status === 'pending').length,
      confirmed: recentOrders.filter(o => o.status === 'confirmed').length,
      preparing: recentOrders.filter(o => o.status === 'preparing').length,
      ready: recentOrders.filter(o => o.status === 'ready').length,
      delivering: recentOrders.filter(o => o.status === 'delivering').length,
      delivered: recentOrders.filter(o => o.status === 'delivered').length,
      cancelled: recentOrders.filter(o => o.status === 'cancelled').length,
    };

    // Calculate average order value
    const totalAmount = recentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    // Determine activity level
    // Thresholds: 0-2 = დაბალი, 3-5 = საშუალო, 6+ = მაღალი
    let activityLevel: 'დაბალი' | 'საშუალო' | 'მაღალი';
    let activityLevelEn: 'low' | 'medium' | 'high';
    
    if (totalOrders <= 2) {
      activityLevel = 'დაბალი';
      activityLevelEn = 'low';
    } else if (totalOrders <= 5) {
      activityLevel = 'საშუალო';
      activityLevelEn = 'medium';
    } else {
      activityLevel = 'მაღალი';
      activityLevelEn = 'high';
    }

    // Get comparison data (previous 30 minutes)
    const previousStart = new Date(thirtyMinutesAgo.getTime() - 30 * 60 * 1000);
    const previousOrders = await this.orderModel
      .find({
        createdAt: { $gte: previousStart, $lt: thirtyMinutesAgo },
      })
      .exec();

    const previousTotal = previousOrders.length;
    const change = totalOrders - previousTotal;
    const changePercentage = previousTotal > 0 
      ? ((change / previousTotal) * 100).toFixed(1)
      : totalOrders > 0 ? '100.0' : '0.0';

    return {
      period: {
        start: thirtyMinutesAgo.toISOString(),
        end: now.toISOString(),
        durationMinutes: 30,
      },
      summary: {
        totalOrders,
        activityLevel,
        activityLevelEn,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalRevenue: Math.round(totalAmount * 100) / 100,
      },
      byStatus: ordersByStatus,
      comparison: {
        previousPeriodTotal: previousTotal,
        change,
        changePercentage: parseFloat(changePercentage),
        trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
      },
    };
  }
}
