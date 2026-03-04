/**
 * Runs the main test groups sequentially, always executing all of them,
 * and exits with a non-zero code if any group fails.
 *
 * Groups:
 * 1) Backend unit tests        (apps/backend: test)
 * 2) Backend e2e tests         (apps/backend: test:e2e)
 * 3) Frontend Lighthouse tests (apps/frontend: test:lighthouse)
 */
const { spawnSync } = require('child_process');

const groups = [
  { name: 'Backend unit tests', cmd: 'npm', args: ['run', 'test', '-w', 'apps/backend'] },
  { name: 'Backend e2e tests', cmd: 'npm', args: ['run', 'test:e2e', '-w', 'apps/backend'] },
  { name: 'Frontend Lighthouse', cmd: 'npm', args: ['run', 'test:lighthouse', '-w', 'apps/frontend'] },
];

let finalCode = 0;

for (const group of groups) {
  // eslint-disable-next-line no-console
  console.log(`\n=== ${group.name} ===\n`);
  const result = spawnSync(group.cmd, group.args, {
    stdio: 'inherit',
    shell: true,
  });
  if (typeof result.status === 'number' && result.status !== 0) {
    finalCode = result.status;
  }
}

process.exit(finalCode);

