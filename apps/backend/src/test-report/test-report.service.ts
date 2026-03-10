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
  /** Jest ancestorTitles for grouping by module/suite. */
  ancestorTitles?: string[];
  /** Raw metric lines for Lighthouse (used by frontend to build child rows; not shown as description). */
  metricsText?: string;
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
  /** Frontend Lighthouse audits suite (Playwright + Lighthouse). */
  frontendLighthouse?: SuiteReport;
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

/**
 * Minimal subset of Playwright JSON reporter output we care about.
 * Shape based on built-in JSON reporter:
 * https://playwright.dev/docs/test-reporters#json-reporter
 */
interface PlaywrightJsonResult {
  status?: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration?: number;
  error?: { message?: string; stack?: string };
  errors?: { message?: string }[];
  stdout?: { text?: string }[];
}

interface PlaywrightJsonTest {
  status?: 'expected' | 'unexpected' | 'skipped';
  results?: PlaywrightJsonResult[];
}

interface PlaywrightJsonSpec {
  title: string;
  ok?: boolean;
  tests?: PlaywrightJsonTest[];
}

interface PlaywrightJsonSuite {
  title: string;
  file?: string;
  specs?: PlaywrightJsonSpec[];
}

interface PlaywrightJsonOutput {
  status?: 'passed' | 'failed' | 'timedout' | 'interrupted';
  duration?: number;
  suites?: PlaywrightJsonSuite[];
}

@Injectable()
export class TestReportService {
  /**
   * Directory where backend (Jest) writes JSON results.
   *
   * In development tests are usually run from `apps/backend` and write to
   * `apps/backend/test-results`. When the backend is started from the monorepo
   * root, `process.cwd()` points to the root, so we try multiple candidates
   * to find the real `test-results` folder.
   */
  private readonly backendTestResultsDir: string;

  /**
   * Directory where frontend (Playwright) writes JSON results.
   *
   * Frontend tests run from `apps/frontend` and write to
   * `apps/frontend/test-results`. As with backend, we try multiple candidates.
   */
  private readonly frontendTestResultsDir: string;

