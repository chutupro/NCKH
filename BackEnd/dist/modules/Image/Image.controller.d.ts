import { ImageService } from './Image.service';
import { ImageCreateDto } from './dto/Image.create.dto';
import { ImageUpdateDto } from './dto/Image.update';
export declare class ImageController {
    private readonly service;
    constructor(service: ImageService);
    findAll(): Promise<import("../entities").Image[]>;
    findOne(id: number): Promise<import("../entities").Image>;
    create(dto: ImageCreateDto): Promise<import("../entities").Image>;
    update(id: number, dto: ImageUpdateDto): Promise<import("../entities").Image>;
    remove(id: number): Promise<{
        deleted: boolean;
        id: number;
    }>;
}
