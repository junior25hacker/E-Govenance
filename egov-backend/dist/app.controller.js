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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_service_1 = require("./app.service");
const express = __importStar(require("express"));
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const auth_service_1 = require("./auth/auth.service");
const documents_service_1 = require("./documents/documents.service");
let AppController = class AppController {
    appService;
    authService;
    documentsService;
    constructor(appService, authService, documentsService) {
        this.appService = appService;
        this.authService = authService;
        this.documentsService = documentsService;
    }
    root(res) {
        return res.sendFile((0, path_1.join)(process.cwd(), 'public', 'index.html'));
    }
    landing(res) {
        return res.sendFile((0, path_1.join)(process.cwd(), 'public', 'index.html'));
    }
    login() {
        return { title: 'CitizenNode | Login' };
    }
    async dashboard(req) {
        const userProfile = await this.authService.getUserProfile(req.user.id);
        const documents = await this.documentsService.findByCitizen(userProfile.citizenId);
        const metrics = await this.documentsService.getMetrics(userProfile.citizenId);
        return {
            title: 'CitizenNode | Dashboard',
            user: userProfile,
            token: req.cookies?.token,
            documents: documents,
            documentCount: documents.length,
            approvedCount: metrics.approvedDocuments,
            pendingCount: metrics.pendingActions,
            rejectedCount: metrics.rejectedDocuments,
        };
    }
    civilStatus() {
        return { title: 'CitizenNode | Civil Status' };
    }
    async documentsView(req) {
        const userProfile = await this.authService.getUserProfile(req.user.id);
        return { title: 'CitizenNode | My Documents', user: userProfile, token: req.cookies?.token };
    }
    async requestView(req) {
        const userProfile = await this.authService.getUserProfile(req.user.id);
        const requestsData = await this.documentsService.getRequests(userProfile.citizenId);
        const requests = requestsData.map(r => ({
            ...r,
            createdAtFormatted: r.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
        return { title: 'CitizenNode | New Request', user: userProfile, token: req.cookies?.token, requests };
    }
    async trackRequestsView(req, requestId) {
        const userProfile = await this.authService.getUserProfile(req.user.id);
        return { title: 'CitizenNode | Track Requests', user: userProfile, token: req.cookies?.token, requestId };
    }
    async reportView(req) {
        const userProfile = await this.authService.getUserProfile(req.user.id);
        return { title: 'CitizenNode | Report Issue', user: userProfile, token: req.cookies?.token };
    }
    async settingsView(req) {
        const userProfile = await this.authService.getUserProfile(req.user.id);
        return { title: 'CitizenNode | Settings', user: userProfile, token: req.cookies?.token };
    }
    helpView() {
        return { title: 'CitizenNode | Help & Support' };
    }
    submitView() {
        return { title: 'CitizenNode | Document Submission' };
    }
    async getCitizenMetrics(req) {
        try {
            const citizenId = req.user?.citizenId || undefined;
            const metrics = await this.documentsService.getMetrics(citizenId);
            return {
                status: 'success',
                data: metrics,
            };
        }
        catch {
            const metrics = await this.documentsService.getMetrics();
            return {
                status: 'success',
                data: metrics,
            };
        }
    }
    getLostDocumentSchema(type) {
        const dataSchema = this.appService.getDocumentSchema(type);
        return dataSchema;
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "root", null);
__decorate([
    (0, common_1.Get)('landing'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "landing", null);
__decorate([
    (0, common_1.Get)('login'),
    (0, common_1.Render)('login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('dashboard'),
    (0, common_1.Render)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('civil-status'),
    (0, common_1.Render)('civil-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "civilStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('documents'),
    (0, common_1.Render)('documents'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "documentsView", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('request'),
    (0, common_1.Render)('request'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "requestView", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(['track-requests', 'tracking-request', 'tracking-request/:requestId']),
    (0, common_1.Render)('track-requests'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "trackRequestsView", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('report'),
    (0, common_1.Render)('report'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "reportView", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('settings'),
    (0, common_1.Render)('settings'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "settingsView", null);
__decorate([
    (0, common_1.Get)('help'),
    (0, common_1.Render)('help'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "helpView", null);
__decorate([
    (0, common_1.Get)('submit'),
    (0, common_1.Render)('submit'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "submitView", null);
__decorate([
    (0, common_1.Get)('api/v1/citizen/metrics'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getCitizenMetrics", null);
__decorate([
    (0, common_1.Get)('api/lost-doc-schema'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getLostDocumentSchema", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        auth_service_1.AuthService,
        documents_service_1.DocumentsService])
], AppController);
//# sourceMappingURL=app.controller.js.map