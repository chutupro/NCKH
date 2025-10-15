"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const timeline_entity_1 = require("../entities/timeline.entity");
let TimelineService = class TimelineService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    findAll() {
        return this.repo.find({ relations: ['article'] });
    }
    findByArticle(articleId) {
        return this.repo.find({
            where: { ArticleID: articleId },
            order: { EventDate: 'ASC' },
        });
    }
    async findOne(id) {
        const item = await this.repo.findOne({
            where: { TimelineID: id },
            relations: ['article'],
        });
        if (!item)
            throw new common_1.NotFoundException(`Timeline ${id} not found`);
        return item;
    }
    create(dto) {
        const entity = this.repo.create(dto);
        return this.repo.save(entity);
    }
    async update(id, dto) {
        await this.repo.update({ TimelineID: id }, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.repo.delete({ TimelineID: id });
        return { deleted: true, id };
    }
};
exports.TimelineService = TimelineService;
exports.TimelineService = TimelineService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(timeline_entity_1.Timeline)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TimelineService);
//# sourceMappingURL=Timeline.service.js.map