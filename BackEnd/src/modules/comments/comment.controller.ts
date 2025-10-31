import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CommentService } from './comment.service'; 
import { CreateCommentDto } from './dto/create-comment.dto'; 
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(@Body() dto: CreateCommentDto) {
    const comment = await this.commentService.createComment(dto);
    return comment;
  }

  @Get(':articleId')
  async getByArticle(@Param('articleId') articleId: number) {
    const comments = await this.commentService.getCommentsByArticle(articleId);
    return comments;
  }

  // ---- UPDATE COMMENT ----
 @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateCommentDto) {
  return this.commentService.updateComment(id, dto.content);
}

  // ---- DELETE COMMENT ----
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.commentService.deleteComment(id);
  }
}