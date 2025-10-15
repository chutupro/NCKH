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
exports.ModerationLogsController = void 0;
const common_1 = require("@nestjs/common");
const moderation_logs_service_1 = require("./moderation_logs.service");
const create_moderation_log_dto_1 = require("./dto/create-moderation_log.dto");
const update_moderation_log_dto_1 = require("./dto/update-moderation_log.dto");
let ModerationLogsController = class ModerationLogsController {
    moderationLogsService;
    constructor(moderationLogsService) {
        this.moderationLogsService = moderationLogsService;
    }
    create(dto) {
        return this.moderationLogsService.create(dto);
    }
    findAll() {
        return this.moderationLogsService.findAll();
    }
    findOne(id) {
        return this.moderationLogsService.findOne(+id);
    }
    update(id, dto) {
        return this.moderationLogsService.update(+id, dto);
    }
    remove(id) {
        return this.moderationLogsService.remove(+id);
    }
};
exports.ModerationLogsController = ModerationLogsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_moderation_log_dto_1.CreateModerationLogDto]),
    __metadata("design:returntype", void 0)
], ModerationLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ModerationLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ModerationLogsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_moderation_log_dto_1.UpdateModerationLogDto]),
    __metadata("design:returntype", void 0)
], ModerationLogsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ModerationLogsController.prototype, "remove", null);
exports.ModerationLogsController = ModerationLogsController = __decorate([
    (0, common_1.Controller)('moderation-logs'),
    __metadata("design:paramtypes", [moderation_logs_service_1.ModerationLogsService])
], ModerationLogsController);
//# sourceMappingURL=moderation_logs.controller.js.map