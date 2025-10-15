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
exports.Article = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const analytics_entity_1 = require("./analytics.entity");
const contribution_entity_1 = require("./contribution.entity");
const feedback_entity_1 = require("./feedback.entity");
const image_entity_1 = require("./image.entity");
const timeline_entity_1 = require("./timeline.entity");
const version_history_entity_1 = require("./version-history.entity");
let Article = class Article {
    ArticleID;
    Title;
    Content;
    Language;
    CreatedAt;
    UpdatedAt;
    UserID;
    user;
    analytics;
    contributions;
    feedbacks;
    images;
    timelines;
    versionHistories;
};
exports.Article = Article;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Article.prototype, "ArticleID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Article.prototype, "Title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', nullable: true }),
    __metadata("design:type", String)
], Article.prototype, "Content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'vi' }),
    __metadata("design:type", String)
], Article.prototype, "Language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Article.prototype, "CreatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Article.prototype, "UpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Article.prototype, "UserID", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.articles),
    (0, typeorm_1.JoinColumn)({ name: 'UserID' }),
    __metadata("design:type", user_entity_1.User)
], Article.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => analytics_entity_1.Analytics, analytics => analytics.article),
    __metadata("design:type", Array)
], Article.prototype, "analytics", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => contribution_entity_1.Contribution, contribution => contribution.article),
    __metadata("design:type", Array)
], Article.prototype, "contributions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => feedback_entity_1.Feedback, feedback => feedback.article),
    __metadata("design:type", Array)
], Article.prototype, "feedbacks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => image_entity_1.Image, image => image.article),
    __metadata("design:type", Array)
], Article.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => timeline_entity_1.Timeline, timeline => timeline.article),
    __metadata("design:type", Array)
], Article.prototype, "timelines", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => version_history_entity_1.VersionHistory, versionHistory => versionHistory.article),
    __metadata("design:type", Array)
], Article.prototype, "versionHistories", void 0);
exports.Article = Article = __decorate([
    (0, typeorm_1.Entity)('Articles')
], Article);
//# sourceMappingURL=article.entity.js.map