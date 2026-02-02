import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogMeta {
  context?: string;
  requestId?: string;
  tenantId?: string;
  [key: string]: unknown;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private sensitiveFields = ['password', 'apiKey', 'token', 'secret', 'authorization', 'question', 'context', 'response'];

  constructor(private configService: ConfigService) {
    const logLevel = this.configService.get<string>('LOG_LEVEL', 'info');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        winston.format.errors({ stack: true }),
        this.sanitizeFormat(),
        nodeEnv === 'production'
          ? winston.format.json()
          : winston.format.combine(winston.format.colorize(), winston.format.simple()),
      ),
      defaultMeta: { service: 'ai-interviewer' },
      transports: [new winston.transports.Console()],
    });
  }

  private sanitizeFormat(): winston.Logform.Format {
    return winston.format((info) => {
      return this.sanitizeObject(info) as winston.Logform.TransformableInfo;
    })();
  }

  private sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized = { ...obj };
    for (const key of Object.keys(sanitized)) {
      if (this.sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key as keyof T] = '[REDACTED]' as T[keyof T];
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key as keyof T] = this.sanitizeObject(
          sanitized[key] as Record<string, unknown>,
        ) as T[keyof T];
      }
    }
    return sanitized;
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }

  logWithMeta(level: LogLevel, message: string, meta: LogMeta): void {
    this.logger.log(level, message, this.sanitizeObject(meta));
  }
}
