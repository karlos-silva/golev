import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq, and, isNull, gt } from 'drizzle-orm';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { DATABASE, type Database } from '../../database/database.module';
import {
  refreshTokens,
  users,
  passwordResetTokens,
} from '../../../drizzle/schema';

interface JwtPayload {
  userId: string;
  role: string;
  /** Conta com senha temporária — bloqueia o app até definir uma nova senha. */
  mustResetPassword?: boolean;
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

  /* ── Tokens de definição/redefinição de senha (e-mail) ─────────────────── */

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Cria um token de senha (uso único, com TTL). Retorna o valor em claro p/ o link. */
  async createPasswordResetToken(
    userId: string,
    ttlMinutes: number,
  ): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await this.db.insert(passwordResetTokens).values({
      userId,
      tokenHash: this.hashResetToken(token),
      expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
    });
    return token;
  }

  /** Valida e consome (marca usado) um token de senha. Retorna o userId dono. */
  async consumePasswordResetToken(token: string): Promise<string> {
    const tokenHash = this.hashResetToken(token);
    const row = await this.db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.tokenHash, tokenHash),
    });
    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Link inválido ou expirado');
    }
    await this.db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, row.id));
    return row.userId;
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
      mustResetPassword: user.mustResetPassword,
    });

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustResetPassword: user.mustResetPassword,
      },
      tokens,
    };
  }
}
