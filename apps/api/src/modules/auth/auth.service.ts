import {
  Inject,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import { DATABASE, type Database } from '../../database/database.module';
import { users, refreshTokens } from '../../../drizzle/schema';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { MailService } from '../mail/mail.service';
import type {
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@golev/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private mail: MailService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.passwordService.hash(input.password);

    return this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          name: input.name,
          passwordHash,
          role: 'member',
        })
        .returning();

      const tokens = await this.tokenService.generateTokens({
        userId: user!.id,
        role: user!.role,
        mustResetPassword: user!.mustResetPassword,
      });

      const tokenHash = await argon2.hash(tokens.refreshToken);
      await tx.insert(refreshTokens).values({
        userId: user!.id,
        tokenHash,
        expiresAt: this.tokenService.refreshExpiresAt(tokens.refreshToken),
      });

      return {
        user: {
          id: user!.id,
          email: user!.email,
          name: user!.name,
          role: user!.role,
          mustResetPassword: user!.mustResetPassword,
        },
        tokens,
      };
    });
  }

  async login(input: LoginInput) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
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

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      mustResetPassword: user.mustResetPassword,
    });

    await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);

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

  /**
   * Troca de senha (e definição no 1º acesso). Exige a senha atual; ao concluir,
   * baixa a flag `mustResetPassword`, REVOGA todas as sessões (corta acesso via
   * senha antiga/temporária que possa ter vazado) e emite um par de tokens novo
   * (sem a flag) para a sessão atual seguir sem interrupção.
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const isValid = await this.passwordService.verify(
      user.passwordHash,
      input.currentPassword,
    );
    if (!isValid) throw new UnauthorizedException('Senha atual incorreta');

    const passwordHash = await this.passwordService.hash(input.newPassword);
    await this.db
      .update(users)
      .set({ passwordHash, mustResetPassword: false, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, userId));

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      mustResetPassword: false,
    });
    await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustResetPassword: false,
      },
      tokens,
    };
  }

  /**
   * "Esqueci a senha": gera um token e envia o e-mail com o link. Resposta SEMPRE
   * neutra (não revela se o e-mail existe) para não vazar quem tem conta.
   */
  async requestPasswordReset(input: ForgotPasswordInput) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });
    if (user && user.isActive && !user.deletedAt) {
      const token = await this.tokenService.createPasswordResetToken(user.id, 60);
      await this.mail.sendPasswordReset({
        to: user.email,
        name: user.name,
        token,
      });
    }
    return {
      message:
        'Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.',
    };
  }

  /**
   * Define a senha via token (link do e-mail de boas-vindas ou de reset). Baixa
   * `mustResetPassword`, revoga sessões antigas e já devolve um par de tokens
   * (auto-login) para o usuário entrar direto.
   */
  async resetPassword(input: ResetPasswordInput) {
    const userId = await this.tokenService.consumePasswordResetToken(input.token);

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) throw new UnauthorizedException('Conta não encontrada');

    const passwordHash = await this.passwordService.hash(input.newPassword);
    await this.db
      .update(users)
      .set({ passwordHash, mustResetPassword: false, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, userId));

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      role: user.role,
      mustResetPassword: false,
    });
    await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustResetPassword: false,
      },
      tokens,
    };
  }
}
