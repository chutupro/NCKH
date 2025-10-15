import { TimelineService } from './Timeline.service';
import { TimelineCreateDto } from './dto/Timeline.create';
import { TimelineUpdateDto } from './dto/Timeline.update';
export declare class TimelineController {
    private readonly service;
    constructor(service: TimelineService);
    findAll(): Promise<import("../entities").Timeline[]>;
    findByArticle(articleId: number): Promise<import("../entities").Timeline[]>;
    findOne(id: number): Promise<import("../entities").Timeline>;
    create(dto: TimelineCreateDto): Promise<import("../entities").Timeline>;
    update(id: number, dto: TimelineUpdateDto): Promise<import("../entities").Timeline>;
    remove(id: number): Promise<{
        deleted: boolean;
        id: number;
    }>;
}
