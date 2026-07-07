import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner, BannerDocument } from './schemas/banner.schema';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name)
    private bannerModel: Model<BannerDocument>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const payload = this.normalizeBannerPayload(createBannerDto);
    const createdBanner = new this.bannerModel(payload);
    return createdBanner.save();
  }

  async findAll(): Promise<Banner[]> {
    return this.bannerModel
      .find()
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async findActive(placement?: 'top' | 'mid'): Promise<Banner[]> {
    const now = new Date();
    const filter: Record<string, unknown> = {
      isActive: true,
      $and: [
          {
            $or: [
              { startDate: { $exists: false } },
              { startDate: { $lte: now } },
            ],
          },
          {
            $or: [
              { endDate: { $exists: false } },
              { endDate: { $gte: now } },
            ],
          },
        ],
    };

    if (placement === 'mid') {
      filter.placement = 'mid';
    } else if (placement === 'top') {
      filter.$or = [
        { placement: 'top' },
        { placement: { $exists: false } },
      ];
    }

    const banners = await this.bannerModel
      .find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean()
      .exec();

    return banners.map((banner) => ({
      ...banner,
      restaurantId: banner.restaurantId
        ? banner.restaurantId.toString()
        : undefined,
    })) as Banner[];
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerModel.findById(id).exec();
    if (!banner) {
      throw new NotFoundException(`ბანერი ID ${id} ვერ მოიძებნა`);
    }
    return banner;
  }

  async update(
    id: string,
    updateBannerDto: UpdateBannerDto,
  ): Promise<Banner> {
    const payload = this.normalizeBannerPayload(updateBannerDto);
    const unset: Record<string, 1> = {};

    if (
      'restaurantId' in updateBannerDto &&
      !updateBannerDto.restaurantId
    ) {
      delete payload.restaurantId;
      unset.restaurantId = 1;
    }

    const updatedBanner = await this.bannerModel
      .findByIdAndUpdate(
        id,
        {
          ...(Object.keys(unset).length ? { $unset: unset } : {}),
          $set: payload,
        },
        { new: true },
      )
      .exec();
    if (!updatedBanner) {
      throw new NotFoundException(`ბანერი ID ${id} ვერ მოიძებნა`);
    }
    return updatedBanner;
  }

  private normalizeBannerPayload(
    dto: CreateBannerDto | UpdateBannerDto,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = { ...dto };

    if (dto.restaurantId) {
      payload.restaurantId = new Types.ObjectId(dto.restaurantId);
    }

    return payload;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bannerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`ბანერი ID ${id} ვერ მოიძებნა`);
    }
  }
}
