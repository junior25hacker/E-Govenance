import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { User } from './entities/user.entity';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [
        PassportModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET', 'citizennode-secure-jwt-secret-key-2026'),
                signOptions: { expiresIn: configService.get('JWT_EXPIRY', '1d') as any },
            }),
            inject: [ConfigService],
        }),
        SettingsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule { }
