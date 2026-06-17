import { Controller, Get, UseGuards } from '@nestjs/common';
import { Permission } from '@golev/shared';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

// Métricas de negócio (conversão, funil de leads, números do mês) exigem a
// capability VIEW_DASHBOARD — hoje só do admin (ver ROLE_PERMISSIONS em @golev/shared).
@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(Permission.VIEW_DASHBOARD)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  stats() {
    return this.dashboardService.stats();
  }
}
