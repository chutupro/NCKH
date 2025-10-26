import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from '../entities/comment.entity';
import { Users } from '../entities/user.entity';
import { Articles } from '../entities/article.entity';
import { CommentService } from './services/comment.service'; 
import { CommentController } from './controllers/comment.controller'; 

@Module({
  imports: [TypeOrmModule.forFeature([Comments, Users, Articles])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
