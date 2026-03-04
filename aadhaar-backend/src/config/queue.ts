// src/queues/queue.ts
import { Queue } from 'bullmq';

export const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};

export const mlPipelineQueue = new Queue('ml-pipeline', {
  connection,
});
