import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataService } from './data.service';
import { ResetDataDto } from './dto/reset-data.dto';

@ApiTags('data')
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('reset')
  @ApiOperation({
    summary: 'Reset all data (Danger Zone)',
    description: 'Permanently deletes all projects, endpoints, test cases, test suites, bugs, executions, and AI data. Requires confirmation text "RESET ALL DATA".',
  })
  @ApiResponse({ status: 200, description: 'All data has been deleted' })
  @ApiResponse({ status: 400, description: 'Invalid confirmation' })
  async resetAll(@Body() dto: ResetDataDto) {
    const result = await this.dataService.resetAll();
    return {
      success: true,
      data: result,
      message: 'All data has been permanently deleted.',
    };
  }
}
