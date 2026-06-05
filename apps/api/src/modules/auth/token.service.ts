import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq, and, isNull, gt } from 'drizzle-orm';
import * as argon2 from 'argon2';
import { DATABASE, type Database } from '../../database/database.module';
import { refreshTokens, users } from '../../../drizzle/schema';

interface JwtPayload {
  userId: string;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRY') ?? '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * DB expiry is read straight from the refresh token's own `exp` claim. The JWT
   * layer already parsed and applied JWT_REFRESH_EXPIRY when signing, so the DB
   * row can never diverge from the token — single source of truth. Avoids the
   * brittle hand-rolled duration parser that 500'd login on formats jsonwebtoken
   * accepts but a naive regex did not (e.g. "7 days", "1w", or stray whitespace).
   */
  refreshExpiresAt(refreshToken: string): Date {
    const decoded = this.jwtService.decode<{ exp?: number } | null>(
      refreshToken,
    );
    if (!decoded?.exp) {
      throw new Error('Refresh token is missing an exp claim');
    }
    return new Date(decoded.exp * 1000);
  }

  async saveRefreshToken(userId: string, token: string) {
    const tokenHash = await argon2.hash(token);
    await this.db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt: this.refreshExpiresAt(token),
    });
  }

  async rotateRefreshToken(token: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedTokens = await this.db.query.refreshTokens.findMany({
      where: and(
        eq(refreshTokens.userId, payload.userId),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    });

    let validToken = false;
    for (const stored of storedTokens) {
      if (await argon2.verify(stored.tokenHash, token)) {
        await this.db
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(eq(refreshTokens.id, stored.id));
        validToken = true;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Refresh token not found or revoked');
    }

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateTokens({
      userId: user.id,
      role: user.role,
    });

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }
}
