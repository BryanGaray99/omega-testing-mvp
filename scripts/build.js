const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`))));
  });
}

async function main() {
  const node = process.execPath;
  const vitePath = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  const nestPath = path.join(ROOT, 'node_modules', '@nestjs', 'cli', 'bin', 'nest.js');
  const frontendDir = path.join(ROOT, 'apps', 'frontend');
  const backendDir = path.join(ROOT, 'apps', 'backend');

  console.log(chalk.blue.bold('🏗️ Building applications...'));

  const buildEnv = { ...process.env, VITE_API_URL: 'http://localhost:3000/v1/api' };
  console.log(chalk.gray('Building frontend (client)...'));
  await run(node, [vitePath, 'build'], { cwd: frontendDir, shell: false, env: buildEnv });
  console.log(chalk.gray('Building frontend (server)...'));
  await run(node, [vitePath, 'build', '--config', 'vite.config.server.ts'], { cwd: frontendDir, shell: false, env: buildEnv });

  console.log(chalk.gray('Building backend...'));
  await run(node, [nestPath, 'build'], { cwd: backendDir, shell: false });

  console.log(chalk.gray('Copying builds...'));
  await run(node, [path.join(ROOT, 'scripts', 'copy-builds.js')], { cwd: ROOT, shell: false });

  console.log(chalk.green.bold('✅ Build complete'));
}

main().catch((e) => {
  console.error(chalk.red('❌ Build failed:'), e);
  process.exit(1);
});
