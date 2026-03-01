/**
 * Reads Jest JSON output files and returns a normalized report for the Settings > Tests Report UI.
 * Rows are: title, result, value, duration, description (real executed test data).
 */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export type TestReportRow = {
  title: string;
  result: 'pass' | 'fail';
  value: string;
  duration: string;
  description: string;
  failure?: string;
};

export type SuiteReport = {
  rows: TestReportRow[];
  passed: number;
  failed: number;
  totalTime: string;
};

export type TestReportDto = {
  backendUnit?: SuiteReport;
  backendE2e?: SuiteReport;
};

interface JestAssertionResult {
  ancestorTitles?: string[];
  title: string;
  fullName?: string;
  status: string;
  failureMessages?: string[];
  duration?: number;
}

interface JestTestResult {
  name: string;
  status: string;
  startTime: number;
  endTime: number;
  duration?: number;
  assertionResults?: JestAssertionResult[];
}

interface JestJsonOutput {
  testResults?: JestTestResult[];
  numPassedTests?: number;
  numFailedTests?: number;
  startTime?: number;
  endTime?: number;
}

@Injectable()
export class TestReportService {
  private readonly testResultsDir = path.join(__dirname, '..', '..', 'test-results');

  private readJsonIfExists<T>(filePath: string): T | null {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as T;
      }
    } catch {
      // ignore
    }
    return null;
  }

  private formatDuration(ms: number): string {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
  }

  private suiteFromJest(data: JestJsonOutput | null): SuiteReport | null {
    if (!data?.testResults?.length) return null;
    const rows: TestReportRow[] = [];
    let passed = 0;
    let failed = 0;
    let totalMs = 0;

    for (const fileResult of data.testResults) {
      const duration = fileResult.duration ?? (fileResult.endTime != null && fileResult.startTime != null ? fileResult.endTime - fileResult.startTime : 0);
      totalMs += duration;
      const assertions = fileResult.assertionResults ?? [];
      for (const a of assertions) {
        const isPass = a.status === 'passed';
        if (isPass) passed++;
        else failed++;
        const durationMs = typeof a.duration === 'number' ? a.duration : undefined;
        const failureMsg = !isPass && a.failureMessages?.length ? a.failureMessages[0] : undefined;
        rows.push({
          title: a.fullName || a.title || fileResult.name,
          result: isPass ? 'pass' : 'fail',
          value: isPass ? 'OK' : 'FAIL',
          duration: durationMs != null ? this.formatDuration(durationMs) : (duration ? this.formatDuration(duration) : '—'),
          description: failureMsg ? failureMsg.slice(0, 200) : (isPass ? 'Passed' : 'Failed'),
          failure: failureMsg || undefined,
        });
      }
      // If no assertionResults, one row per file
      if (assertions.length === 0) {
        const isPass = fileResult.status === 'passed';
        if (isPass) passed++;
        else failed++;
        const shortName = path.basename(fileResult.name, path.extname(fileResult.name));
        rows.push({
          title: shortName,
          result: isPass ? 'pass' : 'fail',
          value: isPass ? 'OK' : 'FAIL',
          duration: duration ? this.formatDuration(duration) : '—',
          description: fileResult.status === 'passed' ? 'Passed' : 'Failed',
          failure: undefined,
        });
      }
    }

    const totalTime = totalMs > 0 ? this.formatDuration(totalMs) : (data.endTime && data.startTime ? this.formatDuration(data.endTime - data.startTime) : '—');
    return { rows, passed, failed, totalTime };
  }

  getReport(): TestReportDto {
    const dto: TestReportDto = {};
    const unitPath = path.join(this.testResultsDir, 'unit-results.json');
    const e2ePath = path.join(this.testResultsDir, 'e2e-results.json');

    const unitJson = this.readJsonIfExists<JestJsonOutput>(unitPath);
    const e2eJson = this.readJsonIfExists<JestJsonOutput>(e2ePath);

    const unitSuite = this.suiteFromJest(unitJson);
    if (unitSuite) dto.backendUnit = unitSuite;

    const e2eSuite = this.suiteFromJest(e2eJson);
    if (e2eSuite) dto.backendE2e = e2eSuite;

    return dto;
  }
}
