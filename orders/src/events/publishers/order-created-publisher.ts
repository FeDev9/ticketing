import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@fedev9ticketing/common/build';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
