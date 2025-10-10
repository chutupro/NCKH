import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
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

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'DaNangDynamicVault',
  entities: [
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
  ],
  synchronize: true,
  // logging: true,
};
