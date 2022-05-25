import mongoose from 'mongoose';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import {
  ExpirationCompleteEvent,
  OrderStatus,
} from '@fedev9ticketing/common/build';
import { Message } from 'node-nats-streaming';
import { OrderCancelledPublisher } from '../../publishers/order-cancelled-publisher';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const order = Order.build({
    userId: 'userId',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it('updates order status to cancelled', async () => {
  const { listener, order, ticket, msg, data } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('emit order cancelled event', async () => {
  const { listener, order, ticket, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it('ack msg', async () => {
  const { listener, order, ticket, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
