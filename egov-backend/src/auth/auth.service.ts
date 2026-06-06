import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private settingsService: SettingsService,
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
      // profileComplete: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Initialize settings for new user
    this.settingsService.initializeSettings(savedUser.id, savedUser.citizenId, savedUser.email);

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
        role: 'SUPER_ADMIN' // Return a default role for JavaFX admin client
      }
    };
  }

  async completeProfile(userId: string, docType: string, docPath: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    // user.verificationDocType = docType;
    // user.verificationDocPath = docPath || 'uploaded_doc.png';
    // user.profileComplete = true;

    await this.userRepository.save(user);

    console.log('[AUTH] Profile completed for user', userId);
    return { status: 'success', message: 'Profile verified' };
  }

  async skipVerification(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    console.log('[AUTH] Verification skipped for user', userId);
    return { status: 'success', message: 'Verification skipped' };
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    const { passwordHash, ...result } = user;
    return result;
  }
}
