const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');
const readline = require('readline');

function startAndPrefix(label, color, command, args, options = {}) {
  const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: true, ...options });

  const log = (stream, isErr = false) => {
    const rl = readline.createInterface({ input: stream });
    rl.on('line', (line) => {
      const prefix = color(`[${label}]`);
      if (isErr) {
        console.error(prefix, line);
      } else {
        console.log(prefix, line);
      }
    });
    rl.on('close', () => {/* no-op */});
  };

  log(child.stdout, false);
  log(child.stderr, true);

  child.on('error', (e) => {
    console.error(color(`[${label}]`), chalk.red(`❌ ${e.message}`));
  });

  return child;
}

async function main() {
  console.log(chalk.blue.bold('🚀 Starting Omega Testing (parallel dev processes)'));

  // Start both immediately, show unified logs with prefixes
  const frontend = startAndPrefix(
    'frontend',
    chalk.cyan,
    'npm',
    ['run', 'dev', '-w', 'apps/frontend'],
    {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, VITE_API_URL: 'http://localhost:3000/v1/api' },
    }
  );

  const backend = startAndPrefix(
    'backend',
    chalk.magenta,
    'npm',
    ['run', 'start:dev', '-w', 'apps/backend'],
    {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: '3000', NODE_ENV: 'development' },
    }
  );

  const cleanup = () => {
    console.log(chalk.gray('\n🛑 Shutting down...'));
    try { backend.kill(); } catch {}
    try { frontend.kill(); } catch {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((e) => {
  console.error(chalk.red('❌ Error starting monorepo:'), e);
  process.exit(1);
});


