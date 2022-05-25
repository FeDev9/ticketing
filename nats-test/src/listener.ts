import { randomBytes } from 'crypto';
import nats, { Message, Stan } from 'node-nats-streaming';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed!');
  });

  new TicketCreatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());

//Terminal

//per l'accesso alle porte del nats eseguire il comando kubectl port-forward [nats-pod-id] 4222:4222 / 8222:8222

//accedere a localhost:8222/streaming per il monitoraggio
