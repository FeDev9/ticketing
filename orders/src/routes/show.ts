import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@fedev9ticketing/common/build';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket'); // populate recupera anche il ticket associato

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    res.send(order);
  }
);

export { router as showOrderRouter };
