import { TicketUpdatedEvent } from '@fedev9ticketing/common/build';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  //create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  //create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });

  await ticket.save();

  //create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'new concert',
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  //create fake msg obj
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  //retun all of this stuff
  return { listener, msg, data, ticket };
};

it('finds, updates, and saves a ticket', async () => {
  const { listener, msg, data, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, msg, data, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const { listener, msg, data, ticket } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
