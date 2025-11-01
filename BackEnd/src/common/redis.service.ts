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

  /**
   * Set key với expiry (seconds)
   */
  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (expirySeconds) {
      await this.client.set(key, value, 'EX', expirySeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  /**
   * Delete multiple keys by pattern
   */
  async delByPattern(pattern: string): Promise<number> {
    const keys = await this.client.keys(pattern);
    if (keys.length === 0) return 0;
    return await this.client.del(...keys);
  }

  /**
   * Check if key exists
   * 
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
