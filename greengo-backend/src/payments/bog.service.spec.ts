import { Types } from 'mongoose';
import { BogService } from './bog.service';
describe('BOG payments', () => {
  let service: BogService,
    intent: any,
    orders: any,
    intents: any,
    receipt: any,
    fetchMock: jest.SpyInstance;
  const query = (value: unknown) => ({
    exec: jest.fn().mockResolvedValue(value),
  });
  beforeEach(() => {
    const orderId = new Types.ObjectId();
    intent = {
      _id: new Types.ObjectId(),
      orderId,
      bogOrderId: 'bank-order',
      status: 'pending',
      amount: 1234,
      orderPayload: { totalAmount: 12.34 },
    };
    orders = {
      updateOne: jest.fn(() => query({ upsertedCount: 1 })),
      findById: jest.fn(() => query({ _id: orderId })),
    };
    intents = {
      findOne: jest.fn(() => query(intent)),
      updateOne: jest.fn(() => query({})),
      create: jest.fn().mockResolvedValue(intent),
      findByIdAndUpdate: jest.fn(() => query({})),
    };
    service = new BogService({ get: () => 'test' } as any, orders, intents);
    receipt = {
      order_id: 'bank-order',
      external_order_id: orderId.toString(),
      order_status: { key: 'completed' },
      purchase_units: {
        request_amount: '12.34',
        transfer_amount: '12.34',
        currency_code: 'GEL',
      },
    };
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const payload = String(url).includes('/token')
        ? { access_token: 'token', expires_in: 300 }
        : receipt;
      return {
        ok: true,
        status: 200,
        json: async () => payload,
        text: async () => JSON.stringify(payload),
      } as Response;
    });
  });
  afterEach(() => jest.restoreAllMocks());
  it('checks the bank before creating a paid order', async () => {
    service.onOrderPaid = jest.fn().mockResolvedValue(undefined);
    expect(
      await service.getStatus(intent.orderId.toString(), 'capability'),
    ).toEqual({ status: 'paid' });
    expect(orders.updateOne).toHaveBeenCalledWith(
      { _id: intent.orderId },
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({ paymentStatus: 'paid' }),
      }),
      { upsert: true },
    );
    expect(service.onOrderPaid).toHaveBeenCalledTimes(1);
  });
  it.each(['rejected', 'processing', 'blocked', 'refunded'])(
    'does not fulfill %s',
    async (key) => {
      receipt.order_status.key = key;
      await service.getStatus(intent.orderId.toString(), 'capability');
      expect(orders.updateOne).not.toHaveBeenCalled();
    },
  );
  it.each(['currency', 'amount', 'externalId', 'paidAmount'])(
    'rejects mismatched %s',
    async (field) => {
      if (field === 'currency') receipt.purchase_units.currency_code = 'USD';
      if (field === 'amount') receipt.purchase_units.request_amount = '1.00';
      if (field === 'paidAmount')
        receipt.purchase_units.transfer_amount = '1.00';
      if (field === 'externalId') receipt.external_order_id = 'other';
      await expect(
        service.getStatus(intent.orderId.toString(), 'capability'),
      ).rejects.toThrow();
      expect(orders.updateOne).not.toHaveBeenCalled();
    },
  );
  it('does not create a second order for an already paid intent', async () => {
    intent.status = 'paid';
    expect(
      await service.getStatus(intent.orderId.toString(), 'capability'),
    ).toEqual({ status: 'paid' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(orders.updateOne).not.toHaveBeenCalled();
  });
  it('does not repeat notifications for an existing order', async () => {
    orders.updateOne.mockReturnValue(query({ upsertedCount: 0 }));
    service.onOrderPaid = jest.fn();
    await service.getStatus(intent.orderId.toString(), 'capability');
    expect(service.onOrderPaid).not.toHaveBeenCalled();
  });
  it('rejects unsigned or forged callbacks', async () => {
    await expect(
      service.processCallback(Buffer.from('{}'), undefined),
    ).rejects.toThrow();
    await expect(
      service.processCallback(Buffer.from('{}'), 'Zm9yZ2Vk'),
    ).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('rejects an invalid status capability', async () => {
    intents.findOne.mockReturnValue(query(null));
    await expect(
      service.getStatus(intent.orderId.toString(), 'wrong'),
    ).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('creates a GEL checkout with HTTPS callbacks', async () => {
    service = new BogService(
      {
        get: (key: string) =>
          key === 'BOG_PUBLIC_API_URL' ? 'https://example.com/api' : 'test',
      } as any,
      orders,
      intents,
    );
    fetchMock.mockImplementation(async (url) => {
      const payload = String(url).includes('/token')
        ? { access_token: 'token', expires_in: 300 }
        : {
            id: 'new-bank-order',
            _links: { redirect: { href: 'https://payment.bog.ge/test' } },
          };
      return {
        ok: true,
        status: 200,
        json: async () => payload,
        text: async () => JSON.stringify(payload),
      } as Response;
    });
    const result = await service.createPaymentIntent({}, 12.34, 'GreenGo');
    expect(result.checkoutUrl).toBe('https://payment.bog.ge/test');
    const options = fetchMock.mock.calls[1][1];
    expect(JSON.parse(options.body)).toMatchObject({
      capture: 'automatic',
      external_order_id: result.orderId,
      purchase_units: { total_amount: 12.34, currency: 'GEL' },
      callback_url: 'https://example.com/api/payments/bog/callback',
    });
    expect(options.headers['Idempotency-Key']).toBeTruthy();
    expect(result.statusToken).toBeTruthy();
    expect(result).not.toHaveProperty('access_token');
  });
  it('does not fulfill when the bank API fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'service unavailable',
      json: async () => ({}),
    });
    await expect(
      service.getStatus(intent.orderId.toString(), 'capability'),
    ).rejects.toThrow();
    expect(orders.updateOne).not.toHaveBeenCalled();
  });
  it.each([0, -1, NaN, Infinity])(
    'rejects invalid checkout amount %s',
    async (amount) => {
      await expect(
        service.createPaymentIntent({}, amount, 'GreenGo'),
      ).rejects.toThrow();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});
