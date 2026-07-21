import cron from 'node-cron';
import { CjSyncService } from '../services/cj/cj-sync.service.js';
let isSyncing = false;
export const startWorkers = async () => {
    console.log('[Worker] Initializing node-cron background workers.');
    const runSync = async () => {
        if (isSyncing) {
            console.log('[Worker] Sync is already running. Skipping.');
            return;
        }
        isSyncing = true;
        try {
            console.log('[Worker] Starting CJ Products Sync...');
            await CjSyncService.syncAllCategories(2);
            console.log('[Worker] Completed CJ Products Sync.');
        }
        catch (error) {
            console.error('[Worker] Failed CJ Products Sync:', error);
        }
        finally {
            isSyncing = false;
        }
    };
    // Schedule cron job to run daily at 2:00 AM
    cron.schedule('0 2 * * *', runSync);
    // Run the initial sync immediately in the background
    setTimeout(runSync, 5000); // Wait 5 seconds after boot to start
};
//# sourceMappingURL=sync.worker.js.map