import { kafka } from '@packages/utils/kafka';
import { updateUserAnalytics } from 'apps/kafka-service/src/services/analytics.service';

const consumer = kafka.consumer({ groupId: 'user-events-group' });
const UPDATE_DELAY = 3000; // 3 seconds
const validActions = [
  'PRODUCT_VIEW',
  'PURCHASE',
  'ADD_TO_CART',
  'ADD_TO_WISHLIST',
  'REMOVE_FROM_CART',
  'REMOVE_FROM_WISHLIST',
];

const eventQueue: any[] = [];

const processQueue = async () => {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0;

  for (const event of events) {
    if (event.action === 'SHOP_VISIT') {
      // update shop analytics
    }

    if (!event.action || !validActions.includes(event.action)) {
      continue;
    }

    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.log('Error updating user analytics:', error);
    }
  }
};

setInterval(processQueue, UPDATE_DELAY);

// kafka consumer for user events
export const consumeKafkaMessages = async () => {
  // connect to the kafka broker
  await consumer.connect();

  await consumer.subscribe({ topic: 'users-events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const event = JSON.parse(message.value.toString());
      eventQueue.push(event);
    },
  });
};

consumeKafkaMessages().catch(console.error);
