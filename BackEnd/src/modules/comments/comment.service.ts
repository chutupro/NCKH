import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comments } from 'src/modules/entities/comment.entity';
import { Users } from 'src/modules/entities/user.entity';
import { Articles } from 'src/modules/entities/article.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

export interface CommentData {
  id: number;
  content: string;
  createdAt: Date;
  parentCommentId: number | null;
  replyToName?: string;
  author: {
    id: number;
    fullName: string;
    avatar: string;
  };
  replies: CommentData[];
}

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

  async createComment(dto: CreateCommentDto) {
    const user = await this.userRepo.findOne({ 
      where: { UserID: dto.userId },
      relations: ['profile'], // ✅ Load profile để lấy avatar
    });
    const article = await this.articleRepo.findOne({ where: { ArticleID: dto.articleId } });

    if (!user) throw new BadRequestException('User not found');
    if (!article) throw new BadRequestException('Article not found');

    const commentData: Partial<Comments> = {
      Content: dto.content,
      UserID: dto.userId,
      ArticleID: dto.articleId,
      ParentCommentID: dto.parentCommentId || undefined, // ✅ Cho phép reply
      user,
      article,
    };

    const comment = this.commentRepo.create(commentData);
    const saved = await this.commentRepo.save(comment);

    return {
      id: saved.CommentID,
      content: saved.Content,
      createdAt: saved.CreatedAt,
      parentCommentId: saved.ParentCommentID,
      replyToName: dto.replyToName,
      author: {
        id: user.UserID,
        fullName: user.FullName,
        avatar: user.profile?.Avatar || '/img/default-avatar.png', // ✅ Lấy avatar từ profile
      },
    };
  }

  async getCommentsByArticle(articleId: number): Promise<CommentData[]> {
    const comments = await this.commentRepo.find({
      where: { ArticleID: articleId },
      relations: ['user', 'user.profile'], // ✅ Load cả profile để lấy avatar
      order: { CreatedAt: 'ASC' },
    });

    const commentMap = new Map<number, CommentData>();
    const rootComments: CommentData[] = [];

    comments.forEach((c) => {
      const commentData: CommentData = {
        id: c.CommentID,
        content: c.Content,
        createdAt: c.CreatedAt,
        parentCommentId: c.ParentCommentID,
        replyToName: undefined, // Sẽ được set sau
        author: {
          id: c.user.UserID,
          fullName: c.user.FullName,
          avatar: c.user.profile?.Avatar || '/img/default-avatar.png',
        },
        replies: [],
      };
      commentMap.set(c.CommentID, commentData);
    });

    commentMap.forEach((comment) => {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {

          comment.replyToName = parent.author.fullName;
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  async updateComment(commentId: number, content: string, userId: number) {
    const comment = await this.commentRepo.findOne({ 
      where: { CommentID: commentId },
      relations: ['user', 'user.profile'], // ✅ Load profile để lấy avatar
    });
    if (!comment) throw new BadRequestException('Comment not found');

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

  async deleteComment(commentId: number, userId: number) {
    const comment = await this.commentRepo.findOne({ 
      where: { CommentID: commentId },
    });
    if (!comment) throw new BadRequestException('Comment not found');

    if (comment.UserID !== userId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    const replies = await this.commentRepo.find({
      where: { ParentCommentID: commentId },
    });

    if (replies.length > 0) {
      await this.commentRepo.remove(replies);
    }

    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

}
