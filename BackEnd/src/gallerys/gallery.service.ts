// ...existing code...
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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

  async findAll(skip = 0, take = 20) {
    const [data, total] = await this.imagesRepo.findAndCount({
      skip: Number(skip) || 0,
      take: Number(take) || 20,
    });
    return { data, total };
  }

  async findOne(id: number) {
    const pk = this.imagesRepo.metadata.primaryColumns[0].propertyName;
    const item = await this.imagesRepo.findOneBy({ [pk]: Number(id) } as any);
    if (!item) throw new NotFoundException('Image not found');
    return item;
  }

  async create(file: Express.Multer.File, meta: any) {
    if (!file) throw new InternalServerErrorException('No file uploaded');
    const relativePath = path.join('uploads', 'gallery', file.filename);
    const toSave = {
      ...meta,
      // try common property names — if entity defines different names, repo will ignore extras
      FilePath: relativePath,
      filePath: relativePath,
      FileName: file.originalname,
      Title: meta?.title ?? file.originalname,
      Description: meta?.description ?? null,
      CreatedAt: new Date(),
    };
    const saved = await this.imagesRepo.save(toSave as any);
    return saved;
  }

  async update(id: number, meta: any) {
    const pk = this.imagesRepo.metadata.primaryColumns[0].propertyName;
    const found = await this.imagesRepo.findOneBy({ [pk]: Number(id) } as any);
    if (!found) throw new NotFoundException('Image not found');
    const updated = Object.assign(found, meta);
    return this.imagesRepo.save(updated as any);
  }

  async remove(id: number) {
    const pk = this.imagesRepo.metadata.primaryColumns[0].propertyName;
    const found = await this.imagesRepo.findOneBy({ [pk]: Number(id) } as any);
    if (!found) throw new NotFoundException('Image not found');

    // Try to remove file on disk if path field exists
    const possiblePaths = [
      (found as any).FilePath,
      (found as any).filePath,
      (found as any).path,
      (found as any).FileName,
    ];
    for (const p of possiblePaths) {
      if (!p) continue;
      const full = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
      try {
        if (fs.existsSync(full) && fs.statSync(full).isFile()) {
          fs.unlinkSync(full);
        }
      } catch (err) {
        // ignore file deletion errors
      }
    }

    await this.imagesRepo.delete((found as any)[pk]);
    return { deleted: true };
  }
}
// ...existing code...