import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('current')
  getCurrent(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantsService.findById(tenantId);
  }

  @Get('members')
  getMembers(@CurrentUser('tenantId') tenantId: string) {
    return this.tenantsService.getMembers(tenantId);
  }
}
