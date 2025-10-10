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

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    const image = await this.repo.findOneBy({ ImageID: id });
    if (!image) throw new NotFoundException(`Image ${id} không tồn tại`);
    return image;
  }

  async create(dto: ImageCreateDto) {
    const entity = this.repo.create(dto as Partial<Image>);
    return await this.repo.save(entity);
  }

  async update(id: number, dto: ImageUpdateDto) {
    const exist = await this.repo.findOneBy({ ImageID: id });
    if (!exist) throw new NotFoundException(`Image ${id} không tồn tại`);
    await this.repo.update({ ImageID: id }, dto as Partial<Image>);
    return this.findOne(id);
  }

  async remove(id: number) {
    const exist = await this.repo.findOneBy({ ImageID: id });
    if (!exist) throw new NotFoundException(`Image ${id} không tồn tại`);
    await this.repo.delete({ ImageID: id });
    return { deleted: true, id };
  }
}
