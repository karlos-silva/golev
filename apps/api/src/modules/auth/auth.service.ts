import {
  Inject,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import { DATABASE, type Database } from '../../database/database.module';
import {
  users,
  refreshTokens,
  tenants,
  tenantMemberships,
} from '../../../drizzle/schema';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import type { LoginInput, RegisterInput } from '@trianox/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private passwordService: PasswordService,
    private tokenService: TokenService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.passwordService.hash(input.password);
    const slug = input.tenantName.toLowerCase().replace(/\s+/g, '-');

    return this.db.transaction(async (tx) => {
      const [tenant] = await tx
        .insert(tenants)
        .values({ name: input.tenantName, slug })
        .returning();

      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          name: input.name,
          passwordHash,
        })
        .returning();

      await tx.insert(tenantMemberships).values({
        tenantId: tenant!.id,
        userId: user!.id,
        role: 'owner',
      });

      const tokens = await this.tokenService.generateTokens({
        userId: user!.id,
        tenantId: tenant!.id,
        role: 'owner',
      });

      const tokenHash = await argon2.hash(tokens.refreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await tx.insert(refreshTokens).values({
        userId: user!.id,
        tokenHash,
        expiresAt,
      });

      return {
        user: {
          id: user!.id,
          email: user!.email,
          name: user!.name,
          tenantId: tenant!.id,
          role: 'owner',
        },
        tokens,
      };
    });
  }

  async login(input: LoginInput) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
      with: { memberships: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.passwordService.verify(
      user.passwordHash,
      input.password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const membership = user.memberships[0];
    if (!membership) {
      throw new UnauthorizedException('No tenant membership found');
    }

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      tenantId: membership.tenantId,
      role: membership.role,
    });

    await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: membership.tenantId,
        role: membership.role,
      },
      tokens,
    };
  }

  async refresh(refreshToken: string) {
    return this.tokenService.rotateRefreshToken(refreshToken);
  }

  async logout(userId: string) {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, userId));

    return { message: 'Logged out' };
  }
}
