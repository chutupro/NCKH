import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Roles } from 'src/modules/entities/role.entity';
import { Users } from 'src/modules/entities/user.entity';
import { UserProfiles } from 'src/modules/entities/user-profile.entity';
import { Articles } from 'src/modules/entities/article.entity';
import { Categories } from 'src/modules/entities/category.entity';
import { Comments } from 'src/modules/entities/comment.entity';
import { Likes } from 'src/modules/entities/like.entity';
import { Analytics } from 'src/modules/entities/analytics.entity';
import { Feedback } from 'src/modules/entities/feedback.entity';
import { Contributions } from 'src/modules/entities/contribution.entity';
import { Images } from 'src/modules/entities/image.entity';
import { LearningMaterials } from 'src/modules/entities/learning-material.entity';
import { Timelines } from 'src/modules/entities/timeline.entity';
import { VersionHistory } from 'src/modules/entities/version-history.entity';
import { Notifications } from 'src/modules/entities/notification.entity';
import { MapLocations } from 'src/modules/entities/map-location.entity';
import { ModerationLogs } from 'src/modules/entities/moderation-log.entity';
import { ImageComparison } from '../modules/entities/image-comparison.entity'; // <-- thêm nếu cần
import { OTP } from 'src/modules/entities/otp.entity';

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
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3310),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_NAME', 'DaNangDynamicVault'),
        entities: [
          Roles,
          Users,
          UserProfiles,
          Articles,
          Categories,
          Comments,
          Likes,
          Analytics,
          Feedback,
          Contributions,
          Images,
          LearningMaterials,
          Timelines,
          VersionHistory,
          MapLocations,
          Notifications,
          ModerationLogs,
          ImageComparison,
          OTP, // <-- OTP entity
        ],
        synchronize: false, // <-- turn off automatic schema sync in dev when tables conflict
        logging: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}