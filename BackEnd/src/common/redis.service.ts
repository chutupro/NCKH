import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST') || 'localhost',
      port: this.config.get<number>('REDIS_PORT') || 6379,
      password: this.config.get<string>('REDIS_PASSWORD') || undefined,
      db: this.config.get<number>('REDIS_DB') || 0,
    });

    this.client.on('error', (err) => console.error('❌ Redis Error:', err));
    this.client.on('connect', () => console.log('✅ Redis Connected'));
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (expirySeconds) {
      await this.client.set(key, value, 'EX', expirySeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<number> {
    const keys = await this.client.keys(pattern);
    if (keys.length === 0) return 0;
    return await this.client.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async setAccessJti(userId: number, jti: string): Promise<void> {
    const key = `access_jti:${userId}`;
    await this.client.set(key, jti, 'EX', 900); // 15 minutes = 900 seconds
  }

  async getAccessJti(userId: number): Promise<string | null> {
    const key = `access_jti:${userId}`;
    return await this.client.get(key);
  }

  async deleteAccessJti(userId: number): Promise<number> {
    const key = `access_jti:${userId}`;
    return await this.client.del(key);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
