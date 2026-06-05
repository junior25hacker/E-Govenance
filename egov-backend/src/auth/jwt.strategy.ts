import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // Try to extract from cookies first
                (request: Request) => {
                    let token = null;
                    if (request && request.cookies) {
                        token = request.cookies['token'];
                    }
                    return token;
                },
                // Fallback to Bearer token in headers
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'citizennode-secure-jwt-secret-key-2026'),
        });
    }

    async validate(payload: any) {
        if (!payload || !payload.sub) {
            throw new UnauthorizedException();
        }
        return { id: payload.sub, email: payload.email, citizenId: payload.citizenId };
    }
}
