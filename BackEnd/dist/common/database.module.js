"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const entities_1 = require("../modules/entities");
let databaseModule = class databaseModule {
};
exports.databaseModule = databaseModule;
exports.databaseModule = databaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'mysql',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 3310),
                    username: configService.get('DB_USERNAME', 'root'),
                    password: configService.get('DB_PASSWORD', '123456'),
                    database: configService.get('DB_NAME', 'DaNangDynamicVault'),
                    entities: [
                        entities_1.Role,
                        entities_1.User,
                        entities_1.Article,
                        entities_1.Analytics,
                        entities_1.Contribution,
                        entities_1.Feedback,
                        entities_1.Image,
                        entities_1.ModerationLog,
                        entities_1.Timeline,
                        entities_1.VersionHistory
                    ],
                }),
                inject: [config_1.ConfigService],
            }),
        ],
    })
], databaseModule);
//# sourceMappingURL=database.module.js.map