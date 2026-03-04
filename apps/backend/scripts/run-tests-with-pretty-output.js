/**
 * Runs Jest, then always pretty-prints the JSON result files (even when tests fail),
 * and exits with Jest's exit code so npm run test still fails on test failure.
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isUnit = process.argv[2] !== 'e2e';
const testResultsDir = path.resolve(process.cwd(), 'test-results');

// Ensure test-results exists
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

const jestArgs = isUnit
  ? ['--json', '--outputFile=test-results/unit-results.json']
  : ['--config', './test/jest-e2e.json', '--json', '--outputFile=test-results/e2e-results.json'];

const jestResult = spawnSync('npx', ['jest', ...jestArgs], {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true,
});

// Always pretty-print result files (Jest writes them even when some tests fail)
const prettyScript = path.join(process.cwd(), 'scripts', 'pretty-jest-results.js');
require(prettyScript);

process.exit(jestResult.status ?? 1);