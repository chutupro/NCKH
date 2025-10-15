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
exports.Contribution = void 0;
const typeorm_1 = require("typeorm");
const article_entity_1 = require("./article.entity");
const user_entity_1 = require("./user.entity");
const moderation_log_entity_1 = require("./moderation-log.entity");
let Contribution = class Contribution {
    ContributionID;
    ArticleID;
    UserID;
    Content;
    Status;
    SubmittedAt;
    article;
    user;
    moderationLogs;
};
exports.Contribution = Contribution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Contribution.prototype, "ContributionID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Contribution.prototype, "ArticleID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Contribution.prototype, "UserID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', nullable: true }),
    __metadata("design:type", String)
], Contribution.prototype, "Content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'Pending' }),
    __metadata("design:type", String)
], Contribution.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Contribution.prototype, "SubmittedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => article_entity_1.Article, article => article.contributions),
    (0, typeorm_1.JoinColumn)({ name: 'ArticleID' }),
    __metadata("design:type", article_entity_1.Article)
], Contribution.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.contributions),
    (0, typeorm_1.JoinColumn)({ name: 'UserID' }),
    __metadata("design:type", user_entity_1.User)
], Contribution.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => moderation_log_entity_1.ModerationLog, moderationLog => moderationLog.contribution),
    __metadata("design:type", Array)
], Contribution.prototype, "moderationLogs", void 0);
exports.Contribution = Contribution = __decorate([
    (0, typeorm_1.Entity)('Contributions')
], Contribution);
//# sourceMappingURL=contribution.entity.js.map