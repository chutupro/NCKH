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
exports.contributionsController = void 0;
const common_1 = require("@nestjs/common");
const contributions_service_1 = require("./contributions.service");
let contributionsController = class contributionsController {
    contributionsService;
    constructor(contributionsService) {
        this.contributionsService = contributionsService;
    }
    findAll() {
        return this.contributionsService.findAll();
    }
};
exports.contributionsController = contributionsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], contributionsController.prototype, "findAll", null);
exports.contributionsController = contributionsController = __decorate([
    (0, common_1.Controller)("contributions"),
    __metadata("design:paramtypes", [contributions_service_1.contributionsService])
], contributionsController);
//# sourceMappingURL=contributions.controller.js.map