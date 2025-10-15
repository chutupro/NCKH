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
exports.Timeline = void 0;
const typeorm_1 = require("typeorm");
const article_entity_1 = require("./article.entity");
let Timeline = class Timeline {
    TimelineID;
    ArticleID;
    EventDate;
    Description;
    article;
};
exports.Timeline = Timeline;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Timeline.prototype, "TimelineID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Timeline.prototype, "ArticleID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Timeline.prototype, "EventDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Timeline.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => article_entity_1.Article, article => article.timelines),
    (0, typeorm_1.JoinColumn)({ name: 'ArticleID' }),
    __metadata("design:type", article_entity_1.Article)
], Timeline.prototype, "article", void 0);
exports.Timeline = Timeline = __decorate([
    (0, typeorm_1.Entity)('Timelines')
], Timeline);
//# sourceMappingURL=timeline.entity.js.map