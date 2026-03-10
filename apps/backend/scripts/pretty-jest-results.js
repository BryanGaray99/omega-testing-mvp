const fs = require('fs');
const path = require('path');

/**
 * Pretty-print Jest JSON result files so they are human-readable.
 *
 * This script rewrites:
 * - test-results/unit-results.json
 * - test-results/integration-api-results.json
 *
 * keeping exactly the same data, only changing indentation.
 */
const FILES = [
  'test-results/unit-results.json',
  'test-results/integration-api-results.json',
];

for (const rel of FILES) {
  const filePath = path.resolve(process.cwd(), rel);
  if (!fs.existsSync(filePath)) continue;

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
    // eslint-disable-next-line no-console
    console.log(`Pretty-printed ${rel}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to pretty-print ${rel}:`, err && err.message ? err.message : err);
  }
}

