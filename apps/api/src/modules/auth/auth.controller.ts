import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema, refreshTokenSchema } from '@trianox/shared';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: unknown) {
    const data = registerSchema.parse(body);
    return this.authService.register(data);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown) {
    const data = loginSchema.parse(body);
    return this.authService.login(data);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: unknown) {
    const data = refreshTokenSchema.parse(body);
    return this.authService.refresh(data.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('userId') userId: string) {
    return this.authService.logout(userId);
  }
}
