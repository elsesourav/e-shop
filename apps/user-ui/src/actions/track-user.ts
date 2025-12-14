'use server';
import { kafka } from '@packages/utils/kafka';
import { DeviceInfoType } from '../hooks/useDeviceTracking';
import { LocationType } from '../hooks/useLocationTracking';

const producer = kafka.producer();

type KafkaEvent = {
  action: string;
  userId?: string;
  productId?: string;
  shopId?: string;
  deviceInfo?: DeviceInfoType | any;
  location?: LocationType | any;
};

export const sendKafkaEvent = async (eventData: KafkaEvent) => {
  try {
    await producer.connect();
    await producer.send({
      topic: 'users-events',
      messages: [{ value: JSON.stringify(eventData) }],
    });
  } catch (error) {
    console.log('Error sending Kafka event:', error);
  } finally {
    await producer.disconnect();
  }
};
