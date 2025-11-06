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

  // Từ khóa thủ công cho phân loại
  private readonly CATEGORY_KEYWORDS: { [category: string]: string[] } = {
    'Lịch sử': ['chiến tranh', 'vua', 'triều đại', 'cách mạng', 'war', 'king', 'dynasty', 'revolution'],
    'Kiến trúc': ['công trình', 'cầu', 'chùa', 'sân bay', 'tòa nhà', 'building', 'architecture', 'bridge'],
    'Chiến tranh': ['trận đánh', 'binh lính', 'chiến dịch', 'xung đột', 'battle', 'soldier', 'conflict'],
    'Văn hóa': ['văn hóa', 'nghệ thuật', 'tín ngưỡng', 'lễ hội', 'culture', 'art', 'festival', 'religion'],
    'Du lịch': ['danh lam', 'khách sạn', 'resort', 'trải nghiệm', 'destination', 'tourism', 'hotel', 'travel'],
    'Thiên nhiên': ['núi', 'sông', 'rừng', 'biển', 'động vật', 'thực vật', 'mountain', 'river', 'forest', 'nature'],
  };

  constructor(
    @InjectRepository(Timelines) private timelineRepo: Repository<Timelines>,
    @InjectRepository(Categories) private catRepo: Repository<Categories>,
    private dataSource: DataSource,
  ) {}

  // ================== CATEGORY ==================
  private async ensureCategories() {
    for (const name of this.defaultCategories) {
      const exists = await this.catRepo.findOne({ where: { Name: name } });
      if (!exists) await this.catRepo.save({ Name: name });
    }
  }

  private detectCategory(text: string): string {
    const lowerText = text.toLowerCase();
    let bestCategory = 'Lịch sử';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      let count = 0;
      for (const kw of keywords) {
        if (lowerText.includes(kw.toLowerCase())) count++;
      }
      if (count > maxMatches) {
        maxMatches = count;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  private extractYear(text: string): string {
    const m = text.match(/\b(18\d{2}|19\d{2}|20\d{2}|21\d{2})\b/);
    return m ? `${m[0]}-01-01` : '1000-01-01';
  }

  // ================== CRAWL FUNCTIONS ==================
  private async crawlWikipedia(): Promise<CrawledEvent[]> {
    const url = 'https://vi.wikipedia.org/wiki/L%E1%BB%8Bch_s%E1%BB%AD_%C4%90%C3%A0_N%E1%BA%B5ng';
    const events: CrawledEvent[] = [];
    try {
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);

      const headings = $('.mw-headline, h2, h3');
      for (let i = 0; i < headings.length; i++) {
        const el = headings[i];
        const title = $(el).text().trim();
        if (!title || /tham khảo|chú thích|nguồn|liên kết/i.test(title)) continue;

        let fullDesc = '';
        let next = $(el).parent().next();
        while (next.length && !next.find('.mw-headline, h2, h3').length) {
          if (next.is('p')) fullDesc += next.text().trim() + '\n';
          next = next.next();
        }

        if (fullDesc.length > 50) {
          const category = this.detectCategory(title + ' ' + fullDesc);
          events.push({
            title,
            fullDesc: fullDesc.slice(0, 2000),
            date: this.extractYear(title + fullDesc),
            category,
            image: `https://picsum.photos/seed/${encodeURIComponent(title)}/800/400`,
            sourceUrl: url,
          });
        }
      }

      return events.length > 0 ? events : this.getSampleData();
    } catch (err) {
      console.warn('⚠️ Không lấy được Wikipedia:', (err as Error).message);
      return this.getSampleData();
    }
  }

  private async crawlFantasticityHistory(): Promise<CrawledEvent[]> {
    const api = 'https://danangfantasticity.com/wp-json/wp/v2/posts?search=history&per_page=40';
    const events: CrawledEvent[] = [];

    try {
      const { data } = await axios.get(api, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!Array.isArray(data)) return [];

      for (const post of data) {
        const title = post.title?.rendered?.replace(/<[^>]+>/g, '') ?? 'Sự kiện';
        const fullDescRaw = post.content?.rendered?.replace(/<[^>]+>/g, '').trim() ?? '';
        if (fullDescRaw.length < 60) continue;

        const category = this.detectCategory(title + ' ' + fullDescRaw);

        events.push({
          title,
          fullDesc: fullDescRaw.slice(0, 2000),
          date: this.extractYear(fullDescRaw),
          category,
          image: post.jetpack_featured_media_url || `https://picsum.photos/seed/history${post.id}/800/400`,
          sourceUrl: post.link,
        });
      }

      return events;
    } catch (err) {
      console.warn('⚠️ Không lấy được Fantasticity History (API):', (err as Error).message);
      return [];
    }
  }

  private async crawlFantasticitySites(): Promise<CrawledEvent[]> {
    const url = 'https://danangfantasticity.com/he-thong-di-tich-lich-su-quoc-gia-da-nang';
    const events: CrawledEvent[] = [];
    try {
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);

      const headings = $('.et_pb_text_inner h2, .et_pb_text_inner h3');
      for (let i = 0; i < headings.length; i++) {
        const el = headings[i];
        const title = $(el).text().trim();
        const descRaw = $(el).nextAll('p').first().text().trim();
        if (!title || descRaw.length < 40) continue;

        const category = this.detectCategory(title + ' ' + descRaw);

        events.push({
          title,
          fullDesc: descRaw,
          date: this.extractYear(descRaw),
          category,
          image: `https://picsum.photos/seed/sites${i}/800/400`,
          sourceUrl: url,
        });
      }

      return events;
    } catch (err) {
      console.warn('⚠️ Không lấy được Fantasticity Sites:', (err as Error).message);
      return [];
    }
  }

  private async crawlPullmanEvents(): Promise<CrawledEvent[]> {
    const url = 'https://www.pullman-danang.com/blog/';
    const events: CrawledEvent[] = [];
    try {
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);

      $('article p').each((i, el) => {
        const textRaw = $(el).text().trim();
        if (textRaw.length < 60) return;

        events.push({
          title: textRaw.slice(0, 80) + '...',
          fullDesc: textRaw,
          date: this.extractYear(textRaw),
          category: 'Du lịch',
          image: `https://picsum.photos/seed/pullman${i}/800/400`,
          sourceUrl: url,
        });
      });

      return events;
    } catch (err) {
      console.warn('⚠️ Không lấy được Pullman Events:', (err as Error).message);
      return [];
    }
  }

  private getSampleData(): CrawledEvent[] {
    return [
      {
        title: '1997 - Đà Nẵng trở thành thành phố trực thuộc trung ương',
        fullDesc: 'Ngày 1/1/1997, Đà Nẵng chính thức tách khỏi tỉnh Quảng Nam - Đà Nẵng.',
        date: '1997-01-01',
        category: 'Lịch sử',
        image: 'https://picsum.photos/seed/1997/800/400',
        sourceUrl: 'https://danang.gov.vn',
      },
    ];
  }

  // ================== RUN ==================
  async run() {
    await this.ensureCategories();

    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await this.dataSource.query('TRUNCATE TABLE Timelines');
    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    const [wiki, his, sites, events] = await Promise.all([
      this.crawlWikipedia(),
      this.crawlFantasticityHistory(),
      this.crawlFantasticitySites(),
      this.crawlPullmanEvents(),
    ]);

    const all = [...wiki, ...his, ...sites, ...events];
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

    return { message: `Crawl thành công ${saved} sự kiện từ 4 nguồn!` };
  }
}
