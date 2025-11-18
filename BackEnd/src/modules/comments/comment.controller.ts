import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { CommentService } from './comment.service'; 
import { CreateCommentDto } from './dto/create-comment.dto'; 
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateCommentDto, @Request() req) {
    // Lấy userId từ JWT token thay vì từ request body
    const userId = req.user?.userId || req.user?.UserID;
    const comment = await this.commentService.createComment({
      ...dto,
      userId,
    });
    return comment;
  }

  @Get(':articleId')
  async getByArticle(@Param('articleId') articleId: number) {
    const comments = await this.commentService.getCommentsByArticle(articleId);
    return comments;
  }

  // ---- UPDATE COMMENT ----
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: number, @Body() dto: UpdateCommentDto, @Request() req) {
    const userId = req.user?.userId || req.user?.UserID;
    return this.commentService.updateComment(id, dto.content, userId);
  }

  // ---- DELETE COMMENT ----
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: number, @Request() req) {
    const userId = req.user?.userId || req.user?.UserID;
    return this.commentService.deleteComment(id, userId);
  }
}