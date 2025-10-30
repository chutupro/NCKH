import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from 'src/modules/entities/comment.entity'; 
import { Users } from 'src/modules/entities/user.entity'; 
import { Articles } from 'src/modules/entities/article.entity'; 
import { CommentService } from './comment.service'; 
import { CommentController } from './comment.controller'; 

@Module({
  imports: [TypeOrmModule.forFeature([Comments, Users, Articles])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}