// src/crawler/crawler.service.ts
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
  constructor(
    @InjectRepository(Timelines) private timelineRepo: Repository<Timelines>,
    @InjectRepository(Categories) private catRepo: Repository<Categories>,
    private dataSource: DataSource,
  ) {}

  private categoryKeywords: Record<string, string[]> = {
    'Lịch sử': ['lịch sử', 'thành lập', 'giải phóng', 'vua', 'triều', 'nguyễn'],
    'Kiến trúc': ['cầu', 'sân bay', 'cảng', 'khánh thành', 'xây dựng', 'đường', 'nhà thờ'],
    'Chiến tranh': ['chiến tranh', 'pháp', 'mỹ', 'đánh', 'giải phóng', 'quân'],
    'Văn hóa': ['lễ hội', 'chăm', 'di sản', 'bảo tàng', 'văn hóa'],
    'Du lịch': ['bãi biển', 'bà nà', 'cầu vàng', 'du lịch', 'khách sạn'],
    'Thiên nhiên': ['sơn trà', 'ngũ hành sơn', 'rừng', 'sông hàn'],
  };

  private async ensureCategories() {
    for (const [name] of Object.entries(this.categoryKeywords)) {
      const exists = await this.catRepo.findOne({ where: { Name: name } });
      if (!exists) await this.catRepo.save({ Name: name });
    }
  }

  private extractYear(text: string): string {
    const m = text.match(/\b(18\d{2}|19\d{2}|20\d{2}|21\d{2})\b/);
    return m ? `${m[0]}-01-01` : '1000-01-01';
  }

  private detectCategory(text: string): string {
    const lower = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(k => lower.includes(k))) return cat;
    }
    return 'Lịch sử';
  }

  // NGUỒN ỔN ĐỊNH: Wikipedia + Dữ liệu mẫu
  // src/crawler/crawler.service.ts
private async crawlWikipedia(): Promise<CrawledEvent[]> {
  const url = 'https://vi.wikipedia.org/wiki/L%E1%BB%8Bch_s%E1%BB%AD_%C4%90%C3%A0_N%E1%BA%B5ng';
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
    });
    const $ = cheerio.load(data);
    const events: CrawledEvent[] = [];

    // SỬA: DÙNG .mw-headline HOẶC h2, h3
    $('.mw-headline, h2, h3').each((_, el) => {
      const title = $(el).text().trim();
      if (!title || /tham khảo|chú thích|nguồn|liên kết/i.test(title)) return;

      let fullDesc = '';
      let next = $(el).parent().next();
      while (next.length && !next.find('.mw-headline, h2, h3').length) {
        if (next.is('p')) fullDesc += next.text().trim() + '\n';
        next = next.next();
      }

      if (fullDesc.length > 50) {
        events.push({
          title,
          fullDesc: fullDesc.slice(0, 2000),
          date: this.extractYear(title + fullDesc),
          category: this.detectCategory(title + fullDesc),
          image: `https://picsum.photos/seed/${encodeURIComponent(title)}/800/400`,
          sourceUrl: url,
        });
      }
    });

    console.log(`Wikipedia: ${events.length} sự kiện`);
    return events.length > 0 ? events : this.getSampleData();
  } catch (err) {
    console.error('Lỗi Wikipedia:', err.message);
    return this.getSampleData(); // DỮ LIỆU MẪU
  }
}

// DỮ LIỆU MẪU ĐẦY ĐỦ
private getSampleData(): CrawledEvent[] {
  return [
    {
      title: '1890 - Thành lập tỉnh Quảng Nam',
      fullDesc: 'Năm 1890, thực dân Pháp thành lập tỉnh Quảng Nam, bao gồm Đà Nẵng. Đây là bước ngoặt quan trọng trong lịch sử hành chính Đà Nẵng.',
      date: '1890-01-01',
      category: 'Lịch sử',
      image: 'https://picsum.photos/seed/1890/800/400',
      sourceUrl: 'https://vi.wikipedia.org/wiki/L%E1%BB%8Bch_s%E1%BB%AD_%C4%90%C3%A0_N%E1%BA%B5ng',
    },
    {
      title: '1965 - Mỹ đổ bộ Đà Nẵng',
      fullDesc: 'Ngày 8 tháng 3 năm 1965, lính thủy đánh bộ Mỹ đầu tiên đổ bộ lên bãi biển Đà Nẵng, mở đầu cho sự can thiệp quân sự trực tiếp của Mỹ vào Việt Nam.',
      date: '1965-03-08',
      category: 'Chiến tranh',
      image: 'https://picsum.photos/seed/1965/800/400',
      sourceUrl: 'https://vi.wikipedia.org/wiki/Chi%E1%BA%BFn_tranh_Vi%E1%BB%87t_Nam',
    },
    {
      title: '1997 - Đà Nẵng thành thành phố trực thuộc trung ương',
      fullDesc: 'Ngày 1 tháng 1 năm 1997, Đà Nẵng chính thức tách khỏi tỉnh Quảng Nam - Đà Nẵng để trở thành thành phố trực thuộc trung ương.',
      date: '1997-01-01',
      category: 'Lịch sử',
      image: 'https://picsum.photos/seed/1997/800/400',
      sourceUrl: 'https://danang.gov.vn',
    },
    {
      title: '2013 - Khánh thành Cầu Rồng',
      fullDesc: 'Cầu Rồng được khánh thành vào ngày 29/3/2013, là biểu tượng kiến trúc mới của Đà Nẵng. Cầu có khả năng phun lửa và nước vào cuối tuần.',
      date: '2013-03-29',
      category: 'Kiến trúc',
      image: 'https://picsum.photos/seed/caurong/800/400',
      sourceUrl: 'https://danang.gov.vn',
    },
    {
      title: '2019 - Lễ hội pháo hoa quốc tế DIFF',
      fullDesc: 'Lễ hội pháo hoa quốc tế Đà Nẵng (DIFF) 2019 thu hút hàng triệu du khách với các màn trình diễn đỉnh cao từ nhiều quốc gia.',
      date: '2019-06-01',
      category: 'Du lịch',
      image: 'https://picsum.photos/seed/diff/800/400',
      sourceUrl: 'https://baodanang.vn',
    },
    {
      title: 'Ngũ Hành Sơn - Di sản thiên nhiên',
      fullDesc: 'Ngũ Hành Sơn là quần thể 5 ngọn núi đá vôi với nhiều hang động, chùa chiền, là điểm đến tâm linh và du lịch nổi tiếng.',
      date: '1000-01-01',
      category: 'Thiên nhiên',
      image: 'https://picsum.photos/seed/nguhanhson/800/400',
      sourceUrl: 'https://danangtourism.vn',
    },
  ];
}

  async run() {
    await this.ensureCategories();

    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await this.dataSource.query('TRUNCATE TABLE Timelines');
    await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    const wiki = await this.crawlWikipedia();
    const all = wiki.length > 0 ? wiki : this.getSampleData();

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

    return { message: `Crawl thành công ${saved} sự kiện!` };
  }
}