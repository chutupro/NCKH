import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Articles } from '../entities/article.entity';
import { Users } from '../entities/user.entity';
import { UserProfiles } from '../entities/user-profile.entity';
import { Categories } from '../entities/category.entity';
import { Images } from '../entities/image.entity';
import { Analytics } from '../entities/analytics.entity';
import { Likes } from '../entities/like.entity';
import { ArticleService } from './article-post.service'; 
import { ArticleController } from './article-post.controller'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Articles,
      Users,
      UserProfiles,
      Categories,
      Images,
      Analytics,
      Likes,
    ]),
  ],
  providers: [ArticleService],
  controllers: [ArticleController],
})
export class ArticleModule {}