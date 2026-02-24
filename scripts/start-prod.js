const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const FRONTEND_DIST = path.join(ROOT, 'dist', 'frontend');
const BACKEND_DIST = path.join(ROOT, 'dist', 'backend');

function runDetached(command, args, options = {}) {
  const p = spawn(command, args, { stdio: 'inherit', shell: false, ...options });
  p.on('error', (e) => console.error(chalk.red(`Error: ${e.message}`)));
  return p;
}

function openBrowser(url) {
  try {
    if (process.platform === 'win32') {
      runDetached('cmd', ['/c', 'start', '', url]);
    } else if (process.platform === 'darwin') {
      runDetached('open', [url]);
    } else {
      runDetached('xdg-open', [url]);
    }
  } catch (_) {
    // ignore
  }
}

async function main() {
  if (!fs.existsSync(path.join(FRONTEND_DIST, 'index.html'))) {
    console.error(chalk.red('❌ Frontend build not found at dist/frontend'));
    console.error(chalk.yellow('   Run: npm run build'));
    process.exit(1);
  }
  if (!fs.existsSync(path.join(BACKEND_DIST, 'main.js'))) {
    console.error(chalk.red('❌ Backend build not found at dist/backend'));
    console.error(chalk.yellow('   Run: npm run build'));
    process.exit(1);
  }

  const frontendPort = '5173';
  const backendPort = '3000';
  // playwright-workspaces al mismo nivel que omega-testing-mvp (hermano, no dentro)
  const defaultWorkspace = path.resolve(ROOT, '..', 'playwright-workspaces');
  if (!fs.existsSync(defaultWorkspace)) {
    fs.mkdirSync(defaultWorkspace, { recursive: true });
    console.log(chalk.gray(`Created playwright-workspaces: ${defaultWorkspace}`));
  }

  console.log(chalk.blue.bold('🚀 Starting Omega Testing (split mode)...'));

  const staticServer = runDetached(process.execPath, [path.join(ROOT, 'bin', 'static-frontend.js')], {
    cwd: ROOT,
    env: { ...process.env, FRONTEND_DIST, PORT: frontendPort },
  });

  const backendProcess = runDetached(process.execPath, ['main.js'], {
    cwd: BACKEND_DIST,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: backendPort,
      PLAYWRIGHT_WORKSPACES_PATH: defaultWorkspace,
    },
  });

  console.log(chalk.green(`Frontend: http://localhost:${frontendPort}`));
  console.log(chalk.green(`Backend : http://localhost:${backendPort}`));
  console.log(chalk.green(`Swagger : http://localhost:${backendPort}/docs`));

  setTimeout(() => openBrowser(`http://localhost:${frontendPort}`), 1200);

  const cleanup = () => {
    console.log(chalk.gray('\n🛑 Shutting down...'));
    try { staticServer.kill(); } catch {}
    try { backendProcess.kill(); } catch {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((e) => {
  console.error(chalk.red('❌ Error in start-prod:'), e);
  process.exit(1);
});


