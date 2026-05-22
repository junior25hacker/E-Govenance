import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async generateCitizenId(): Promise<string> {
    let isUnique = false;
    let citizenId = '';
    while (!isUnique) {
      const random4 = Math.floor(1000 + Math.random() * 9000);
      citizenId = `CITIZEN-${random4}`;
      const existing = await this.userRepository.findOne({ where: { citizenId } });
      if (!existing) isUnique = true;
    }
    return citizenId;
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
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

    await this.userRepository.save(user);

    const payload = { sub: user.id, email: user.email, citizenId: user.citizenId };
    return {
      status: 'success',
      citizenId: user.citizenId,
      token: this.jwtService.sign(payload),
    };
  }

  async login(citizenId: string, email: string) {
    const user = await this.userRepository.findOne({ where: { citizenId, email } });
    if (!user) {
      return null;
    }

    const payload = { sub: user.id, email: user.email, citizenId: user.citizenId };
    return {
      status: 'success',
      token: this.jwtService.sign(payload),
    };
  }

  async completeProfile(userId: number, docType: string, docPath: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    user.verificationDocType = docType;
    user.verificationDocPath = docPath || 'uploaded_doc.png';
    user.profileComplete = true;

    await this.userRepository.save(user);
    return { status: 'success', message: 'Profile verified' };
  }

  async skipVerification(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Profile remains incomplete
    return { status: 'success', message: 'Verification skipped' };
  }

  async getUserProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Make sure we never return the password hash
    const { passwordHash, ...result } = user;
    return result;
  }
}
