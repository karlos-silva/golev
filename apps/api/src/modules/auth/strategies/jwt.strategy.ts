import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ACCESS_COOKIE } from '../cookies';

interface JwtPayload {
  userId: string;
  role: string;
  mustResetPassword?: boolean;
}

/** Extrai o access token do cookie httpOnly (web) ou do header Bearer (API). */
function extractJwt(req: { cookies?: Record<string, string | undefined> }): string | null {
  return req?.cookies?.[ACCESS_COOKIE] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwt,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.userId,
      role: payload.role,
      mustResetPassword: payload.mustResetPassword ?? false,
    };
  }
}
