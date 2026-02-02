import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import Redis from 'ioredis';

export interface ComponentHealth {
  status: 'healthy' | 'unhealthy';
  message?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  components: {
    database: ComponentHealth;
    redis: ComponentHealth;
  };
}

@Injectable()
export class HealthService {
  private redisClient: Redis | null = null;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService,
  ) {
    this.initRedisClient();
  }

  private initRedisClient(): void {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.redisClient = new Redis({
      host,
      port,
      password: password || undefined,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });
  }

  async check(): Promise<HealthStatus> {
    const [databaseHealth, redisHealth] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const isHealthy = databaseHealth.status === 'healthy' && redisHealth.status === 'healthy';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      components: {
        database: databaseHealth,
        redis: redisHealth,
      },
    };
  }

  private async checkDatabase(): Promise<ComponentHealth> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  private async checkRedis(): Promise<ComponentHealth> {
    if (!this.redisClient) {
      return { status: 'unhealthy', message: 'Redis client not initialized' };
    }

    try {
      const result = await this.redisClient.ping();
      if (result === 'PONG') {
        return { status: 'healthy' };
      }
      return { status: 'unhealthy', message: 'Unexpected Redis response' };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown Redis error',
      };
    }
  }
}
