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
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../entities");
const typeorm_2 = require("typeorm");
let ArticlesService = class ArticlesService {
    articleRepository;
    constructor(articleRepository) {
        this.articleRepository = articleRepository;
    }
    findAll() {
        return this.articleRepository.find();
    }
    async findOne(id) {
        const article = await this.articleRepository.findOneBy({ ArticleID: id });
        if (!article)
            throw new common_1.NotFoundException(`Article ${id} not found`);
        return article;
    }
    create(createDto) {
        const entity = this.articleRepository.create(createDto);
        return this.articleRepository.save(entity);
    }
    async update(id, updateDto) {
        await this.articleRepository.update({ ArticleID: id }, updateDto);
        return this.findOne(id);
    }
    async replace(id, createDto) {
        const entity = this.articleRepository.create({ ...createDto, ArticleID: id });
        return this.articleRepository.save(entity);
    }
    async remove(id) {
        await this.articleRepository.delete({ ArticleID: id });
        return { deleted: true, id };
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Article)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map