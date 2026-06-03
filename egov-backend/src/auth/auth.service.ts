import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

interface User {
  id: number;
  email: string;
  citizenId: string;
  passwordHash: string;
  profileComplete: boolean;
  verificationDocType?: string;
  verificationDocPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  private users: User[] = [];
  private nextUserId = 1;

  constructor(private jwtService: JwtService) {}

  async generateCitizenId(): Promise<string> {
    let isUnique = false;
    let citizenId = '';
    while (!isUnique) {
      const random4 = Math.floor(1000 + Math.random() * 9000);
      citizenId = `CITIZEN-${random4}`;
      const existing = this.users.find(u => u.citizenId === citizenId);
      if (!existing) isUnique = true;
    }
    return citizenId;
  }

  async register(dto: RegisterDto) {
    const existing = this.users.find(u => u.email === dto.email);
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);
    const citizenId = await this.generateCitizenId();
    const now = new Date();

    const user: User = {
      id: this.nextUserId++,
      email: dto.email,
      passwordHash: hash,
      citizenId: citizenId,
      profileComplete: false,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);
    console.log('[AUTH] User registered:', citizenId);

    const payload = { sub: user.id, email: user.email, citizenId: user.citizenId };
    return {
      status: 'success',
      citizenId: user.citizenId,
      token: this.jwtService.sign(payload),
    };
  }

  async login(citizenId: string, password: string) {
    const user = this.users.find(u => u.citizenId === citizenId);
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
    };
  }

  async completeProfile(userId: number, docType: string, docPath: string) {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new UnauthorizedException('User not found');

    user.verificationDocType = docType;
    user.verificationDocPath = docPath || 'uploaded_doc.png';
    user.profileComplete = true;
    user.updatedAt = new Date();

    console.log('[AUTH] Profile completed for user', userId);
    return { status: 'success', message: 'Profile verified' };
  }

  async skipVerification(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new UnauthorizedException('User not found');

    console.log('[AUTH] Verification skipped for user', userId);
    return { status: 'success', message: 'Verification skipped' };
  }

  async getUserProfile(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new UnauthorizedException('User not found');

    const { passwordHash, ...result } = user;
    return result;
  }
}
