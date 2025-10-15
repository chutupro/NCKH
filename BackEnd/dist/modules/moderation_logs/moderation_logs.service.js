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
exports.ModerationLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const entities_2 = require("../entities");
const entities_3 = require("../entities");
let ModerationLogsService = class ModerationLogsService {
    moderationLogRepo;
    contributionRepo;
    userRepo;
    constructor(moderationLogRepo, contributionRepo, userRepo) {
        this.moderationLogRepo = moderationLogRepo;
        this.contributionRepo = contributionRepo;
        this.userRepo = userRepo;
    }
    async create(dto) {
        const contribution = await this.contributionRepo.findOne({
            where: { ContributionID: dto.ContributionID },
        });
        if (!contribution)
            throw new common_1.NotFoundException('Contribution not found');
        const moderator = await this.userRepo.findOne({
            where: { UserID: dto.ModeratorID },
        });
        if (!moderator)
            throw new common_1.NotFoundException('Moderator not found');
        const log = this.moderationLogRepo.create({
            contribution,
            moderator,
            Action: dto.Action,
            Reason: dto.Reason,
        });
        return await this.moderationLogRepo.save(log);
    }
    async findAll() {
        return await this.moderationLogRepo.find({
            relations: ['contribution', 'moderator'],
            order: { Timestamp: 'DESC' },
        });
    }
    async findOne(id) {
        const log = await this.moderationLogRepo.findOne({
            where: { LogID: id },
            relations: ['contribution', 'moderator'],
        });
        if (!log)
            throw new common_1.NotFoundException('Moderation log not found');
        return log;
    }
    async update(id, dto) {
        const log = await this.moderationLogRepo.findOne({ where: { LogID: id } });
        if (!log)
            throw new common_1.NotFoundException('Moderation log not found');
        Object.assign(log, dto);
        return await this.moderationLogRepo.save(log);
    }
    async remove(id) {
        const log = await this.moderationLogRepo.findOne({ where: { LogID: id } });
        if (!log)
            throw new common_1.NotFoundException('Moderation log not found');
        await this.moderationLogRepo.remove(log);
        return { message: 'Deleted successfully' };
    }
};
exports.ModerationLogsService = ModerationLogsService;
exports.ModerationLogsService = ModerationLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ModerationLog)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_2.Contribution)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_3.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ModerationLogsService);
//# sourceMappingURL=moderation_logs.service.js.map