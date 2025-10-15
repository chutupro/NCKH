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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationLog = void 0;
const typeorm_1 = require("typeorm");
const contribution_entity_1 = require("./contribution.entity");
const user_entity_1 = require("./user.entity");
let ModerationLog = class ModerationLog {
    LogID;
    ContributionID;
    ModeratorID;
    Action;
    Reason;
    Timestamp;
    contribution;
    moderator;
};
exports.ModerationLog = ModerationLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ModerationLog.prototype, "LogID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ModerationLog.prototype, "ContributionID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ModerationLog.prototype, "ModeratorID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ModerationLog.prototype, "Action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ModerationLog.prototype, "Reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], ModerationLog.prototype, "Timestamp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => contribution_entity_1.Contribution, contribution => contribution.moderationLogs),
    (0, typeorm_1.JoinColumn)({ name: 'ContributionID' }),
    __metadata("design:type", contribution_entity_1.Contribution)
], ModerationLog.prototype, "contribution", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.moderationLogs),
    (0, typeorm_1.JoinColumn)({ name: 'ModeratorID' }),
    __metadata("design:type", user_entity_1.User)
], ModerationLog.prototype, "moderator", void 0);
exports.ModerationLog = ModerationLog = __decorate([
    (0, typeorm_1.Entity)('ModerationLogs')
], ModerationLog);
//# sourceMappingURL=moderation-log.entity.js.map