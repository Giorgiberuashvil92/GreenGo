import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, timingSafeEqual } from 'crypto';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { PaymentIntent, PaymentIntentDocument } from './schemas/payment-intent.schema';

const FLITT_API_URL = 'https://pay.flitt.com/api';

type FlittResponse = {
  response?: {
    response_status?: string;
    error_message?: string;
    checkout_url?: string;
    payment_id?: string | number;
  };
};

@Injectable()
export class FlittService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(PaymentIntent.name)
    private readonly paymentIntentModel: Model<PaymentIntentDocument>,
  ) {}

  private get merchantId(): string {
    return (
      this.configService.get<string>('FLITT_MERCHANT_ID') ||
      process.env.FLITT_MERCHANT_ID ||
      ''
    ).trim();
  }

  private get secretKey(): string {
    return (
      this.configService.get<string>('FLITT_SECRET_KEY') ||
      process.env.FLITT_SECRET_KEY ||
      ''
    ).trim();
  }

  private get publicApiUrl(): string {
    return (
      this.configService.get<string>('FLITT_PUBLIC_API_URL') ||
      process.env.FLITT_PUBLIC_API_URL ||
      'https://greengo-production.up.railway.app/api'
    ).replace(/\/$/, '');
  }

  private sign(params: Record<string, string | number>): string {
    const values = Object.entries(params)
      .filter(([key, value]) => key !== 'signature' && value !== '' && value != null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => String(value));
    return createHash('sha1')
      .update([this.secretKey, ...values].join('|'))
      .digest('hex');
  }

  private verifyCallback(payload: Record<string, unknown>): boolean {
    const received = String(payload.signature || '');
    if (!received || !this.secretKey || !this.merchantId) return false;
    const expected = this.sign(payload as Record<string, string | number>);
    if (received.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  }

  async createCheckout(orderId: string, amountGel: number, description: string) {
    if (!this.merchantId || !this.secretKey) {
      throw new InternalServerErrorException('Flitt credentials are not configured');
    }

    const amount = Math.round(amountGel * 100);
    if (!Number.isFinite(amount) || amount < 1) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const params: Record<string, string | number> = {
      version: '1.0.1',
      order_id: `greengo_${orderId}`,
      merchant_id: this.merchantId,
      order_desc: description.slice(0, 1024),
      amount,
      currency: 'GEL',
      response_url: `${this.publicApiUrl}/payments/flitt/return`,
      server_callback_url: `${this.publicApiUrl}/payments/flitt/callback`,
    };

    const response = await fetch(`${FLITT_API_URL}/checkout/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: { ...params, signature: this.sign(params) } }),
    });
    const body = (await response.json()) as FlittResponse;
    const result = body.response;
    if (!response.ok || result?.response_status !== 'success' || !result.checkout_url) {
      throw new InternalServerErrorException(
        `Flitt checkout creation failed: ${result?.error_message || 'unknown error'}${result?.response_status ? ` (${result.response_status})` : ''}`,
      );
    }

    return {
      flittOrderId: String(params.order_id),
      paymentId: result.payment_id ? String(result.payment_id) : undefined,
      checkoutUrl: result.checkout_url,
      amount,
    };
  }

  async createPaymentIntent(
    orderPayload: Record<string, unknown>,
    amountGel: number,
    description: string,
  ) {
    const orderId = new Types.ObjectId();
    const flittOrderId = `greengo_${orderId.toString()}`;
    const checkout = await this.createCheckout(orderId.toString(), amountGel, description);
    await this.paymentIntentModel.create({
      orderId,
      flittOrderId,
      orderPayload,
      amount: checkout.amount,
      status: 'pending',
      flittPaymentId: checkout.paymentId,
    });
    return { ...checkout, orderId: orderId.toString() };
  }

  async processCallback(payload: Record<string, unknown>) {
    if (!this.verifyCallback(payload)) {
      throw new BadRequestException('Invalid Flitt callback signature');
    }

    const flittOrderId = String(payload.order_id || '');
    const status = String(payload.order_status || '').toLowerCase();
    const paymentStatus = status === 'approved' ? 'paid' : 'failed';
    const update: Record<string, unknown> = {
      paymentStatus,
      flittPaymentId: payload.payment_id ? String(payload.payment_id) : undefined,
    };

    const intent = await this.paymentIntentModel.findOne({ flittOrderId }).exec();
    if (!intent) {
      throw new BadRequestException('Flitt payment intent not found');
    }

    if (paymentStatus === 'paid' && intent.status !== 'paid') {
      await this.orderModel.create({
        _id: intent.orderId,
        ...intent.orderPayload,
        paymentStatus: 'paid',
        flittOrderId,
        flittPaymentId: update.flittPaymentId,
      });
    }
    await this.paymentIntentModel
      .findByIdAndUpdate(intent._id, { ...update, status: paymentStatus })
      .exec();
    return { ok: true };
  }
}
