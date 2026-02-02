import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const INTERVIEW_INITIATION_QUEUE = 'interview-initiation';
export const INTERVIEW_REMINDER_QUEUE = 'interview-reminder';
export const INTERVIEW_COMPLETION_QUEUE = 'interview-completion';
export const WEBHOOK_DELIVERY_QUEUE = 'webhook-delivery';
export const CLEANUP_QUEUE = 'cleanup';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 1000,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: INTERVIEW_INITIATION_QUEUE },
      { name: INTERVIEW_REMINDER_QUEUE },
      { name: INTERVIEW_COMPLETION_QUEUE },
      { name: WEBHOOK_DELIVERY_QUEUE },
      { name: CLEANUP_QUEUE },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
