import type { LogEntry, LogSink } from './logger';

/** Prints the same JSON line Loki stores, at the matching console level. */
export const consoleSink: LogSink = (entry: LogEntry): void => {
  const line = JSON.stringify(entry);
  if (entry.level === 'error') console.error(line);
  else if (entry.level === 'warn') console.warn(line);
  else console.log(line);
};

export const teeSinks =
  (...sinks: LogSink[]): LogSink =>
  (entry) => {
    for (const sink of sinks) sink(entry);
  };
