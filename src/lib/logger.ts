/**
 * Logger Wrapper para Frontend
 * Solo loguea en development, silencioso en production
 *
 * Uso:
 * import { logger } from '@/lib/logger';
 * logger.log('mensaje');
 * logger.error('error', error);
 */

const isDevelopment = process.env.NODE_ENV === "development";

type LogMethod = "log" | "info" | "warn" | "error" | "debug";

class Logger {
  private shouldLog = isDevelopment;

  log(...args: any[]): void {
    if (this.shouldLog) {
      console.log(...args);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog) {
      console.info(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    // Siempre mostrar errores, incluso en producción
    console.error(...args);
  }

  debug(...args: any[]): void {
    if (this.shouldLog) {
      console.debug(...args);
    }
  }

  table(data: any): void {
    if (this.shouldLog && console.table) {
      console.table(data);
    }
  }

  group(label: string): void {
    if (this.shouldLog && console.group) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.shouldLog && console.groupEnd) {
      console.groupEnd();
    }
  }

  time(label: string): void {
    if (this.shouldLog && console.time) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog && console.timeEnd) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();

// Exportar también como default
export default logger;
