import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { CouriersService } from './couriers.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { RegisterCourierDto } from './dto/register-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('couriers')
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}

  @Post('register')
  async register(@Body() registerCourierDto: RegisterCourierDto) {
    try {
      return await this.couriersService.register(registerCourierDto);
    } catch (error: any) {
      console.error('❌ Error registering courier:', error);
      
      // Handle OTP verification errors
      if (error instanceof UnauthorizedException || error.message?.includes('OTP') || error.message?.includes('კოდი')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            message: error.message || 'OTP კოდი არასწორია',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      
      // Handle duplicate phone number or validation errors
      if (error.message?.includes('კურიერი') || error.message?.includes('duplicate')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: error.message || 'კურიერი ამ ტელეფონის ნომრით უკვე არსებობს',
          },
          HttpStatus.CONFLICT,
        );
      }
      
      // Handle validation errors
      if (error.response) {
        throw new HttpException(
          {
            statusCode: error.status || HttpStatus.BAD_REQUEST,
            message: error.message || 'ვალიდაციის შეცდომა',
            errors: error.response.message,
          },
          error.status || HttpStatus.BAD_REQUEST,
        );
      }
      
      // Generic error
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'კურიერის რეგისტრაცია ვერ მოხერხდა',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createCourierDto: CreateCourierDto) {
    try {
      return await this.couriersService.create(createCourierDto);
    } catch (error: any) {
      console.error('❌ Error creating courier:', error);
      
      // Handle duplicate phone number or validation errors
      if (error.message?.includes('კურიერი') || error.message?.includes('duplicate')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: error.message || 'კურიერი ამ ტელეფონის ნომრით უკვე არსებობს',
          },
          HttpStatus.CONFLICT,
        );
      }
      
      // Handle validation errors
      if (error.response) {
        throw new HttpException(
          {
            statusCode: error.status || HttpStatus.BAD_REQUEST,
            message: error.message || 'ვალიდაციის შეცდომა',
            errors: error.response.message,
          },
          error.status || HttpStatus.BAD_REQUEST,
        );
      }
      
      // Generic error
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'კურიერის შექმნა ვერ მოხერხდა',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('phoneNumber') phoneNumber?: string,
  ) {
    if (phoneNumber) {
      const courier = await this.couriersService.findByPhone(phoneNumber);
      if (!courier) {
        return { data: [], total: 0, page: 1, limit: 1 };
      }
      return { data: [courier], total: 1, page: 1, limit: 1 };
    }

    return this.couriersService.findAll({
      page,
      limit,
      status,
      isAvailable: isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
    });
  }

  @Get('available')
  findAvailable(
    @Query('latitude', ParseIntPipe) latitude: number,
    @Query('longitude', ParseIntPipe) longitude: number,
    @Query('maxDistance', new DefaultValuePipe(3000000), ParseIntPipe) maxDistance?: number,
  ) {
    return this.couriersService.findAvailableCouriers(latitude, longitude, maxDistance);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couriersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourierDto: UpdateCourierDto) {
    return this.couriersService.update(id, updateCourierDto);
  }

  @Patch(':id/location')
  updateLocation(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.couriersService.updateLocation(id, updateLocationDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'available' | 'busy' | 'offline',
  ) {
    return this.couriersService.updateStatus(id, status);
  }

  @Patch(':id/assign-order/:orderId')
  assignOrder(@Param('id') id: string, @Param('orderId') orderId: string) {
    return this.couriersService.assignOrder(id, orderId);
  }

  @Patch(':id/complete-order')
  completeOrder(@Param('id') id: string) {
    return this.couriersService.completeOrder(id);
  }

  @Get(':id/statistics')
  getStatistics(
    @Param('id') id: string,
    @Query('period', new DefaultValuePipe('today')) period: 'today' | 'week' | 'month',
  ) {
    return this.couriersService.getStatistics(id, period);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couriersService.remove(id);
  }
}

