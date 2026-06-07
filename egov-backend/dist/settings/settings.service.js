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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../auth/entities/user.entity");
const DEFAULT_PREFS = {
    emailNotifications: true,
    smsNotifications: true,
    publicProfile: false,
    shareWithAgencies: true,
    twoFactorAuth: false,
};
let SettingsService = class SettingsService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async initializeSettings(userId, citizenId, email) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (user) {
            user.preferences = JSON.stringify(DEFAULT_PREFS);
            await this.userRepository.save(user);
            console.log('[SETTINGS] User settings initialized for:', userId);
        }
    }
    parsePreferences(prefsString) {
        if (!prefsString)
            return { ...DEFAULT_PREFS };
        try {
            return { ...DEFAULT_PREFS, ...JSON.parse(prefsString) };
        }
        catch (e) {
            return { ...DEFAULT_PREFS };
        }
    }
    async getSettings(userId) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return {
            userId: user.id,
            citizenId: user.citizenId,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            nationalId: user.nationalId,
            avatar: user.avatar,
            registeredDate: user.createdAt,
            preferences: this.parsePreferences(user.preferences),
            updatedAt: user.updatedAt,
        };
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (updateProfileDto.fullName !== undefined)
            user.fullName = updateProfileDto.fullName;
        if (updateProfileDto.email !== undefined)
            user.email = updateProfileDto.email;
        if (updateProfileDto.phone !== undefined)
            user.phone = updateProfileDto.phone;
        if (updateProfileDto.nationalId !== undefined)
            user.nationalId = updateProfileDto.nationalId;
        await this.userRepository.save(user);
        console.log('[SETTINGS] Profile updated for user:', userId);
        return this.getSettings(userId);
    }
    async changePassword(userId, changePasswordDto) {
        if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        if (changePasswordDto.newPassword.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters long');
        }
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const passwordMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
        if (!passwordMatch) {
            throw new common_1.BadRequestException('Invalid current password');
        }
        const salt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);
        await this.userRepository.save(user);
        console.log('[SETTINGS] Password changed for user:', userId);
        return {
            status: 'success',
            message: 'Password changed successfully. Please log in again.',
        };
    }
    async updatePreferences(userId, updatePreferencesDto) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const prefs = this.parsePreferences(user.preferences);
        if (updatePreferencesDto.emailNotifications !== undefined)
            prefs.emailNotifications = updatePreferencesDto.emailNotifications;
        if (updatePreferencesDto.smsNotifications !== undefined)
            prefs.smsNotifications = updatePreferencesDto.smsNotifications;
        if (updatePreferencesDto.publicProfile !== undefined)
            prefs.publicProfile = updatePreferencesDto.publicProfile;
        if (updatePreferencesDto.shareWithAgencies !== undefined)
            prefs.shareWithAgencies = updatePreferencesDto.shareWithAgencies;
        if (updatePreferencesDto.twoFactorAuth !== undefined)
            prefs.twoFactorAuth = updatePreferencesDto.twoFactorAuth;
        user.preferences = JSON.stringify(prefs);
        await this.userRepository.save(user);
        console.log('[SETTINGS] Preferences updated for user:', userId);
        return this.getSettings(userId);
    }
    async exportData(userId, format) {
        const settings = await this.getSettings(userId);
        const exportData = {
            profile: {
                citizenId: settings.citizenId,
                email: settings.email,
                fullName: settings.fullName,
                phone: settings.phone,
                nationalId: settings.nationalId,
                registeredDate: settings.registeredDate,
            },
            preferences: settings.preferences,
            exportDate: new Date(),
            format: format,
        };
        console.log('[SETTINGS] Data exported for user:', userId, 'Format:', format);
        return exportData;
    }
    async deleteAccount(userId) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        await this.userRepository.remove(user);
        console.log('[SETTINGS] Account deleted for user:', userId);
        return {
            status: 'success',
            message: 'Account deleted successfully',
        };
    }
    async uploadAvatar(userId, avatarPath) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        user.avatar = avatarPath;
        await this.userRepository.save(user);
        console.log('[SETTINGS] Avatar updated for user:', userId);
        return this.getSettings(userId);
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map