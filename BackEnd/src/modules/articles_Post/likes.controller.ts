import { Controller, Get, Post, Delete, Param, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Likes } from '../entities/like.entity';
import { Articles } from '../entities/article.entity';
import { Users } from '../entities/user.entity';

@Controller('likes')
export class LikesController {
  constructor(
    @InjectRepository(Likes)
    private readonly likeRepo: Repository<Likes>,
    @InjectRepository(Articles)
    private readonly articleRepo: Repository<Articles>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  @Get()
  async findAll() {
    const list = await this.likeRepo.find({ relations: ['user', 'article'] });
    return list.map(l => ({ id: l.LikeID, ArticleID: l.ArticleID, UserID: l.UserID, CreatedAt: l.CreatedAt }))
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const like = await this.likeRepo.findOne({ where: { LikeID: id } });
    if (!like) throw new HttpException('Like not found', HttpStatus.NOT_FOUND);
    return { id: like.LikeID, ArticleID: like.ArticleID, UserID: like.UserID, CreatedAt: like.CreatedAt };
  }

  @Post()
  async create(@Body() body: { ArticleID: number, UserID?: number }, @Req() req: any) {
    const articleId = body.ArticleID;
    if (!articleId) throw new HttpException('ArticleID required', HttpStatus.BAD_REQUEST);

    let userId = body.UserID;
    const authUser = req?.user || {};
    const authId = authUser.userId ?? authUser.sub ?? authUser.UserID ?? null;
    if (!userId) userId = authId;
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    const article = await this.articleRepo.findOne({ where: { ArticleID: articleId } });
    if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

    const exists = await this.likeRepo.findOne({ where: { ArticleID: articleId, UserID: userId } });
    if (exists) throw new HttpException('Already liked', HttpStatus.CONFLICT);

    const like = this.likeRepo.create({ ArticleID: articleId, UserID: userId });
    await this.likeRepo.save(like);
    return { id: like.LikeID, ArticleID: like.ArticleID, UserID: like.UserID, CreatedAt: like.CreatedAt };
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req: any) {
    const authUser = req?.user || {};
    const authId = authUser.userId ?? authUser.sub ?? authUser.UserID ?? null;
    if (!authId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    const like = await this.likeRepo.findOne({ where: { LikeID: id } });
    if (!like) throw new HttpException('Like not found', HttpStatus.NOT_FOUND);
    if (like.UserID !== authId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    await this.likeRepo.remove(like);
    return { success: true };
  }
}
