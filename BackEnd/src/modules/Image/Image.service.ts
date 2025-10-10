import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import { ImageCreateDto } from './dto/Image.create.dto';
import { ImageUpdateDto } from './dto/Image.update';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly repo: Repository<Image>,
  ) {}

  findAll(): Promise<Image[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Image> {
    const image = await this.repo.findOneBy({ ImageID: id });
    if (!image) throw new NotFoundException(`Image ${id} not found`);
    return image;
  }

  create(dto: ImageCreateDto): Promise<Image> {
    const entity = this.repo.create(dto as Partial<Image>);
    return this.repo.save(entity);
  }

  async update(id: number, dto: ImageUpdateDto): Promise<Image> {
    await this.repo.update({ ImageID: id }, dto as Partial<Image>);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete({ ImageID: id });
    return { deleted: true, id };
  }
}