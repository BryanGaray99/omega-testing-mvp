const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`))));
  });
}

async function main() {
  const cwd = path.join(__dirname, '..');
  console.log(chalk.blue.bold('🏗️ Building applications...'));

  await run('npm', ['run', 'build', '-w', 'apps/frontend'], { cwd });
  console.log(chalk.green('✅ Frontend built'));

  await run('npm', ['run', 'build', '-w', 'apps/backend'], { cwd });
  console.log(chalk.green('✅ Backend built'));

  console.log(chalk.blue.bold('🚀 Starting backend (serves API on 3000)...'));
  await run('npm', ['run', 'start:prod', '-w', 'apps/backend'], {
    cwd,
    env: { ...process.env, NODE_ENV: 'production', PORT: '3000' },
  });
}

main().catch((e) => {
  console.error(chalk.red('❌ Error in start-prod:'), e);
  process.exit(1);
});


