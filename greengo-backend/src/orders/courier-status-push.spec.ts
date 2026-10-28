import { OrdersService } from './orders.service';
import { CouriersService } from '../couriers/couriers.service';

describe('courier status notifications', () => {
  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
  const chain = (value: unknown): any => ({ populate: () => chain(value), select: () => chain(value), lean: () => chain(value), exec: jest.fn().mockResolvedValue(value) });
  let service: OrdersService;
  let couriers: any;
  let model: any;
  let old: any;
  let updated: any;
  beforeEach(() => {
    old = { _id: 'order', status: 'confirmed', courierId: 'courier', deliveryType: 'delivery' };
    updated = { ...old, restaurantId: { name: 'Cafe' }, courierId: { _id: 'courier' } };
    model = { findById: () => chain(old), findByIdAndUpdate: jest.fn((_id, data) => chain({ ...updated, ...data, courierId: updated.courierId })) };
    couriers = { notifyAvailableCouriersOfNewOrder: jest.fn().mockResolvedValue(undefined) };
    service = new OrdersService(model, {} as any, couriers, {} as any, {} as any, {} as any, {} as any, {} as any);
  });
  it.each(statuses)('notifies the assigned courier for %s', async (status) => {
    old.status = status === 'confirmed' ? 'pending' : 'confirmed';
    await service.updateStatus('order', status);
    expect(couriers.notifyAvailableCouriersOfNewOrder).toHaveBeenCalledWith(expect.objectContaining({ orderId: 'order', courierId: 'courier', status, restaurantName: 'Cafe' }));
  });
  it('does not notify when status is unchanged', async () => {
    await service.updateStatus('order', 'confirmed');
    expect(couriers.notifyAvailableCouriersOfNewOrder).not.toHaveBeenCalled();
  });
  it('does not notify for pickup orders', async () => {
    updated.deliveryType = 'pickup';
    await service.updateStatus('order', 'ready');
    expect(couriers.notifyAvailableCouriersOfNewOrder).not.toHaveBeenCalled();
  });
  it('notifies available couriers before assignment', async () => {
    old.courierId = null; updated.courierId = null;
    await service.updateStatus('order', 'ready');
    expect(couriers.notifyAvailableCouriersOfNewOrder).toHaveBeenCalledWith(expect.objectContaining({ courierId: undefined, status: 'ready' }));
  });
  it('notifies after successful card payment', async () => {
    const bog: any = {};
    service = new OrdersService(model, { findById: () => chain({ name: 'Cafe' }) } as any, couriers, {} as any, {} as any, { sendOrderNotificationSms: jest.fn() } as any, bog, {} as any);
    jest.spyOn(service as any, 'scheduleBusinessOrderNotifications').mockImplementation(() => {});
    service.onModuleInit();
    await bog.onOrderPaid({ ...updated, status: 'pending' });
    expect(couriers.notifyAvailableCouriersOfNewOrder).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending' }));
  });
  it.each(statuses)('includes the correct status and courier target in FCM for %s', async (status) => {
    const find = jest.fn((_filter: unknown) => chain([{ fcmToken: 'token' }]));
    const send = jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0, invalidTokens: [] });
    const courierService = new CouriersService({ find } as any, {} as any, {} as any, { isReady: () => true, send } as any);
    await courierService.notifyAvailableCouriersOfNewOrder({ orderId: 'order', courierId: 'assigned', status });
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ _id: 'assigned' }));
    expect(find.mock.calls[0][0]).not.toHaveProperty('status');
    expect(send).toHaveBeenCalledWith([expect.objectContaining({ data: expect.objectContaining({ status, orderId: 'order' }) })]);
  });
});
