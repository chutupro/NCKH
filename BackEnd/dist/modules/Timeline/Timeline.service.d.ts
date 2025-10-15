import { Repository } from 'typeorm';
import { Timeline } from '../entities/timeline.entity';
import { TimelineCreateDto } from './dto/Timeline.create';
import { TimelineUpdateDto } from './dto/Timeline.update';
export declare class TimelineService {
    private readonly repo;
    constructor(repo: Repository<Timeline>);
    findAll(): Promise<Timeline[]>;
    findByArticle(articleId: number): Promise<Timeline[]>;
    findOne(id: number): Promise<Timeline>;
    create(dto: TimelineCreateDto): Promise<Timeline>;
    update(id: number, dto: TimelineUpdateDto): Promise<Timeline>;
    remove(id: number): Promise<{
        deleted: boolean;
        id: number;
    }>;
}
