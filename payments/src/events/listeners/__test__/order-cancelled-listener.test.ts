import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from '@fedev9ticketing/common/build';
import mongoose, { version } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: 'user',
    version: 0,
  });
  await order.save();

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: 'id',
    },
  };

  return { listener, msg, data, order };
};

it('updates the status of the order', async () => {
  const { listener, msg, data, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks msg', async () => {
  const { listener, msg, data, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
