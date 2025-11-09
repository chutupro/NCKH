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
    // DEBUG: log auth info to help diagnose 401 issues
    // (remove these logs after debugging)
    console.log('[like] headers:', req?.headers && Object.keys(req.headers).length ? { authorization: req.headers.authorization } : 'no headers');
    console.log('[like] req.user:', req?.user || null);
  // allow providing userId in body (useful for testing/dev) or use authenticated user
  const authUser = req?.user || {};
  const bodyUser = body?.userId ?? body?.UserID ?? null;
  const userId = bodyUser ?? (authUser.userId ?? authUser.sub ?? authUser.UserID ?? null);
  if (!userId) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

    const article = await this.articleRepo.findOne({ where: { ArticleID: id } });
    if (!article) throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

    const existing = await this.likeRepo.findOne({ where: { ArticleID: id, UserID: userId } });
    if (existing) {
      // Already liked — return conflict so client can handle gracefully
      throw new HttpException('Already liked', HttpStatus.CONFLICT);
    }

  const user = await this.userRepo.findOne({ where: { UserID: userId } });
  const like = this.likeRepo.create({ ArticleID: id, UserID: userId });
  // attach relations if available
  if (article) (like as any).article = article;
  if (user) (like as any).user = user;
    await this.likeRepo.save(like);

    // return authoritative state
    const likesCount = await this.likeRepo.count({ where: { ArticleID: id } });
    return { success: true, likeId: like.LikeID, liked: true, likesCount };
  }

  // --- Check liked status & likes count for an article ---
  @Get(':id/like')
  async getLikeStatus(@Param('id') id: number, @Req() req: any) {
    // Count total likes for this article
    const likesCount = await this.likeRepo.count({ where: { ArticleID: id } });

    // If user is authenticated, check whether they liked this article
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

  // --- DEBUG / diagnostic: list user IDs who liked an article ---
  // NOTE: temporary helper to debug 'liked' issues. Returns array of UserID numbers.
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
