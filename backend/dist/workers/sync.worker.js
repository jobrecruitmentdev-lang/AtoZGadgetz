import { getQueue } from './queue.js';
import { CjSyncService } from '../services/cj/cj-sync.service.js';
export const JOB_SYNC_CJ_PRODUCTS = 'sync-cj-products';
export const startWorkers = async () => {
    const boss = getQueue();
    // Register worker for full CJ catalog sync
    await boss.work(JOB_SYNC_CJ_PRODUCTS, async (jobs) => {
        for (const job of jobs) {
            console.log(`[Worker] Processing job ${job.id}: ${job.name}`);
            try {
                await CjSyncService.syncAllCategories(2);
                console.log(`[Worker] Job ${job.id} completed successfully.`);
            }
            catch (error) {
                console.error(`[Worker] Job ${job.id} failed:`, error);
                throw error;
            }
        }
    });
    console.log('[Worker] Registered background workers.');
    // Schedule cron job to run daily at 2:00 AM
    await boss.schedule(JOB_SYNC_CJ_PRODUCTS, '0 2 * * *');
    // Also queue it immediately once for initial setup (if not already queued)
    await boss.send(JOB_SYNC_CJ_PRODUCTS, {}, { singletonKey: 'initial-sync' });
};
//# sourceMappingURL=sync.worker.js.map