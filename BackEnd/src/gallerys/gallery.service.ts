import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Images } from 'src/modules/entities/image.entity';

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
    const qb = this.imagesRepo.createQueryBuilder('img')
      .leftJoinAndSelect('img.collection', 'col')
      .leftJoinAndSelect('img.category', 'cat');
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

  async create(file: Express.Multer.File, meta: any, mediaServiceUrl: string) {
    if (!file) throw new InternalServerErrorException('No file uploaded');

    const { fileField, titleField, descField, cols, createdAtField } = this.detectFields();

    const payload: any = {};

    // Use media-service URL instead of local path
    if (fileField) payload[fileField] = mediaServiceUrl;
    else if (cols.includes('FilePath')) payload['FilePath'] = mediaServiceUrl;
    else if (cols.includes('filePath')) payload['filePath'] = mediaServiceUrl;
    else if (cols.includes('path')) payload['path'] = mediaServiceUrl;
    else payload['filePath'] = mediaServiceUrl;

    // KHÔNG DÙNG file.originalname (bị lỗi encoding) - Chỉ dùng meta.title
    if (titleField && meta?.title) payload[titleField] = meta.title;
    if (descField && meta?.description) payload[descField] = meta.description;

    // ✅ Gắn CategoryID (không gắn ArticleID nếu chỉ có categoryId)
    if (cols.includes('CategoryID') && meta?.categoryId) {
      payload['CategoryID'] = Number(meta.categoryId);
    }
    
    // ✅ Gắn ArticleID riêng nếu có articleId trong meta
    if (cols.includes('ArticleID') && meta?.articleId) {
      payload['ArticleID'] = Number(meta.articleId);
    }

    // ✅ Gắn CollectionID nếu có
    if (cols.includes('CollectionID') && meta?.collectionId) {
      payload['CollectionID'] = Number(meta.collectionId);
      console.log(`[Gallery Service] Setting CollectionID=${meta.collectionId} for image`);
    }
    
    console.log(`[Gallery Service] Payload:`, JSON.stringify(payload, null, 2));

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
    const { pk } = this.detectFields();
    const found = await this.imagesRepo.findOneBy({ [pk]: Number(id) } as any);
    if (!found) throw new NotFoundException('Not found');
    
    // Note: File cleanup is handled by media-service, not here
    await this.imagesRepo.delete((found as any)[pk]);
    return { deleted: true };
  }
}
