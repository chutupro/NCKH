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

  // ---- CREATE COMMENT ----
  async createComment(dto: CreateCommentDto) {
    const user = await this.userRepo.findOne({ 
      where: { UserID: dto.userId },
      relations: ['profile'], // ✅ Load profile để lấy avatar
    });
    const article = await this.articleRepo.findOne({ where: { ArticleID: dto.articleId } });

    if (!user) throw new BadRequestException('User not found');
    if (!article) throw new BadRequestException('Article not found');

    // ✅ Cho phép reply comment
    const commentData: Partial<Comments> = {
      Content: dto.content,
      UserID: dto.userId,
      ArticleID: dto.articleId,
      ParentCommentID: dto.parentCommentId || undefined, // ✅ Cho phép reply
      Moderation: dto.moderation ?? undefined,
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
      moderation: saved.Moderation ?? null,
      replyToName: dto.replyToName,
      author: {
        id: user.UserID,
        fullName: user.FullName,
        avatar: user.profile?.Avatar || '/img/default-avatar.png', // ✅ Lấy avatar từ profile
      },
    };
  }

  // ---- GET COMMENTS BY ARTICLE ----
  async getCommentsByArticle(articleId: number): Promise<CommentData[]> {
    const comments = await this.commentRepo.find({
      where: { ArticleID: articleId },
      relations: ['user', 'user.profile'], // ✅ Load cả profile để lấy avatar
      order: { CreatedAt: 'ASC' },
    });

    // ✅ Trả về cấu trúc nested với replies
    const commentMap = new Map<number, CommentData>();
    const rootComments: CommentData[] = [];

    // Tạo map của tất cả comments
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
        // include moderation if present
        ...(c.Moderation ? { moderation: c.Moderation } : {}),
      };
      commentMap.set(c.CommentID, commentData);
    });

    // Tổ chức comments thành cây và set replyToName
    commentMap.forEach((comment) => {
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          // Set tên người được trả lời
          comment.replyToName = parent.author.fullName;
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
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

    // Fetch requesting user to check admin role
    const requestingUser = await this.userRepo.findOne({ where: { UserID: userId }, relations: ['role'] });
    if (!requestingUser) throw new BadRequestException('Requesting user not found');

    // If not owner and not admin -> deny
    const isOwner = comment.UserID === userId
    const isAdmin = Boolean(requestingUser.RoleID === 1 || (requestingUser.role && requestingUser.role.RoleName && requestingUser.role.RoleName.toLowerCase() === 'admin'))
    if (!isOwner && !isAdmin) {
      throw new BadRequestException('You can only delete your own comments');
    }

    // Xóa tất cả replies trước (nếu có)
    const replies = await this.commentRepo.find({
      where: { ParentCommentID: commentId },
    });
    
    if (replies.length > 0) {
      await this.commentRepo.remove(replies);
    }

    // Xóa comment chính
    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

}
