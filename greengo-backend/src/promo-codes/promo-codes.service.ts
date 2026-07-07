import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCode, PromoCodeDocument } from './schemas/promo-code.schema';

export type PromoDiscountType =
  | 'percentage'
  | 'free_delivery'
  | 'fixed_total';

export type PromoValidationResult = {
  valid: true;
  promoId: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
  discountAmount: number;
  freeDelivery?: boolean;
  description?: string;
};

type PromoPricingContext = {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
};

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectModel(PromoCode.name)
    private readonly promoCodeModel: Model<PromoCodeDocument>,
  ) {}

  async create(createPromoCodeDto: CreatePromoCodeDto): Promise<PromoCode> {
    const code = createPromoCodeDto.code.trim().toUpperCase();
    const discountType = this.normalizeDiscountType(
      createPromoCodeDto.discountType,
    );
    const discountValue =
      discountType === 'free_delivery' ? 0 : createPromoCodeDto.discountValue;

    this.assertDiscountValue(discountType, discountValue);

    const created = new this.promoCodeModel({
      ...createPromoCodeDto,
      code,
      discountType,
      discountValue,
      minOrderAmount: createPromoCodeDto.minOrderAmount ?? 0,
      startsAt: createPromoCodeDto.startsAt
        ? new Date(createPromoCodeDto.startsAt)
        : undefined,
      expiresAt: createPromoCodeDto.expiresAt
        ? new Date(createPromoCodeDto.expiresAt)
        : undefined,
    });

    return created.save();
  }

  async findAll(): Promise<PromoCode[]> {
    return this.promoCodeModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<PromoCode> {
    const promoCode = await this.promoCodeModel.findById(id).exec();
    if (!promoCode) {
      throw new NotFoundException(`პრომო კოდი ID ${id} ვერ მოიძებნა`);
    }
    return promoCode;
  }

  async update(
    id: string,
    updatePromoCodeDto: UpdatePromoCodeDto,
  ): Promise<PromoCode> {
    const existing = await this.findOne(id);
    const nextType = this.normalizeDiscountType(
      updatePromoCodeDto.discountType ?? existing.discountType,
    );
    const nextValue =
      nextType === 'free_delivery'
        ? 0
        : (updatePromoCodeDto.discountValue ?? existing.discountValue);

    this.assertDiscountValue(nextType, nextValue);

    const payload: Record<string, unknown> = {
      ...updatePromoCodeDto,
      discountType: nextType,
      discountValue: nextValue,
    };

    if (updatePromoCodeDto.code) {
      payload.code = updatePromoCodeDto.code.trim().toUpperCase();
    }
    if (updatePromoCodeDto.startsAt) {
      payload.startsAt = new Date(updatePromoCodeDto.startsAt);
    }
    if (updatePromoCodeDto.expiresAt) {
      payload.expiresAt = new Date(updatePromoCodeDto.expiresAt);
    }

    const updated = await this.promoCodeModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`პრომო კოდი ID ${id} ვერ მოიძებნა`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.promoCodeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`პრომო კოდი ID ${id} ვერ მოიძებნა`);
    }
  }

  async validate(
    code: string,
    subtotal: number,
    deliveryFee = 0,
    serviceFee = 0,
  ): Promise<PromoValidationResult> {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      throw new BadRequestException('გთხოვთ შეიყვანოთ პრომო კოდი');
    }

    const promoCode = await this.promoCodeModel
      .findOne({ code: normalizedCode })
      .exec();

    if (!promoCode) {
      throw new BadRequestException('პრომო კოდი არასწორია');
    }

    this.assertPromoIsUsable(promoCode, subtotal);

    const discountType = this.normalizeDiscountType(promoCode.discountType);
    if (discountType === 'free_delivery' && deliveryFee <= 0) {
      throw new BadRequestException(
        'ეს პრომო კოდი მხოლოდ მიტანის შეკვეთებისთვისაა',
      );
    }

    const savings = this.calculatePromoSavings(promoCode, {
      subtotal,
      deliveryFee,
      serviceFee,
    });

    return {
      valid: true,
      promoId: String(promoCode._id),
      code: promoCode.code,
      discountType,
      discountValue: promoCode.discountValue,
      maxDiscount: promoCode.maxDiscount,
      minOrderAmount: promoCode.minOrderAmount ?? 0,
      discountAmount: savings.totalSavings,
      freeDelivery: savings.freeDelivery,
      description: promoCode.description,
    };
  }

  async incrementUsage(promoId: string): Promise<void> {
    await this.promoCodeModel
      .findByIdAndUpdate(promoId, { $inc: { usedCount: 1 } })
      .exec();
  }

  calculateOrderTotal(
    promoCode: PromoCode,
    context: PromoPricingContext,
    tip = 0,
  ): {
    discountAmount: number;
    deliveryFee: number;
    totalAmount: number;
    freeDelivery: boolean;
  } {
    const savings = this.calculatePromoSavings(promoCode, context);

    const totalAmount = Math.max(
      0,
      context.subtotal -
        savings.productDiscount +
        savings.effectiveDeliveryFee +
        context.serviceFee -
        savings.orderDiscount +
        tip,
    );

    return {
      discountAmount: savings.totalSavings,
      deliveryFee: savings.effectiveDeliveryFee,
      totalAmount,
      freeDelivery: savings.freeDelivery,
    };
  }

  calculatePromoSavings(
    promoCode: PromoCode,
    context: PromoPricingContext,
  ): {
    productDiscount: number;
    orderDiscount: number;
    deliveryDiscount: number;
    totalSavings: number;
    effectiveDeliveryFee: number;
    freeDelivery: boolean;
  } {
    const { subtotal, deliveryFee, serviceFee } = context;
    const discountType = this.normalizeDiscountType(promoCode.discountType);

    if (subtotal <= 0) {
      return {
        productDiscount: 0,
        orderDiscount: 0,
        deliveryDiscount: 0,
        totalSavings: 0,
        effectiveDeliveryFee: deliveryFee,
        freeDelivery: false,
      };
    }

    if (discountType === 'free_delivery') {
      const deliveryDiscount = Math.round(deliveryFee * 100) / 100;
      return {
        productDiscount: 0,
        orderDiscount: 0,
        deliveryDiscount,
        totalSavings: deliveryDiscount,
        effectiveDeliveryFee: 0,
        freeDelivery: true,
      };
    }

    if (discountType === 'percentage') {
      let productDiscount = subtotal * (promoCode.discountValue / 100);
      if (promoCode.maxDiscount != null) {
        productDiscount = Math.min(productDiscount, promoCode.maxDiscount);
      }
      productDiscount =
        Math.round(Math.min(productDiscount, subtotal) * 100) / 100;

      return {
        productDiscount,
        orderDiscount: 0,
        deliveryDiscount: 0,
        totalSavings: productDiscount,
        effectiveDeliveryFee: deliveryFee,
        freeDelivery: false,
      };
    }

    const orderBase = subtotal + deliveryFee + serviceFee;
    const orderDiscount =
      Math.round(Math.min(promoCode.discountValue, orderBase) * 100) / 100;

    return {
      productDiscount: 0,
      orderDiscount,
      deliveryDiscount: 0,
      totalSavings: orderDiscount,
      effectiveDeliveryFee: deliveryFee,
      freeDelivery: false,
    };
  }

  private normalizeDiscountType(
    discountType: PromoCode['discountType'],
  ): PromoDiscountType {
    if (discountType === 'fixed') {
      return 'fixed_total';
    }
    return discountType as PromoDiscountType;
  }

  private assertPromoIsUsable(promoCode: PromoCode, subtotal: number): void {
    if (!promoCode.isActive) {
      throw new BadRequestException('პრომო კოდი აღარ არის აქტიური');
    }

    const now = new Date();
    if (promoCode.startsAt && now < promoCode.startsAt) {
      throw new BadRequestException('პრომო კოდი ჯერ არ არის აქტიური');
    }

    if (promoCode.expiresAt && now > promoCode.expiresAt) {
      throw new BadRequestException('პრომო კოდის ვადა ამოიწურა');
    }

    if (
      promoCode.usageLimit != null &&
      promoCode.usedCount >= promoCode.usageLimit
    ) {
      throw new BadRequestException('პრომო კოდის გამოყენების ლიმიტი ამოიწურა');
    }

    const minOrderAmount = promoCode.minOrderAmount ?? 0;
    if (subtotal < minOrderAmount) {
      throw new BadRequestException(
        `მინიმალური შეკვეთის თანხა ამ კოდისთვის არის ${minOrderAmount.toFixed(2)} ₾`,
      );
    }
  }

  private assertDiscountValue(
    discountType: PromoDiscountType,
    discountValue: number,
  ): void {
    if (discountType === 'free_delivery') {
      return;
    }

    if (
      discountType === 'percentage' &&
      (discountValue <= 0 || discountValue > 100)
    ) {
      throw new BadRequestException('პროცენტული ფასდაკლება უნდა იყოს 1-100 შორის');
    }

    if (discountType === 'fixed_total' && discountValue <= 0) {
      throw new BadRequestException('ფიქსირებული ფასდაკლება უნდა იყოს 0-ზე მეტი');
    }
  }
}
