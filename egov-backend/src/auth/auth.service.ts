import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { SettingsService } from '../settings/settings.service';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { LogSeverity, SourceModule } from '../system-logs/entities/system-log.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private settingsService: SettingsService,
    private systemLogsService: SystemLogsService,
  ) {}

  async generateCitizenId(): Promise<string> {
    let isUnique = false;
    let citizenId = '';
    while (!isUnique) {
      const random4 = Math.floor(1000 + Math.random() * 9000);
      citizenId = `CITIZEN-${random4}`;
      const existing = await this.userRepository.findOneBy({ citizenId });
      if (!existing) isUnique = true;
    }
    return citizenId;
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new UnauthorizedException('Email already registered');
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

    // Initialize settings for new user
    this.settingsService.initializeSettings(savedUser.id, savedUser.citizenId, savedUser.email);

    await this.systemLogsService.createLog({
      title: 'Account Registered',
      description: `New user account created.`,
      userId: savedUser.citizenId,
      performedBy: savedUser.citizenId,
      sourceModule: SourceModule.SECURITY,
      severity: LogSeverity.MEDIUM,
    });

    console.log('[AUTH] User registered:', citizenId);

    const payload = { sub: savedUser.id, email: savedUser.email, citizenId: savedUser.citizenId };
    return {
      status: 'success',
      citizenId: savedUser.citizenId,
      token: this.jwtService.sign(payload),
    };
  }

  async login(citizenId: string, password: string) {
    const user = await this.userRepository.findOneBy({ citizenId });
    if (!user) {
      console.log('[AUTH] Login failed: citizen not found', citizenId);
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      console.log('[AUTH] Login failed: password mismatch for', citizenId);
      await this.systemLogsService.createLog({
        title: 'Failed Login Attempt',
        description: `Invalid password attempt for account.`,
        userId: user.citizenId,
        performedBy: 'System',
        sourceModule: SourceModule.SECURITY,
        severity: LogSeverity.HIGH,
      });
      return null;
    }

    console.log('[AUTH] Login successful for', citizenId);
    await this.systemLogsService.createLog({
      title: 'Successful Login',
      description: `User signed in successfully.`,
      userId: user.citizenId,
      performedBy: user.citizenId,
      sourceModule: SourceModule.SECURITY,
      severity: LogSeverity.LOW,
    });
    
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

  async completeProfile(userId: number, docType: string, docPath: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    user.verificationDocType = docType;
    user.verificationDocPath = docPath || 'uploaded_doc.png';
    user.profileComplete = true;

    await this.userRepository.save(user);

    await this.systemLogsService.createLog({
      title: 'Profile Updated',
      description: `Profile verification document submitted (${docType}).`,
      userId: user.citizenId,
      performedBy: user.citizenId,
      sourceModule: SourceModule.ACCOUNT,
      severity: LogSeverity.LOW,
    });

    console.log('[AUTH] Profile completed for user', userId);
    return { status: 'success', message: 'Profile verified' };
  }

  async skipVerification(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    console.log('[AUTH] Verification skipped for user', userId);
    return { status: 'success', message: 'Verification skipped' };
  }

  async getUserProfile(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    const { passwordHash, ...result } = user;
    return result;
  }

  async getVerifiedCitizenProfileByCitizenId(citizenId: string) {
    const user = await this.userRepository.findOneBy({ citizenId });
    if (!user) throw new UnauthorizedException('Citizen not found');
    if (!user.profileComplete) throw new UnauthorizedException('Citizen profile is not verified');

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
}
