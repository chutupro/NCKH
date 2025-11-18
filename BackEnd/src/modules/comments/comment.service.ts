import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comments } from 'src/modules/entities/comment.entity';
import { Users } from 'src/modules/entities/user.entity';
import { Articles } from 'src/modules/entities/article.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comments)
    private readonly commentRepo: Repository<Comments>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    @InjectRepository(Articles)
    private readonly articleRepo: Repository<Articles>,
  ) {}

  // ---- CREATE COMMENT ----
  async createComment(dto: CreateCommentDto) {
    const user = await this.userRepo.findOne({ 
      where: { UserID: dto.userId },
      relations: ['profile'], // ✅ Load profile để lấy avatar
    });
    const article = await this.articleRepo.findOne({ where: { ArticleID: dto.articleId } });

    if (!user) throw new BadRequestException('User not found');
    if (!article) throw new BadRequestException('Article not found');

    // ⚠️ Không cho phép reply → luôn gán ParentCommentID = null
    const commentData: Partial<Comments> = {
      Content: dto.content,
      UserID: dto.userId,
      ArticleID: dto.articleId,
      ParentCommentID: null as any, // 👈 ép null, không cho phép nested comment
      user,
      article,
    };

    const comment = this.commentRepo.create(commentData);
    const saved = await this.commentRepo.save(comment);

    return {
      id: saved.CommentID,
      content: saved.Content,
      createdAt: saved.CreatedAt,
      author: {
        id: user.UserID,
        fullName: user.FullName,
        avatar: user.profile?.Avatar || '/img/default-avatar.png', // ✅ Lấy avatar từ profile
      },
    };
  }

  // ---- GET COMMENTS BY ARTICLE ----
  async getCommentsByArticle(articleId: number) {
    const comments = await this.commentRepo.find({
      where: { ArticleID: articleId },
      relations: ['user', 'user.profile'], // ✅ Load cả profile để lấy avatar
      order: { CreatedAt: 'ASC' },
    });

    // Vì không có reply, chỉ trả về danh sách phẳng với avatar
    return comments.map((c) => ({
      id: c.CommentID,
      content: c.Content,
      createdAt: c.CreatedAt,
      author: {
        id: c.user.UserID,
        fullName: c.user.FullName,
        avatar: c.user.profile?.Avatar || '/img/default-avatar.png', // ✅ Lấy avatar từ profile
      },
    }));
  }

  // ---- UPDATE COMMENT ----
  async updateComment(commentId: number, content: string, userId: number) {
    const comment = await this.commentRepo.findOne({ 
      where: { CommentID: commentId },
      relations: ['user', 'user.profile'], // ✅ Load profile để lấy avatar
    });
    if (!comment) throw new BadRequestException('Comment not found');
    
    // Kiểm tra quyền sở hữu
    if (comment.UserID !== userId) {
      throw new BadRequestException('You can only edit your own comments');
    }

    comment.Content = content;
    await this.commentRepo.save(comment);

    return {
      id: comment.CommentID,
      content: comment.Content,
      updatedAt: new Date(),
      author: {
        id: comment.user.UserID,
        fullName: comment.user.FullName,
        avatar: comment.user.profile?.Avatar || '/img/default-avatar.png', // ✅ Lấy avatar từ profile
      },
    };
  }

  // ---- DELETE COMMENT ----
  async deleteComment(commentId: number, userId: number) {
    const comment = await this.commentRepo.findOne({ 
      where: { CommentID: commentId },
    });
    if (!comment) throw new BadRequestException('Comment not found');
    
    // Kiểm tra quyền sở hữu
    if (comment.UserID !== userId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

}
