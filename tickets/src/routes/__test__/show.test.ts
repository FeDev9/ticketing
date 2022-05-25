import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('returns a 404 if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const response = await request(app)
    .get(`api/tickets/${id}`)
    .send()
    .expect(404);
});

it('returns the ticket if ticket is found', async () => {
  const title = 'title';
  const price = 20;

  //create ticket
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
