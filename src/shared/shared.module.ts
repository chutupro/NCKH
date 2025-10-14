import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './services/file-upload.service';
import { ValidationService } from './services/validation.service';

/**
 * Global shared module for common services
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [FileUploadService, ValidationService],
  exports: [FileUploadService, ValidationService],
})
export class SharedModule {}

