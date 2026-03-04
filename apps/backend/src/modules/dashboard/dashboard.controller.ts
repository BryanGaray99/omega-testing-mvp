import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService, DashboardKpisDto } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({
    summary: 'Get dashboard KPIs',
    description: 'Returns aggregated execution summary, bug statistics, MTTR, MTTD, and change failure rate for the dashboard and QA KPIs',
  })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  async getKpis(): Promise<DashboardKpisDto> {
    return this.dashboardService.getKpis();
  }
}