  constructor() {
    const backendCandidates = [
      // Monorepo root running backend via workspaces
      path.resolve(process.cwd(), 'apps/backend/test-results'),
      // Running backend directly from apps/backend
      path.resolve(process.cwd(), 'test-results'),
      // Fallback relative to compiled/TS sources
      path.resolve(__dirname, '..', '..', 'test-results'),
    ];

    const existingBackend = backendCandidates.find((dir) => fs.existsSync(dir));
    this.backendTestResultsDir = existingBackend ?? backendCandidates[0];

    // For frontend results we don't require the directory to exist yet.
    // Keep a default base path; actual files are resolved per-call.
    this.frontendTestResultsDir = path.resolve(process.cwd(), 'apps/frontend/test-results');
  }

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
          title: a.title || a.fullName || fileResult.name,
          result: isPass ? 'pass' : 'fail',
          value: isPass ? 'OK' : 'FAIL',
          duration: durationMs != null ? this.formatDuration(durationMs) : (duration ? this.formatDuration(duration) : '—'),
          description: failureMsg ? failureMsg.slice(0, 200) : (isPass ? 'Passed' : 'Failed'),
          failure: failureMsg || undefined,
          ancestorTitles: a.ancestorTitles,
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
          ancestorTitles: [],
        });
      }
    }

    const totalTime = totalMs > 0 ? this.formatDuration(totalMs) : (data.endTime && data.startTime ? this.formatDuration(data.endTime - data.startTime) : '—');
    return { rows, passed, failed, totalTime };
  }

  /** Strip ANSI escape codes from terminal-colored messages. */
  private stripAnsi(input?: string): string | undefined {
    if (!input) return input;
    return input.replace(/\u001b\[[0-9;]*m/g, '');
  }

  /**
   * Normalizes Playwright JSON reporter output into SuiteReport.
   * This is used for frontend a11y and Lighthouse runs.
   */
  private suiteFromPlaywright(data: PlaywrightJsonOutput | null, kind: 'frontendLighthouse'): SuiteReport | null {
    if (!data?.suites?.length) return null;
    const rows: TestReportRow[] = [];
    let passed = 0;
    let failed = 0;
    let totalMs = 0;

    const visitSuite = (suite: PlaywrightJsonSuite) => {
      const specs = suite.specs ?? [];
      for (const spec of specs) {
        const tests = spec.tests ?? [];
        if (!tests.length) continue;

        let specDuration = 0;
        let specFailureMsg: string | undefined;
        const metricLines: string[] = [];
        let allSkipped = true;
        let allExpected = true;

        const isMetricLine = (text: string) =>
          text.includes('performance record is') ||
          text.includes('accessibility record is') ||
          text.includes('best-practices record is') ||
          text.includes('seo record is');

        for (const t of tests) {
          const tStatus = t.status ?? 'expected';
          if (tStatus !== 'skipped') allSkipped = false;
          if (tStatus !== 'expected') allExpected = false;

          const results = t.results ?? [];
          for (const r of results) {
            const d = typeof r.duration === 'number' ? r.duration : 0;
            specDuration += d;
            if (!specFailureMsg) {
              const msgFromError = r.error?.message;
              const msgFromErrorsArray = r.errors && r.errors.length > 0 ? r.errors[0].message : undefined;
              specFailureMsg = msgFromError || msgFromErrorsArray;
            }

            if (Array.isArray(r.stdout)) {
              for (const s of r.stdout) {
                const text = this.stripAnsi(s.text)?.trim();
                if (!text) continue;
                if (isMetricLine(text)) metricLines.push(text);
              }
            }
          }
        }

        if (allSkipped) continue;
        const isPass = spec.ok ?? allExpected;
        if (isPass) passed++;
        else failed++;

        totalMs += specDuration;
        const cleanFailure = this.stripAnsi(specFailureMsg);

        // On failures, Lighthouse metrics are often in error.message (not stdout).
        if (metricLines.length === 0 && cleanFailure) {
          const lines = cleanFailure.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
          for (const line of lines) {
            if (isMetricLine(line)) metricLines.push(line);
          }
        }

        const metricsSummary = metricLines.length ? metricLines.join(' ') : undefined;
        let description: string;
        if (isPass) {
          description = 'Lighthouse thresholds met';
        } else if (cleanFailure && cleanFailure.includes('Test timeout')) {
          description = 'Lighthouse timeout exceeded';
        } else if (cleanFailure && cleanFailure.includes('threshold is not matching')) {
          description = 'Lighthouse thresholds not met';
        } else {
          description = cleanFailure ? cleanFailure.split('\n')[0] : 'Lighthouse audit failed';
        }

        rows.push({
          title: spec.title,
          result: isPass ? 'pass' : 'fail',
          value: isPass ? 'OK' : 'FAIL',
          duration: specDuration ? this.formatDuration(specDuration) : '—',
          description,
          failure: cleanFailure,
          ancestorTitles: [],
          ...(metricsSummary ? { metricsText: metricsSummary } : {}),
        });
      }
      const childSuites = (suite as any).suites as PlaywrightJsonSuite[] | undefined;
      if (Array.isArray(childSuites)) {
        for (const child of childSuites) {
          visitSuite(child);
        }
      }
    };

    for (const suite of data.suites) {
      visitSuite(suite);
    }

    const totalTime =
      typeof data.duration === 'number' && data.duration > 0
        ? this.formatDuration(data.duration)
        : totalMs > 0
          ? this.formatDuration(totalMs)
          : '—';

    return { rows, passed, failed, totalTime };
  }

  getReport(): TestReportDto {
    const dto: TestReportDto = {};
    const unitPath = path.join(this.backendTestResultsDir, 'unit-results.json');
    const e2ePath = path.join(this.backendTestResultsDir, 'integration-api-results.json');

    const unitJson = this.readJsonIfExists<JestJsonOutput>(unitPath);
    const e2eJson = this.readJsonIfExists<JestJsonOutput>(e2ePath);

    const unitSuite = this.suiteFromJest(unitJson);
    if (unitSuite) dto.backendUnit = unitSuite;

    const e2eSuite = this.suiteFromJest(e2eJson);
    if (e2eSuite) dto.backendE2e = e2eSuite;

    // Frontend: Playwright JSON reports for Lighthouse.
    // Try multiple candidate paths: dev (apps/frontend/test-results), production/build (cwd/test-results when running from dist/backend), npm package (same).
    const frontendLighthouseCandidates = [
      path.resolve(process.cwd(), 'test-results', 'frontend-lighthouse-results.json'),
      path.resolve(process.cwd(), 'apps', 'frontend', 'test-results', 'frontend-lighthouse-results.json'),
      path.resolve(process.cwd(), '..', 'frontend', 'test-results', 'frontend-lighthouse-results.json'),
      path.resolve(__dirname, '..', '..', 'test-results', 'frontend-lighthouse-results.json'),
      path.resolve(__dirname, '..', '..', 'frontend', 'test-results', 'frontend-lighthouse-results.json'),
    ];
    const frontendLighthouseJson =
      this.readJsonIfExists<PlaywrightJsonOutput>(frontendLighthouseCandidates[0]) ??
      this.readJsonIfExists<PlaywrightJsonOutput>(frontendLighthouseCandidates[1]) ??
      this.readJsonIfExists<PlaywrightJsonOutput>(frontendLighthouseCandidates[2]) ??
      this.readJsonIfExists<PlaywrightJsonOutput>(frontendLighthouseCandidates[3]) ??
      this.readJsonIfExists<PlaywrightJsonOutput>(frontendLighthouseCandidates[4]);

    const frontendLighthouseSuite = this.suiteFromPlaywright(frontendLighthouseJson, 'frontendLighthouse');
    if (frontendLighthouseSuite) dto.frontendLighthouse = frontendLighthouseSuite;

    // Also persist simplified, human-friendly reports for inspection.
    try {
      // Full combined report
      const prettyPath = path.join(this.backendTestResultsDir, 'backend-report.json');
      fs.writeFileSync(prettyPath, JSON.stringify(dto, null, 2), 'utf-8');

      // Per-level readable reports (unit & integration API)
      if (unitSuite) {
        const unitPretty = path.join(this.backendTestResultsDir, 'unit-report.json');
        fs.writeFileSync(unitPretty, JSON.stringify(unitSuite, null, 2), 'utf-8');
      }
      if (e2eSuite) {
        const e2ePretty = path.join(this.backendTestResultsDir, 'integration-api-report.json');
        fs.writeFileSync(e2ePretty, JSON.stringify(e2eSuite, null, 2), 'utf-8');
      }

      // Frontend readable report (combined) if available
      if (frontendLighthouseSuite) {
        const frontendPretty = path.join(this.frontendTestResultsDir, 'frontend-report.json');
        fs.writeFileSync(
          frontendPretty,
          JSON.stringify(
            {
              frontendLighthouse: frontendLighthouseSuite ?? null,
            },
            null,
            2,
          ),
          'utf-8',
        );
      }
    } catch {
      // Ignore write errors; the API response is still valid.
    }

    return dto;
  }
}
