/**
 * Centralized logging service for the Catalan FlashCards application.
 *
 * Features:
 * - Log levels: debug, info, warn, error
 * - Production mode only shows warn and error
 * - Context parameter for identifying source
 * - History buffer for debugging (last 100 entries)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel;
  private history: LogEntry[] = [];
  private readonly maxHistory = 100;

  constructor() {
    // In production, only show warnings and errors
    // In development, show all logs
    this.minLevel = import.meta.env.PROD ? 'warn' : 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = entry.context ? `[${entry.context}]` : '';
    return `${prefix} ${entry.message}`.trim();
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: Record<string, unknown>
  ): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date(),
    };

    // Store in history (always, regardless of log level)
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Only output to console if level meets threshold
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(entry);

    switch (level) {
      case 'error':
        if (data) {
          console.error(formatted, data);
        } else {
          console.error(formatted);
        }
        break;
      case 'warn':
        if (data) {
          console.warn(formatted, data);
        } else {
          console.warn(formatted);
        }
        break;
      default:
        if (data) {
          console.log(formatted, data);
        } else {
          console.log(formatted);
        }
    }
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('debug', message, context, data);
  }

  /**
   * Log general information (development only)
   */
  info(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('info', message, context, data);
  }

  /**
   * Log warnings (always shown)
   */
  warn(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('warn', message, context, data);
  }

  /**
   * Log errors (always shown)
   */
  error(message: string, context?: string, data?: Record<string, unknown>): void {
    this.log('error', message, context, data);
  }

  /**
   * Get the log history (useful for debugging)
   */
  getHistory(): LogEntry[] {
    return [...this.history];
  }

  /**
   * Clear the log history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Set the minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Get the current minimum log level
   */
  getMinLevel(): LogLevel {
    return this.minLevel;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogEntry };
