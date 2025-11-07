import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Timelines } from '../entities/timeline.entity';
import { Categories } from '../entities/category.entity';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface CrawledEvent {
  title: string;
  fullDesc: string;
  date: string;
  category: string;
  image?: string;
  sourceUrl?: string;
}

@Injectable()
export class CrawlerService {
  private readonly defaultCategories = [
    'Lịch sử',
    'Kiến trúc',
    'Chiến tranh',
    'Văn hóa',
    'Du lịch',
    'Thiên nhiên',
  ];

  private readonly CATEGORY_KEYWORDS: { [category: string]: { keyword: string; weight: number }[] } = {
    'Lịch sử': [
      { keyword: 'chiến tranh', weight: 3 },
      { keyword: 'vua', weight: 2 },
      { keyword: 'triều đại', weight: 2 },
      { keyword: 'cách mạng', weight: 3 },
      { keyword: 'revolution', weight: 2 },
      { keyword: 'dynasty', weight: 2 },
    ],
    'Kiến trúc': [
      { keyword: 'công trình', weight: 3 },
      { keyword: 'cầu', weight: 2 },
      { keyword: 'chùa', weight: 2 },
      { keyword: 'tòa nhà', weight: 2 },
      { keyword: 'architecture', weight: 2 },
      { keyword: 'bridge', weight: 2 },
    ],
    'Chiến tranh': [
      { keyword: 'trận đánh', weight: 3 },
      { keyword: 'binh lính', weight: 2 },
      { keyword: 'chiến dịch', weight: 3 },
      { keyword: 'xung đột', weight: 2 },
      { keyword: 'battle', weight: 2 },
      { keyword: 'soldier', weight: 2 },
    ],
    'Văn hóa': [
      { keyword: 'văn hóa', weight: 2 },
      { keyword: 'nghệ thuật', weight: 2 },
      { keyword: 'tín ngưỡng', weight: 2 },
      { keyword: 'lễ hội', weight: 2 },
      { keyword: 'culture', weight: 2 },
      { keyword: 'art', weight: 2 },
      { keyword: 'festival', weight: 2 },
      { keyword: 'religion', weight: 2 },
    ],
    'Du lịch': [
      { keyword: 'danh lam', weight: 2 },
      { keyword: 'khách sạn', weight: 2 },
      { keyword: 'resort', weight: 2 },
      { keyword: 'trải nghiệm', weight: 2 },
      { keyword: 'destination', weight: 2 },
      { keyword: 'tourism', weight: 2 },
      { keyword: 'hotel', weight: 2 },
      { keyword: 'travel', weight: 2 },
    ],
    'Thiên nhiên': [
      { keyword: 'núi', weight: 2 },
      { keyword: 'sông', weight: 2 },
      { keyword: 'rừng', weight: 2 },
      { keyword: 'biển', weight: 2 },
      { keyword: 'động vật', weight: 2 },
      { keyword: 'thực vật', weight: 2 },
      { keyword: 'mountain', weight: 2 },
      { keyword: 'river', weight: 2 },
      { keyword: 'forest', weight: 2 },
      { keyword: 'nature', weight: 2 },
    ],
  };

  constructor(
    @InjectRepository(Timelines) private timelineRepo: Repository<Timelines>,
    @InjectRepository(Categories) private catRepo: Repository<Categories>,
    private dataSource: DataSource,
  ) {}

  private async ensureCategories() {
    for (const name of this.defaultCategories) {
      const exists = await this.catRepo.findOne({ where: { Name: name } });
      if (!exists) await this.catRepo.save({ Name: name });
    }
  }

