import { Controller, Get, Post, Delete, Param, Req, HttpException, HttpStatus, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articles } from '../entities/article.entity';
import { Likes } from '../entities/like.entity';
import { Users } from '../entities/user.entity';

@Controller('articles_post')
export class ArticleLikeController {
  constructor(
    @InjectRepository(Articles)
    private readonly articleRepo: Repository<Articles>,
    @InjectRepository(Likes)
    private readonly likeRepo: Repository<Likes>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async like(@Param('id') id: number, @Body() body: any, @Req() req: any) {

    console.log('[like] headers:', req?.headers && Object.keys(req.headers).length ? { authorization: req.headers.authorization } : 'no headers');
    console.log('[like] req.user:', req?.user || null);

  const authUser = req?.user || {};
  const bodyUser = body?.userId ?? body?.UserID ?? null;
  const userId = bodyUser ?? (authUser.userId ?? authUser.sub ?? authUser.UserID ?? null);
  if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    const article = await this.articleRepo.findOne({ where: { ArticleID: id } });
    if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

    const existing = await this.likeRepo.findOne({ where: { ArticleID: id, UserID: userId } });
    if (existing) {

      throw new HttpException('Already liked', HttpStatus.CONFLICT);
    }

  const user = await this.userRepo.findOne({ where: { UserID: userId } });
  const like = this.likeRepo.create({ ArticleID: id, UserID: userId });

  if (article) (like as any).article = article;
  if (user) (like as any).user = user;
    await this.likeRepo.save(like);

    const likesCount = await this.likeRepo.count({ where: { ArticleID: id } });
    return { success: true, likeId: like.LikeID, liked: true, likesCount };
  }

  @Get(':id/like')
  async getLikeStatus(@Param('id') id: number, @Req() req: any) {

    const likesCount = await this.likeRepo.count({ where: { ArticleID: id } });

    const authUser = req?.user || {};
    const userId = authUser.userId ?? authUser.sub ?? authUser.UserID ?? null;

  let liked = false;
  let likeId: number | null = null;
    if (userId) {
      const existing = await this.likeRepo.findOne({ where: { ArticleID: id, UserID: userId } });
      if (existing) {
        liked = true;
        likeId = existing.LikeID;
      }
    }

    return { liked, likeId, likesCount };
  }

  @Get(':id/likes')
  async listLikes(@Param('id') id: number) {
    const list = await this.likeRepo.find({ where: { ArticleID: id } });
    const userIds = list.map((l) => l.UserID);
    return { count: userIds.length, userIds };
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async unlike(@Param('id') id: number, @Req() req: any) {
    const authUser = req?.user || {};
    const bodyUser = (req as any).body?.userId ?? (req as any).body?.UserID ?? null;
    const userId = bodyUser ?? (authUser.userId ?? authUser.sub ?? authUser.UserID ?? null);
    if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    const existing = await this.likeRepo.findOne({ where: { ArticleID: id, UserID: userId } });
    if (!existing) {
      throw new HttpException('Not liked', HttpStatus.BAD_REQUEST);
    }

    await this.likeRepo.remove(existing);
    const likesCount = await this.likeRepo.count({ where: { ArticleID: id } });
    return { success: true, liked: false, likesCount };
  }
}
