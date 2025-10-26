import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommentService } from '../services/comment.service'; 
import { CreateCommentDto } from '../dto/create-comment.dto'; 

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(@Body() dto: CreateCommentDto) {
    const comment = await this.commentService.createComment(dto);
    return {
      status: 'success',
      data: comment,
    };
  }

  @Get(':articleId')
  async getByArticle(@Param('articleId') articleId: number) {
    const comments = await this.commentService.getCommentsByArticle(articleId);
    return {
      status: 'success',
      total: comments.length,
      data: comments,
    };
  }
}
