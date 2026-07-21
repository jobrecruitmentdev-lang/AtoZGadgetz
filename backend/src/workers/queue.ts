import { PgBoss } from 'pg-boss';
import { config } from '../config/env.js';

let boss: PgBoss | null = null;

export const initQueue = async () => {
  if (boss) return boss;

  boss = new PgBoss(config.databaseUrl);

  boss.on('error', (error: Error) => console.error('pg-boss error:', error));

  try {
    await boss.start();
    console.log('pg-boss started successfully.');
    return boss;
  } catch (error) {
    console.error('Failed to start pg-boss:', error);
    throw error;
  }
};

export const getQueue = () => {
  if (!boss) throw new Error('Queue not initialized. Call initQueue() first.');
  return boss;
};
