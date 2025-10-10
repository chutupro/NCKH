import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { 
  Role, 
  User, 
  Article, 
  Analytics, 
  Contribution, 
  Feedback, 
  Image, 
  ModerationLog, 
  Timeline, 
  VersionHistory 
} from '../modules/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3310),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', '123456'),
        database: configService.get('DB_NAME', 'DaNangDynamicVault'),
        entities: [
          Role,User,Article,
          Analytics,Contribution, Feedback,
          Image,ModerationLog,Timeline,VersionHistory],
        // synchronize: configService.get('NODE_ENV') === 'development',
        // logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class databaseModule {}