  private detectCategory(title: string, desc: string): string {
    const text = (title + ' ' + desc).toLowerCase();
    let bestCategory = 'Văn hóa';
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      let score = 0;
      for (const kwObj of keywords) {
        const regex = new RegExp(`\\b${kwObj.keyword.toLowerCase()}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) score += matches.length * kwObj.weight;
      }
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    if (maxScore < 3) bestCategory = 'Văn hóa';
    return bestCategory;
  }

  private extractYear(text: string): string {
    const m = text.match(/\b(18\d{2}|19\d{2}|20\d{2}|21\d{2})\b/);
    return m ? `${m[0]}-01-01` : '2025-01-01';
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  // ===== Kiểm tra URL hợp lệ =====
  private async verifyUrl(url: string): Promise<string | null> {
    try {
      const resp = await axios.head(url, { maxRedirects: 5 });
      if (resp.status === 200) return url;
      if (resp.request?.res?.responseUrl) return resp.request.res.responseUrl;
    } catch (err) {
      // thử bỏ .html nếu có
      if (url.endsWith('.html')) {
        const alt = url.replace(/\.html$/, '');
        try {
          const resp2 = await axios.head(alt, { maxRedirects: 5 });
          if (resp2.status === 200) return alt;
        } catch {}
      }
      console.warn(`URL không hợp lệ: ${url}`);
    }
    return null;
  }

  // ================== DANANG FANTASTICITY HISTORY ==================
  private async crawlFantasticityHistory(): Promise<CrawledEvent[]> {
    const api = 'https://danangfantasticity.com/wp-json/wp/v2/posts?search=history&per_page=55';
    const events: CrawledEvent[] = [];

    try {
      const { data } = await axios.get(api, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!Array.isArray(data)) return [];

      for (const post of data) {
        const title = this.cleanText(post.title?.rendered?.replace(/<[^>]+>/g, '') ?? 'Sự kiện');
        const fullDescRaw = this.cleanText(post.content?.rendered?.replace(/<[^>]+>/g, '') ?? '');
        if (!fullDescRaw) continue;

        let imageUrl = post.jetpack_featured_media_url || '';
        if (!imageUrl) {
          const matchImg = post.content?.rendered?.match(/<img[^>]+(src|data-src)="([^">]+)"/);
          if (matchImg && matchImg[2]) imageUrl = matchImg[2];
        }
        if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

        let sourceUrl = post.link ?? '';
        if (sourceUrl.startsWith('/')) sourceUrl = 'https://danangfantasticity.com' + sourceUrl;

        const verified = await this.verifyUrl(sourceUrl);
        if (!verified) continue;
        sourceUrl = verified;

        const category = this.detectCategory(title, fullDescRaw);

        events.push({
          title,
          fullDesc: fullDescRaw,
          date: this.extractYear(fullDescRaw),
          category,
          image: imageUrl || undefined,
          sourceUrl,
        });
      }

      return events;
    } catch (err) {
      console.warn('⚠️ Không lấy được Fantasticity History:', (err as Error).message);
      return [];
    }
  }

  // ================== DANANG FANTASTICITY SITES ==================
  private async crawlFantasticitySites(): Promise<CrawledEvent[]> {
    const url = 'https://danangfantasticity.com/he-thong-di-tich-lich-su-quoc-gia-da-nang';
    const events: CrawledEvent[] = [];
    try {
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);

      const headings = $('.et_pb_text_inner h2, .et_pb_text_inner h3');
      for (let i = 0; i < headings.length; i++) {
        const el = headings[i];
        const title = this.cleanText($(el).text());
        const descRaw = this.cleanText($(el).nextAll('p').first().text());
        if (!title || !descRaw) continue;

        let imageUrl =
          $(el).nextAll('img').first().attr('src') ||
          $(el).nextAll('img').first().attr('data-src') ||
          '';
        if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

        const category = this.detectCategory(title, descRaw);

        // tạo anchor link nếu có id
        let sourceUrl = url;
        const idAnchor = $(el).attr('id');
        if (idAnchor) sourceUrl = url + '#' + idAnchor;

        const verified = await this.verifyUrl(sourceUrl);
        if (!verified) continue;
        sourceUrl = verified;

        events.push({
          title,
          fullDesc: descRaw,
          date: this.extractYear(descRaw),
          category,
          image: imageUrl || undefined,
          sourceUrl,
        });
      }

      return events;
    } catch (err) {
      console.warn('⚠️ Không lấy được Fantasticity Sites:', (err as Error).message);
      return [];
    }
  }

  // ================== RUN ==================
  async run() {
    await this.ensureCategories();

    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await this.dataSource.query('TRUNCATE TABLE Timelines');
    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    const [his, sites] = await Promise.all([
      this.crawlFantasticityHistory(),
      this.crawlFantasticitySites(),
    ]);

    const all = [...his, ...sites];
    const seen = new Set<string>();
    let saved = 0;

    for (const ev of all) {
      if (seen.has(ev.title)) continue;
      seen.add(ev.title);

      const cat = await this.catRepo.findOne({ where: { Name: ev.category } });
      if (!cat) continue;

      await this.timelineRepo.save({
        title: ev.title,
        description: ev.fullDesc,
        eventDate: ev.date,
        category: ev.category,
        CategoryID: cat.CategoryID,
        image: ev.image,
        sourceUrl: ev.sourceUrl,
      });
      saved++;
    }

    return { message: `Crawl thành công ${saved} sự kiện từ Danang Fantasticity!` };
  }
}
