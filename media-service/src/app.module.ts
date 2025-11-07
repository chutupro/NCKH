import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';

@Module({
  imports: [
    // Multer configuration global
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
})
export class AppModule {}
