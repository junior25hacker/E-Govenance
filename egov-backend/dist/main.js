"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs = __importStar(require("fs"));
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
require('dotenv').config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    const express = require('express');
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
        .split(',')
        .map(o => o.trim());
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
                callback(null, true);
            }
            else {
                if (process.env.NODE_ENV === 'development') {
                    callback(null, true);
                }
                else {
                    callback(new Error(`Origin ${origin} not allowed by CORS`));
                }
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads' });
    app.setBaseViewsDir((0, path_1.join)(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('[BACKEND] 📁 Created uploads directory:', uploadsDir);
    }
    hbs.registerHelper('eq', (a, b) => a === b);
    hbs.registerHelper('ne', (a, b) => a !== b);
    hbs.registerHelper('gt', (a, b) => a > b);
    hbs.registerHelper('lt', (a, b) => a < b);
    hbs.registerHelper('and', (a, b) => a && b);
    hbs.registerHelper('or', (a, b) => a || b);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`[BACKEND] 🚀 E-Governance Backend & Portal running on: http://localhost:${port}`);
    console.log(`[BACKEND] 📦 Database: ${process.env.DATABASE_URL ? 'PostgreSQL (Render)' : 'SQLite (' + (process.env.DB_PATH || './database.sqlite') + ')'}`);
    console.log(`[BACKEND] 🔐 JWT Secret: ${process.env.JWT_SECRET ? '(from .env)' : '(default)'}`);
    console.log(`[BACKEND] 🌐 CORS Origins: ${corsOrigins.join(', ')}`);
    console.log(`[BACKEND] 📁 Uploads: ${uploadsDir}`);
}
bootstrap();
//# sourceMappingURL=main.js.map