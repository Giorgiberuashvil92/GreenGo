import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { CreateCourierDto } from './dto/create-courier.dto';
import { RegisterCourierDto } from './dto/register-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Courier, CourierDocument } from './schemas/courier.schema';

@Injectable()
export class CouriersService {
  constructor(
    @InjectModel(Courier.name) private courierModel: Model<CourierDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private authService: AuthService,
  ) {}

  async register(registerCourierDto: RegisterCourierDto): Promise<Courier> {
    try {
      // Verify OTP code first (without creating user)
      await this.authService.verifyCodeOnly(
        registerCourierDto.phoneNumber,
        registerCourierDto.verificationCode,
      );

      // Check if courier with this phone number already exists
      const existingCourier = await this.courierModel.findOne({
        phoneNumber: registerCourierDto.phoneNumber,
      }).exec();

      if (existingCourier) {
        throw new Error(`კურიერი ტელეფონის ნომრით ${registerCourierDto.phoneNumber} უკვე არსებობს`);
      }

      // Create courier without location (name will be added if provided)
      const courierData: any = {
        phoneNumber: registerCourierDto.phoneNumber,
        status: 'offline',
        isAvailable: false,
        isActive: true,
      };

      // Add name if provided
      if (registerCourierDto.name && registerCourierDto.name.trim()) {
        courierData.name = registerCourierDto.name.trim();
      }

      const createdCourier = new this.courierModel(courierData);
      return await createdCourier.save();
    } catch (error: any) {
      // Handle OTP verification errors
      if (error.message?.includes('Invalid') || error.message?.includes('verification')) {
        throw new UnauthorizedException('OTP კოდი არასწორია');
      }
      // Handle MongoDB duplicate key error
      if (error.code === 11000 || error.message?.includes('duplicate')) {
        throw new Error(`კურიერი ტელეფონის ნომრით ${registerCourierDto.phoneNumber} უკვე არსებობს`);
      }
      throw error;
    }
  }

  async create(createCourierDto: CreateCourierDto): Promise<Courier> {
    try {
      const existingCourier = await this.courierModel.findOne({
        phoneNumber: createCourierDto.phoneNumber,
      }).exec();

      if (existingCourier) {
        throw new Error(`კურიერი ტელეფონის ნომრით ${createCourierDto.phoneNumber} უკვე არსებობს`);
      }

      // Prepare courier data without currentLocation (location should be set separately)
      const courierData: any = {
        phoneNumber: createCourierDto.phoneNumber,
        status: createCourierDto.status || 'offline',
        isAvailable: createCourierDto.isAvailable ?? false,
        isActive: createCourierDto.isActive ?? true,
      };

      // Add optional fields
      if (createCourierDto.name) {
        courierData.name = createCourierDto.name;
      }
      if (createCourierDto.email) {
        courierData.email = createCourierDto.email;
      }
      if (createCourierDto.profileImage) {
        courierData.profileImage = createCourierDto.profileImage;
      }

      // Don't add currentLocation during registration - it should be set via updateLocation endpoint

      const createdCourier = new this.courierModel(courierData);
      return await createdCourier.save();
    } catch (error: any) {
      // Handle MongoDB duplicate key error
      if (error.code === 11000 || error.message?.includes('duplicate')) {
        throw new Error(`კურიერი ტელეფონის ნომრით ${createCourierDto.phoneNumber} უკვე არსებობს`);
      }
      throw error;
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    isAvailable?: boolean;
  }): Promise<{ data: Courier[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, isAvailable } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable;
    }

    const [data, total] = await Promise.all([
      this.courierModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.courierModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Courier> {
    const courier = await this.courierModel.findById(id).exec();
    if (!courier) {
      throw new NotFoundException(`კურიერი ID ${id} ვერ მოიძებნა`);
    }
    return courier;
  }

  async findByPhone(phoneNumber: string): Promise<Courier | null> {
    return this.courierModel.findOne({ phoneNumber }).exec();
  }

  async update(id: string, updateCourierDto: UpdateCourierDto): Promise<Courier> {
    const updatedCourier = await this.courierModel
      .findByIdAndUpdate(id, updateCourierDto, { new: true })
      .exec();

    if (!updatedCourier) {
      throw new NotFoundException(`კურიერი ID ${id} ვერ მოიძებნა`);
    }
    return updatedCourier;
  }

  async updateLocation(id: string, updateLocationDto: UpdateLocationDto): Promise<Courier> {
    const courier = await this.courierModel.findById(id).exec();
    if (!courier) {
      throw new NotFoundException(`კურიერი ID ${id} ვერ მოიძებნა`);
    }

    // MongoDB GeoJSON format: [longitude, latitude]
    courier.currentLocation = {
      type: 'Point',
      coordinates: [updateLocationDto.location.longitude, updateLocationDto.location.latitude],
      lastUpdated: new Date(),
    };

    return courier.save();
  }

  async updateStatus(id: string, status: 'available' | 'busy' | 'offline'): Promise<Courier> {
    const courier = await this.courierModel.findById(id).exec();
    if (!courier) {
      throw new NotFoundException(`კურიერი ID ${id} ვერ მოიძებნა`);
    }

    courier.status = status;
    courier.isAvailable = status === 'available';

    return courier.save();
  }

  async findAvailableCouriers(latitude: number, longitude: number, maxDistance: number = 3000000): Promise<Courier[]> {
    // Find available couriers within maxDistance (in meters) from the given location
    // Default: 3000km (temporary for testing - shows all available couriers regardless of location)
    // MongoDB GeoJSON format: [longitude, latitude]
    
    // First try to find couriers with location near the order
    const couriersWithLocation = await this.courierModel.find({
      status: 'available',
      isAvailable: true,
      isActive: true,
      currentLocation: {
        $exists: true,
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], // MongoDB uses [longitude, latitude]
          },
          $maxDistance: maxDistance,
        },
      },
    }).exec();

