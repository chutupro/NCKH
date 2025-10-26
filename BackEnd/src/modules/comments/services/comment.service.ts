import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comments } from 'src/modules/entities/comment.entity';
import { Users } from 'src/modules/entities/user.entity';
import { Articles } from 'src/modules/entities/article.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';

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
    const user = await this.userRepo.findOne({ where: { UserID: dto.userId } });
    const article = await this.articleRepo.findOne({ where: { ArticleID: dto.articleId } });

    if (!user) throw new Error('User not found');
    if (!article) throw new Error('Article not found');

    // TS-safe: dùng Partial<Comments> và undefined thay null
    const commentData: Partial<Comments> = {
      Content: dto.content,
      UserID: dto.userId,
      ArticleID: dto.articleId,
      ParentCommentID: dto.parentCommentId ?? undefined,
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
      },
      parentId: saved.ParentCommentID ?? null,
    };
  }

  // ---- GET COMMENTS BY ARTICLE (nested structure) ----
  async getCommentsByArticle(articleId: number) {
    const comments = await this.commentRepo.find({
      where: { ArticleID: articleId },
      relations: ['user'],
      order: { CreatedAt: 'ASC' },
    });

    // Map để dựng cây
    const map = new Map<number, any>();
    const roots: any[] = [];

    comments.forEach((c) => {
      const commentObj = {
        id: c.CommentID,
        content: c.Content,
        createdAt: c.CreatedAt,
        author: {
          id: c.user.UserID,
          fullName: c.user.FullName,
        },
        parentId: c.ParentCommentID ?? null,
        children: [],
      };
      map.set(c.CommentID, commentObj);
    });

    comments.forEach((c) => {
      const current = map.get(c.CommentID);
      if (c.ParentCommentID) {
        const parent = map.get(c.ParentCommentID);
        if (parent) parent.children.push(current);
      } else {
        roots.push(current);
      }
    });

    return roots;
  }
}
