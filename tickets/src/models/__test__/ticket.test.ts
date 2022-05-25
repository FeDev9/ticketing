import { TicketCreatedPublisher } from '../../events/publishers/ticket-created-publisher';
import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  //Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'title',
    price: 20,
    userId: '123',
  });
  //save ticket to the database
  await ticket.save();

  //fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  //make two separate changes to the tickets we fecthed
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ title: 'title2' });

  //save the first fetched ticket
  await firstInstance!.save();

  //save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('incremnts the version number on multiple saves', async () => {
  //Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'title',
    price: 20,
    userId: '123',
  });
  //save ticket to the database
  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
