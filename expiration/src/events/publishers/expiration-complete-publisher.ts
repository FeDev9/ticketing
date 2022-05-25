import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@fedev9ticketing/common/build';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
