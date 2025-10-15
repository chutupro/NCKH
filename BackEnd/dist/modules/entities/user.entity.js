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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const role_entity_1 = require("./role.entity");
const article_entity_1 = require("./article.entity");
const contribution_entity_1 = require("./contribution.entity");
const feedback_entity_1 = require("./feedback.entity");
const moderation_log_entity_1 = require("./moderation-log.entity");
const version_history_entity_1 = require("./version-history.entity");
let User = class User {
    UserID;
    Email;
    PasswordHash;
    FullName;
    RoleID;
    CreatedAt;
    role;
    articles;
    contributions;
    feedbacks;
    moderationLogs;
    versionHistories;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "UserID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], User.prototype, "Email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "PasswordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "FullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "RoleID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], User.prototype, "CreatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, role => role.users),
    (0, typeorm_1.JoinColumn)({ name: 'RoleID' }),
    __metadata("design:type", role_entity_1.Role)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => article_entity_1.Article, article => article.user),
    __metadata("design:type", Array)
], User.prototype, "articles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => contribution_entity_1.Contribution, contribution => contribution.user),
    __metadata("design:type", Array)
], User.prototype, "contributions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => feedback_entity_1.Feedback, feedback => feedback.user),
    __metadata("design:type", Array)
], User.prototype, "feedbacks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => moderation_log_entity_1.ModerationLog, moderationLog => moderationLog.moderator),
    __metadata("design:type", Array)
], User.prototype, "moderationLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => version_history_entity_1.VersionHistory, versionHistory => versionHistory.user),
    __metadata("design:type", Array)
], User.prototype, "versionHistories", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('Users')
], User);
//# sourceMappingURL=user.entity.js.map