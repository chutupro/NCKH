// src/crawler/crawler.controller.ts
import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('run')
  async runCrawler() {
    return this.crawlerService.run();
  }
}