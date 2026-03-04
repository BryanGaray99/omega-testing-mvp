import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, In } from 'typeorm';
import { Bug } from '../bugs/entities/bug.entity';
import { TestExecution } from '../test-execution/entities/test-execution.entity';
import { TestCase } from '../test-cases/entities/test-case.entity';
import { BugsService } from '../bugs/services/bugs.service';
import { TestExecutionService } from '../test-execution/services/test-execution.service';
import { ExecutionStatus } from '../test-execution/entities/test-execution.entity';

export interface DashboardKpisDto {
  counts: {
    projects: number;
    endpoints: number;
    testCases: number;
  };
  execution: {
    totalExecutions: number;
    totalScenarios: number;
    totalPassed: number;
    totalFailed: number;
    successRate: number;
    averageExecutionTime: number;
    totalCompleted: number;
    totalFailedExecutions: number;
    changeFailureRate: number | null;
    statusDistribution: Record<string, number>;
    lastExecution: string | null;
  };
  bugs: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  };
  mttrHours: number | null;
  mttdHours: number | null;
  /** Bugs per day (YYYY-MM-DD -> count) for last 365 days, for heatmap */
  bugsHeatmap: Record<string, number>;
}

/**
 * Aggregates dashboard metrics and QA KPIs from executions and bugs.
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Bug)
    private readonly bugRepository: Repository<Bug>,
    @InjectRepository(TestExecution)
    private readonly executionRepository: Repository<TestExecution>,
    @InjectRepository(TestCase)
    private readonly testCaseRepository: Repository<TestCase>,
    private readonly bugsService: BugsService,
    private readonly testExecutionService: TestExecutionService,
  ) {}

  async getKpis(): Promise<DashboardKpisDto> {
    const [execSummary, bugStats, counts, bugsHeatmap] = await Promise.all([
      this.testExecutionService.getGlobalExecutionSummary(),
      this.bugsService.getAllBugStatistics(),
      this.getCounts(),
      this.getBugsHeatmap(),
    ]);

    const totalCompleted = execSummary.statusDistribution?.[ExecutionStatus.COMPLETED] ?? 0;
    const totalFailedExecutions = execSummary.statusDistribution?.[ExecutionStatus.FAILED] ?? 0;
    const finished = totalCompleted + totalFailedExecutions;
    const changeFailureRate =
      finished > 0 ? (totalFailedExecutions / finished) * 100 : null;

    const { mttrHours, mttdHours } = await this.computeMttrMttd();

    return {
      counts,
      execution: {
        ...execSummary,
        totalCompleted,
        totalFailedExecutions,
        changeFailureRate,
        lastExecution: execSummary.lastExecution
          ? new Date(execSummary.lastExecution).toISOString()
          : null,
      },
      bugs: bugStats,
      mttrHours,
      mttdHours,
      bugsHeatmap,
    };
  }

  private async getCounts(): Promise<{ projects: number; endpoints: number; testCases: number }> {
    try {
      const [projectsCount, endpointsCount, testCasesCount] = await Promise.all([
        this.executionRepository.manager.query('SELECT COUNT(*) as c FROM projects').then((r: any) => Number(r[0]?.c ?? 0)),
        this.executionRepository.manager.query('SELECT COUNT(*) as c FROM endpoints').then((r: any) => Number(r[0]?.c ?? 0)),
        this.testCaseRepository.count(),
      ]);
      return { projects: projectsCount, endpoints: endpointsCount, testCases: testCasesCount };
    } catch {
      return { projects: 0, endpoints: 0, testCases: 0 };
    }
  }

  private async getBugsHeatmap(): Promise<Record<string, number>> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - 365);
      const bugs = await this.bugRepository
        .createQueryBuilder('b')
        .select("date(COALESCE(b.executionDate, b.createdAt))", "day")
        .addSelect("COUNT(*)", "count")
        .where("COALESCE(b.executionDate, b.createdAt) >= :since", { since: since.toISOString() })
        .groupBy("date(COALESCE(b.executionDate, b.createdAt))")
        .getRawMany();
      const map: Record<string, number> = {};
      for (const row of bugs) {
        const day = row.day?.slice(0, 10) ?? '';
        if (day) map[day] = Number(row.count) || 0;
      }
      return map;
    } catch {
      return {};
    }
  }

  private async computeMttrMttd(): Promise<{
    mttrHours: number | null;
    mttdHours: number | null;
  }> {
    try {
      const resolvedBugs = await this.bugRepository.find({
        where: { resolvedAt: Not(IsNull()) },
        select: ['reportedAt', 'resolvedAt'],
      });
      const mttrMs =
        resolvedBugs.length > 0
          ? resolvedBugs.reduce((sum, b) => {
              const reported = b.reportedAt ? new Date(b.reportedAt).getTime() : 0;
              const resolved = b.resolvedAt ? new Date(b.resolvedAt).getTime() : 0;
              return sum + (resolved - reported);
            }, 0) / resolvedBugs.length
          : null;
      const mttrHours = mttrMs != null ? mttrMs / (1000 * 60 * 60) : null;

      const bugsWithExecution = await this.bugRepository.find({
        where: { executionId: Not(IsNull()) },
        select: ['reportedAt', 'executionId'],
      });
      if (bugsWithExecution.length === 0) {
        return { mttrHours: mttrHours ?? null, mttdHours: null };
      }
      const executionIds = [...new Set(bugsWithExecution.map((b) => b.executionId).filter(Boolean))] as string[];
      const executions = await this.executionRepository.find({
        where: { executionId: In(executionIds) },
        select: ['executionId', 'startedAt'],
      });
      const startedByExecutionId = new Map(executions.map((e) => [e.executionId, e.startedAt]));
      let mttdSum = 0;
      let mttdCount = 0;
      for (const b of bugsWithExecution) {
        const started = b.executionId ? startedByExecutionId.get(b.executionId) : null;
        if (started && b.reportedAt) {
          mttdSum += new Date(b.reportedAt).getTime() - new Date(started).getTime();
          mttdCount++;
        }
      }
      const mttdHours = mttdCount > 0 ? mttdSum / mttdCount / (1000 * 60 * 60) : null;
      return { mttrHours: mttrHours ?? null, mttdHours };
    } catch (err) {
      this.logger.warn('Could not compute MTTR/MTTD', err);
      return { mttrHours: null, mttdHours: null };
    }
  }
}
