"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const settings_module_1 = require("./settings/settings.module");
const auth_module_1 = require("./auth/auth.module");
const documents_module_1 = require("./documents/documents.module");
const requests_module_1 = require("./requests/requests.module");
const user_entity_1 = require("./auth/entities/user.entity");
const document_entity_1 = require("./documents/entities/document.entity");
const document_request_entity_1 = require("./documents/entities/document-request.entity");
const report_entity_1 = require("./documents/entities/report.entity");
const request_entity_1 = require("./requests/entities/request.entity");
const request_log_entity_1 = require("./requests/entities/request-log.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: process.env.DATABASE_URL ? 'postgres' : 'better-sqlite3',
                url: process.env.DATABASE_URL,
                database: process.env.DATABASE_URL ? undefined : (process.env.DB_PATH || './database.sqlite'),
                ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
                entities: [user_entity_1.User, document_entity_1.Document, document_request_entity_1.DocumentRequest, report_entity_1.Report, request_entity_1.TrackingRequest, request_log_entity_1.RequestLog],
                synchronize: process.env.NODE_ENV !== 'production',
                logging: process.env.NODE_ENV === 'development',
            }),
            settings_module_1.SettingsModule,
            auth_module_1.AuthModule,
            documents_module_1.DocumentsModule,
            requests_module_1.RequestsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map