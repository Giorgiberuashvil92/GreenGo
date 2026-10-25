import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID, verify } from 'crypto';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import {
  BogPaymentIntent,
  BogPaymentIntentDocument,
} from './schemas/bog-payment-intent.schema';

// Published at https://api.bog.ge/docs/payments/standard-process/callback
const CALLBACK_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu4RUyAw3+CdkS3ZNILQh
zHI9Hemo+vKB9U2BSabppkKjzjjkf+0Sm76hSMiu/HFtYhqWOESryoCDJoqffY0Q
1VNt25aTxbj068QNUtnxQ7KQVLA+pG0smf+EBWlS1vBEAFbIas9d8c9b9sSEkTrr
TYQ90WIM8bGB6S/KLVoT1a7SnzabjoLc5Qf/SLDG5fu8dH8zckyeYKdRKSBJKvhx
tcBuHV4f7qsynQT+f2UYbESX/TLHwT5qFWZDHZ0YUOUIvb8n7JujVSGZO9/+ll/g
4ZIWhC1MlJgPObDwRkRd8NFOopgxMcMsDIZIoLbWKhHVq67hdbwpAq9K9WMmEhPn
PwIDAQAB
-----END PUBLIC KEY-----`;
const API = 'https://api.bog.ge/payments/v1';
type Receipt = {
  order_id: string;
  external_order_id: string;
  order_status: { key: string };
  purchase_units: {
    request_amount: string;
    transfer_amount: string;
    currency_code: string;
  };
};
@Injectable()
export class BogService {
  private token?: { value: string; expiresAt: number };
  onOrderPaid?: (order: OrderDocument) => Promise<void>;
  constructor(
    private readonly config: ConfigService,
    @InjectModel(Order.name) private readonly orders: Model<OrderDocument>,
    @InjectModel(BogPaymentIntent.name)
    private readonly intents: Model<BogPaymentIntentDocument>,
  ) {}
  private get publicUrl() {
    return (
      this.config.get<string>('BOG_PUBLIC_API_URL') ||
      'https://greengo-production.up.railway.app/api'
    ).replace(/\/$/, '');
  }
  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now())
      return this.token.value;
    const id = this.config.get<string>('BOG_CLIENT_ID');
    const secret = this.config.get<string>('BOG_CLIENT_SECRET');
    if (!id || !secret)
      throw new InternalServerErrorException(
        'BOG credentials are not configured',
      );
    const response = await fetch(
      'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token',
      {
        method: 'POST',
        signal: AbortSignal.timeout(15000),
        headers: {
          Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      },
    );
    if (!response.ok)
      throw new InternalServerErrorException('BOG authentication failed');
    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };
    if (!data.access_token)
      throw new InternalServerErrorException('BOG token missing');
    // Support both seconds and the epoch-millisecond value used by older responses.
    const expiry =
      data.expires_in > 1e12
        ? data.expires_in
        : Date.now() + data.expires_in * 1000;
    this.token = { value: data.access_token, expiresAt: expiry - 30000 };
    return data.access_token;
  }
  private async request(path: string, body?: unknown, idempotencyKey?: string) {
    const response = await fetch(`${API}${path}`, {
      method: body ? 'POST' : 'GET',
      signal: AbortSignal.timeout(20000),
      headers: {
        Authorization: `Bearer ${await this.accessToken()}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'ka',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      if (response.status === 401) this.token = undefined;
      throw new InternalServerErrorException('BOG payment request failed');
    }
    return response.json();
  }
  async createPaymentIntent(
    orderPayload: Record<string, unknown>,
    amountGel: number,
    description: string,
  ) {
    const amount = Math.round(amountGel * 100);
    if (!Number.isSafeInteger(amount) || amount < 1)
      throw new BadRequestException('Invalid payment amount');
    if (!this.publicUrl.startsWith('https://'))
      throw new InternalServerErrorException(
        'BOG public API URL must use HTTPS',
      );
    const orderId = new Types.ObjectId();
    const statusToken = randomUUID();
    const intent = await this.intents.create({
      orderId,
      statusToken,
      orderPayload,
      amount,
      status: 'pending',
    });
    const result = (await this.request(
      '/ecommerce/orders',
      {
        application_type: 'mobile',
        capture: 'automatic',
        external_order_id: orderId.toString(),
        callback_url: `${this.publicUrl}/payments/bog/callback`,
        purchase_units: {
          currency: 'GEL',
          total_amount: amount / 100,
          basket: [
            {
              product_id: orderId.toString(),
              description,
              quantity: 1,
              unit_price: amount / 100,
            },
          ],
        },
        redirect_urls: {
          success: `${this.publicUrl}/payments/bog/return`,
          fail: `${this.publicUrl}/payments/bog/return`,
        },
        ttl: 15,
      },
      randomUUID(),
    )) as { id: string; _links: { redirect: { href: string } } };
    if (!result.id || !result._links?.redirect?.href)
      throw new InternalServerErrorException(
        'BOG checkout response incomplete',
      );
    await this.intents
      .findByIdAndUpdate(intent._id, { bogOrderId: result.id })
      .exec();
    return {
      orderId: orderId.toString(),
      checkoutUrl: result._links.redirect.href,
      statusToken,
    };
  }
  async processCallback(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ) {
    if (
      !rawBody ||
      !signature ||
      !verify(
        'RSA-SHA256',
        rawBody,
        CALLBACK_KEY,
        Buffer.from(signature, 'base64'),
      )
    ) {
      throw new BadRequestException('Invalid BOG callback signature');
    }
    const payload = JSON.parse(rawBody.toString()) as {
      event: string;
      body: Receipt;
    };
    if (payload.event !== 'order_payment' || !payload.body?.order_id)
      throw new BadRequestException('Invalid BOG event');
    await this.reconcile(payload.body.order_id);
    return { ok: true };
  }
  private async reconcile(bogOrderId: string) {
    const intent = await this.intents.findOne({ bogOrderId }).exec();
    if (!intent) throw new NotFoundException('Payment not found');
    if (intent.status === 'paid') return intent.status;
    const receipt = (await this.request(
      `/receipt/${encodeURIComponent(bogOrderId)}`,
    )) as Receipt;
    if (
      receipt.order_id !== bogOrderId ||
      receipt.external_order_id !== intent.orderId.toString() ||
      receipt.purchase_units?.currency_code !== 'GEL' ||
      Math.round(Number(receipt.purchase_units.request_amount) * 100) !==
        intent.amount
    ) {
      throw new BadRequestException('BOG payment details do not match');
    }
    if (receipt.order_status.key === 'completed') {
      if (
        Math.round(Number(receipt.purchase_units.transfer_amount) * 100) !==
        intent.amount
      )
        throw new BadRequestException('BOG paid amount does not match');
      // Atomic upsert makes concurrent callbacks and status checks create one order.
      const result = await this.orders
        .updateOne(
          { _id: intent.orderId },
          {
            $setOnInsert: {
              ...intent.orderPayload,
              _id: intent.orderId,
              paymentStatus: 'paid',
              bogOrderId,
            },
          },
          { upsert: true },
        )
        .exec();
      await this.intents
        .updateOne({ _id: intent._id }, { $set: { status: 'paid' } })
        .exec();
      if (result.upsertedCount && this.onOrderPaid) {
        const order = await this.orders.findById(intent.orderId).exec();
        if (order) await this.onOrderPaid(order);
      }
      return 'paid';
    }
    if (receipt.order_status.key === 'rejected') {
      await this.intents
        .updateOne(
          { _id: intent._id, status: { $ne: 'paid' } },
          { $set: { status: 'failed' } },
        )
        .exec();
      return 'failed';
    }
    return 'pending';
  }
  async getStatus(orderId: string, token: string) {
    if (!Types.ObjectId.isValid(orderId) || !token)
      throw new NotFoundException('Payment not found');
    const intent = await this.intents
      .findOne({ orderId, statusToken: token })
      .exec();
    if (!intent) throw new NotFoundException('Payment not found');
    const status =
      intent.status === 'paid'
        ? 'paid'
        : intent.bogOrderId
          ? await this.reconcile(intent.bogOrderId)
          : 'pending';
    return { status };
  }
}
