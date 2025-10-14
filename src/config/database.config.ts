import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Creates TypeORM configuration for MySQL
 */
export function createDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    // logging: configService.get<string>('NODE_ENV') === 'development',
    charset: 'utf8mb4',
    extra: {
      connectionLimit: 10,         // Số lượng kết nối tối đa trong pool
      queueLimit: 0,               // Số lượng yêu cầu kết nối tối đa trong hàng đợi (0 = không giới hạn)
      waitForConnections: true,    // Chờ kết nối nếu pool đầy
    },
  };
}

