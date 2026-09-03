import { createLogger } from './logger';
import { LOG_CATALOG } from './log-catalog';

/** Panel-wide structured logger. Import this at call sites, not createLogger. */
export const logger = createLogger({ app: 'panel', catalog: LOG_CATALOG });
