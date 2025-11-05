import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Images } from 'src/modules/entities/image.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Images)
    private readonly imagesRepo: Repository<Images>,
  ) {}

  private detectFields() {
    const cols = this.imagesRepo.metadata.columns.map(c => c.propertyName);
    const pk = this.imagesRepo.metadata.primaryColumns[0].propertyName;
    const fileCandidates = ['filePath', 'FilePath', 'path', 'url', 'Url', 'file_name', 'fileName', 'FileName', 'ImagePath', 'imagePath'];
    const titleCandidates = ['title', 'Title', 'name', 'Name', 'alt', 'Alt'];
    const descCandidates = ['description', 'Description', 'caption', 'Caption', 'altText', 'AltText', 'ImageDescription', 'imageDescription'];
    const fileField = fileCandidates.find(f => cols.includes(f));
    const titleField = titleCandidates.find(f => cols.includes(f));
    const descField = descCandidates.find(f => cols.includes(f));
    const createdAtField = cols.find(c => /createdat|created_at|createdAt/i.test(c));
    return { pk, fileField, titleField, descField, createdAtField, cols };
  }

  async findAll(options: { skip?: number; take?: number; q?: string; categoryId?: number } = {}) {
    const { skip = 0, take = 20, q, categoryId } = options;
    const qb = this.imagesRepo.createQueryBuilder('img');
    const { createdAtField, cols } = this.detectFields();

    if (createdAtField) qb.orderBy(`img.${createdAtField}`, 'DESC');
    else qb.orderBy(`img.${this.detectFields().pk}`, 'DESC');

    if (q) {
      const { cols: allCols } = this.detectFields();
      const searchable = allCols.filter(c => /title|name|alt|description|caption/i.test(c));
      if (searchable.length) {
        const or = searchable.map((c, i) => `img.${c} LIKE :q${i}`).join(' OR ');
        const params = searchable.reduce((p, _c, i) => ({ ...p, [`q${i}`]: `%${q}%` }), {});
        qb.andWhere(`(${or})`, params);
      }
    }

    if (categoryId !== undefined && categoryId !== null) {
      const col = ['CategoryID', 'categoryId', 'category_id', 'ArticleID', 'articleId'].find(c => cols.includes(c));
      if (col) qb.andWhere(`img.${col} = :catId`, { catId: categoryId });
    }

    const [data, total] = await qb.skip(Number(skip)).take(Number(take)).getManyAndCount();
    return { data, total };
  }

  async findOne(id: number) {
    const { pk } = this.detectFields();
    const item = await this.imagesRepo.findOneBy({ [pk]: Number(id) } as any);
    if (!item) throw new NotFoundException('Not found');
    return item;
  }

  async create(file: Express.Multer.File, meta: any) {
    if (!file) throw new InternalServerErrorException('No file uploaded');

    const { fileField, titleField, descField, cols, createdAtField } = this.detectFields();
    const uploadsDir = path.join(process.cwd(), 'uploads', 'gallery');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const relPath = path.join('uploads', 'gallery', file.filename);
    const payload: any = {};

    if (fileField) payload[fileField] = relPath;
    else if (cols.includes('FilePath')) payload['FilePath'] = relPath;
    else if (cols.includes('filePath')) payload['filePath'] = relPath;
    else if (cols.includes('path')) payload['path'] = relPath;
    else payload['filePath'] = relPath;

    if (titleField) payload[titleField] = meta?.title ?? file.originalname;
    if (descField && meta?.description) payload[descField] = meta.description;

    // ✅ Gắn ArticleID (hoặc CategoryID)
    if (cols.includes('ArticleID') && meta?.categoryId) {
      payload['ArticleID'] = Number(meta.categoryId);
    } else if (cols.includes('CategoryID') && meta?.categoryId) {
      payload['CategoryID'] = Number(meta.categoryId);
    }

    if (createdAtField && !payload[createdAtField]) payload[createdAtField] = new Date();

    for (const k of Object.keys(meta || {})) {
      if (cols.includes(k) && payload[k] === undefined) {
        payload[k] = meta[k];
      }
    }

    try {
      const image = this.imagesRepo.create(payload);
      const saved = await this.imagesRepo.save(image);
      return saved;
    } catch (err) {
      try { fs.unlinkSync(path.join(process.cwd(), relPath)); } catch {}
      throw err;
    }
  }

  async update(id: number, meta: any) {
    const { pk, cols } = this.detectFields();
    const found = await this.imagesRepo.findOneBy({ [pk]: Number(id) } as any);
    if (!found) throw new NotFoundException('Not found');
    for (const k of Object.keys(meta || {})) {
      if (cols.includes(k)) (found as any)[k] = meta[k];
    }
    return this.imagesRepo.save(found as any);
  }

  async remove(id: number) {
    const { pk, fileField } = this.detectFields();
    const found = await this.imagesRepo.findOneBy({ [pk]: Number(id) } as any);
    if (!found) throw new NotFoundException('Not found');
    const possible = [
      (fileField && (found as any)[fileField]),
      (found as any).filePath,
      (found as any).FilePath,
      (found as any).path,
      (found as any).url,
    ].filter(Boolean);
    for (const p of possible) {
      try {
        const full = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
        if (fs.existsSync(full) && fs.statSync(full).isFile()) fs.unlinkSync(full);
      } catch {}
    }
    await this.imagesRepo.delete((found as any)[pk]);
    return { deleted: true };
  }
}
