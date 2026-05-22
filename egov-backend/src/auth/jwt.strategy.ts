import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtSecret } from './auth.module';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
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
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: any) {
        if (!payload || !payload.sub) {
            throw new UnauthorizedException();
        }
        return { id: payload.sub, email: payload.email, citizenId: payload.citizenId };
    }
}
