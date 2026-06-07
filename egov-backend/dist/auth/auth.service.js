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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("./entities/user.entity");
const settings_service_1 = require("../settings/settings.service");
let AuthService = class AuthService {
    userRepository;
    jwtService;
    settingsService;
    constructor(userRepository, jwtService, settingsService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.settingsService = settingsService;
    }
    async generateCitizenId() {
        let isUnique = false;
        let citizenId = '';
        while (!isUnique) {
            const random4 = Math.floor(1000 + Math.random() * 9000);
            citizenId = `CITIZEN-${random4}`;
            const existing = await this.userRepository.findOneBy({ citizenId });
            if (!existing)
                isUnique = true;
        }
        return citizenId;
    }
    async register(dto) {
        const existing = await this.userRepository.findOneBy({ email: dto.email });
        if (existing) {
            throw new common_1.UnauthorizedException('Email already registered');
        }
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(dto.password, salt);
        const citizenId = await this.generateCitizenId();
        const user = this.userRepository.create({
            email: dto.email,
            passwordHash: hash,
            citizenId: citizenId,
            profileComplete: false,
        });
        const savedUser = await this.userRepository.save(user);
        this.settingsService.initializeSettings(savedUser.id, savedUser.citizenId, savedUser.email);
        console.log('[AUTH] User registered:', citizenId);
        const payload = { sub: savedUser.id, email: savedUser.email, citizenId: savedUser.citizenId };
        return {
            status: 'success',
            citizenId: savedUser.citizenId,
            token: this.jwtService.sign(payload),
        };
    }
    async login(citizenId, password) {
        const user = await this.userRepository.findOneBy({ citizenId });
        if (!user) {
            console.log('[AUTH] Login failed: citizen not found', citizenId);
            return null;
        }
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            console.log('[AUTH] Login failed: password mismatch for', citizenId);
            return null;
        }
        console.log('[AUTH] Login successful for', citizenId);
        const payload = { sub: user.id, email: user.email, citizenId: user.citizenId };
        return {
            status: 'success',
            token: this.jwtService.sign(payload),
            citizen: {
                id: user.citizenId,
                email: user.email,
                role: user.role
            }
        };
    }
    async completeProfile(userId, docType, docPath) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        user.verificationDocType = docType;
        user.verificationDocPath = docPath || 'uploaded_doc.png';
        user.profileComplete = true;
        await this.userRepository.save(user);
        console.log('[AUTH] Profile completed for user', userId);
        return { status: 'success', message: 'Profile verified' };
    }
    async skipVerification(userId) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        console.log('[AUTH] Verification skipped for user', userId);
        return { status: 'success', message: 'Verification skipped' };
    }
    async getUserProfile(userId) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const { passwordHash, ...result } = user;
        return result;
    }
    async getVerifiedCitizenProfileByCitizenId(citizenId) {
        const user = await this.userRepository.findOneBy({ citizenId });
        if (!user)
            throw new common_1.UnauthorizedException('Citizen not found');
        if (!user.profileComplete)
            throw new common_1.UnauthorizedException('Citizen profile is not verified');
        const { passwordHash, ...result } = user;
        return result;
    }
    async seedAdmins() {
        const admins = [
            { citizenId: 'admin_doc', email: 'doc@citizennode.com', password: 'password123', role: 'DOCUMENT_VALIDATOR', fullName: 'Doc Validator' },
            { citizenId: 'admin_req', email: 'req@citizennode.com', password: 'password123', role: 'REQUEST_HANDLER', fullName: 'Request Handler' },
            { citizenId: 'admin_rep', email: 'rep@citizennode.com', password: 'password123', role: 'REPORT_HANDLER', fullName: 'Report Handler' },
        ];
        for (const admin of admins) {
            const existing = await this.userRepository.findOneBy({ citizenId: admin.citizenId });
            if (!existing) {
                const salt = await bcrypt.genSalt();
                const hash = await bcrypt.hash(admin.password, salt);
                const user = this.userRepository.create({
                    citizenId: admin.citizenId,
                    email: admin.email,
                    passwordHash: hash,
                    fullName: admin.fullName,
                    role: admin.role,
                    profileComplete: true,
                });
                await this.userRepository.save(user);
                console.log(`[AUTH] Seeded admin: ${admin.citizenId}`);
            }
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        settings_service_1.SettingsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map