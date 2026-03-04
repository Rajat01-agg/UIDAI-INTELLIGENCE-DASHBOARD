// src/workers/mlPipeline.worker.ts
import { Worker } from 'bullmq';
import axios from 'axios';
import { connection } from '../config/queue.ts';

new Worker(
  'ml-pipeline',
  async (job) => {
    console.log('🚀 ML Pipeline Job Started:', job.id);

    await axios.post(
      `${process.env.ML_SERVICE_URL}/run-pipeline`,
      job.data,
      { timeout: 1000 * 60 * 10 } // 10 mins
    );

    console.log('✅ ML Pipeline Completed');
  },
  { connection }
);