    // If found couriers with location, return them
    if (couriersWithLocation.length > 0) {
      return couriersWithLocation;
    }

    // Otherwise, return all available couriers (fallback for testing)
    const allAvailableCouriers = await this.courierModel.find({
      status: 'available',
      isAvailable: true,
      isActive: true,
    }).exec();

    return allAvailableCouriers;
  }

  async assignOrder(courierId: string, orderId: string): Promise<Courier> {
    const courier = await this.courierModel.findById(courierId).exec();
    if (!courier) {
      throw new NotFoundException(`კურიერი ID ${courierId} ვერ მოიძებნა`);
    }

    if (courier.status !== 'available' || !courier.isAvailable) {
      throw new Error('კურიერი არ არის ხელმისაწვდომი');
    }

    courier.currentOrderId = orderId as any;
    courier.status = 'busy';
    courier.isAvailable = false;

    return courier.save();
  }

  async completeOrder(courierId: string): Promise<Courier> {
    const courier = await this.courierModel.findById(courierId).exec();
    if (!courier) {
      throw new NotFoundException(`კურიერი ID ${courierId} ვერ მოიძებნა`);
    }

    courier.currentOrderId = undefined;
    courier.status = 'available';
    courier.isAvailable = true;
    courier.totalDeliveries += 1;

    return courier.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.courierModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`კურიერი ID ${id} ვერ მოიძებნა`);
    }
  }

  async getStatistics(courierId: string, period: 'today' | 'week' | 'month') {
    const courier = await this.courierModel.findById(courierId).exec();
    if (!courier) {
      throw new NotFoundException(`კურიერი ID ${courierId} ვერ მოიძებნა`);
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
      startDate = new Date(now.getFullYear(), now.getMonth(), diff);
      startDate.setHours(0, 0, 0, 0);
    } else { // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get all orders for this courier in the period
    const orders = await this.orderModel
      .find({
        courierId: courierId,
        createdAt: { $gte: startDate, $lte: now },
      })
      .populate('restaurantId', 'location')
      .exec();

    // Calculate statistics
    const deliveredOrders = orders.filter((o) => o.status === 'delivered');
    const confirmedOrders = orders.filter((o) => 
      ['confirmed', 'preparing', 'ready', 'delivering', 'delivered'].includes(o.status)
    );
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

    // Calculate total distance (in km)
    let totalDistance = 0;
    deliveredOrders.forEach((order: any) => {
      if (order.restaurantId?.location && order.deliveryAddress?.coordinates) {
        const restaurantLat = order.restaurantId.location.latitude || order.restaurantId.location.coordinates?.lat;
        const restaurantLng = order.restaurantId.location.longitude || order.restaurantId.location.coordinates?.lng;
        const deliveryLat = order.deliveryAddress.coordinates.lat;
        const deliveryLng = order.deliveryAddress.coordinates.lng;
        
        if (restaurantLat && restaurantLng && deliveryLat && deliveryLng) {
          // Haversine formula to calculate distance
          const R = 6371; // Earth's radius in km
          const dLat = ((deliveryLat - restaurantLat) * Math.PI) / 180;
          const dLng = ((deliveryLng - restaurantLng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((restaurantLat * Math.PI) / 180) *
              Math.cos((deliveryLat * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          totalDistance += R * c;
        }
      }
    });

    // Calculate previous period for comparison
    let previousStartDate: Date;
    let previousEndDate: Date;
    
    if (period === 'today') {
      previousStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      previousEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      previousStartDate = new Date(now.getFullYear(), now.getMonth(), diff - 7);
      previousEndDate = new Date(now.getFullYear(), now.getMonth(), diff);
    } else { // month
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const previousOrders = await this.orderModel
      .find({
        courierId: courierId,
        createdAt: { $gte: previousStartDate, $lt: previousEndDate },
      })
      .exec();

    const previousDelivered = previousOrders.filter((o) => o.status === 'delivered').length;
    const currentDelivered = deliveredOrders.length;
    const improvementNeeded = Math.max(0, previousDelivered - currentDelivered + 1);

    // Calculate rates
    const totalConfirmed = confirmedOrders.length + cancelledOrders.length;
    const confirmationRate = totalConfirmed > 0 
      ? ((confirmedOrders.length / totalConfirmed) * 100).toFixed(1)
      : '0.0';

    const completionRate = confirmedOrders.length > 0
      ? ((deliveredOrders.length / confirmedOrders.length) * 100).toFixed(1)
      : '0.0';

    return {
      period,
      deliveredOrders: deliveredOrders.length,
      totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
      totalCompleted: deliveredOrders.length,
      confirmationRate: parseFloat(confirmationRate),
      completionRate: parseFloat(completionRate),
      improvementNeeded,
      previousPeriodDelivered: previousDelivered,
      date: startDate.toISOString().split('T')[0],
    };
  }
}

