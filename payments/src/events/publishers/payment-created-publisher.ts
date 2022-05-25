import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@fedev9ticketing/common/build';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
