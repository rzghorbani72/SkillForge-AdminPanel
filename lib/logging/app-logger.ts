import { createLogger } from './logger';

/** AdminPanel-wide structured logger. Import this at call sites, not createLogger. */
export const logger = createLogger({ app: 'panel' });
