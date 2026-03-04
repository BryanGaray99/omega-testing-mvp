import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bug } from '../bugs/entities/bug.entity';
import { TestExecution } from '../test-execution/entities/test-execution.entity';
import { TestCase } from '../test-cases/entities/test-case.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { BugsModule } from '../bugs/bugs.module';
import { TestExecutionModule } from '../test-execution/test-execution.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bug, TestExecution, TestCase]),
    BugsModule,
    TestExecutionModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
