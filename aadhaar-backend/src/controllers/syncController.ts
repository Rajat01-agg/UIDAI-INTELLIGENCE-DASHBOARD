// src/controllers/mlSync.controller.ts
import { mlPipelineQueue } from '../config/queue.ts';
import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.ts';

export const triggerMLSync = async (req: AuthRequest, res: Response) => {
    const { source = 'data.gov.in', force = false } = req.body;

    if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }

    const job = await mlPipelineQueue.add(
        'run-ml-pipeline',
        {
            triggeredBy: req.user.id,
            source,
            force,
            triggeredAt: new Date(),
        },
        {
            attempts: 2,
            backoff: { type: 'exponential', delay: 3000 },
            removeOnComplete: true,
        }
    );

    res.json({
        success: true,
        message: 'ML pipeline sync started',
        jobId: job.id,
    });
};
