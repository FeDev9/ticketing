import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@fedev9ticketing/common/build';
import { isYieldExpression } from 'typescript';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

//jest.mock('../../stripe.ts');

it("return a 404 when purchasing an rder that doesn't exist", async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'token',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('return a 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 100,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'token',
      orderId: order.id,
    })
    .expect(401);
});

it('return a 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    version: 0,
    userId,
    price: 100,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'token',
      orderId: order.id,
    })
    .expect(400);
});

it('returna a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 10000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId,
    price,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = stripe.charges.list({ limit: 50 });
  const stripeCharge = (await stripeCharges).data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual('usd');
  expect(stripeCharge?.amount).toEqual(price * 100);

  const payment = Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});
