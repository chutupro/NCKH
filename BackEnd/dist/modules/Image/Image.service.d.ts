import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import { ImageCreateDto } from './dto/Image.create.dto';
import { ImageUpdateDto } from './dto/Image.update';
export declare class ImageService {
    private readonly repo;
    constructor(repo: Repository<Image>);
    findAll(): Promise<Image[]>;
    findOne(id: number): Promise<Image>;
    create(dto: ImageCreateDto): Promise<Image>;
    update(id: number, dto: ImageUpdateDto): Promise<Image>;
    remove(id: number): Promise<{
        deleted: boolean;
        id: number;
    }>;
}
