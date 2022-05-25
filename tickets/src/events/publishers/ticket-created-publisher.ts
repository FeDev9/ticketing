import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@fedev9ticketing/common/build';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
