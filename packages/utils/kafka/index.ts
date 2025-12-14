import { Kafka } from 'kafkajs';

const brokers = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(',')
  : ['localhost:9092'];

export const kafka = new Kafka({
  clientId: 'kafka-service',
  brokers,
  // Only use SSL/SASL if credentials are provided
  ...(process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD
    ? {
        ssl: true,
        sasl: {
          mechanism: 'plain',
          username: process.env.KAFKA_USERNAME,
          password: process.env.KAFKA_PASSWORD,
        },
      }
    : {}),
});
