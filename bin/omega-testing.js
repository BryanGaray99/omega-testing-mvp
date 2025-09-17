#!/usr/bin/env node

const { program } = require('commander');
const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');

const CLI_ROOT = path.dirname(__dirname);
const FRONTEND_DIST = path.join(CLI_ROOT, 'dist', 'frontend');
const BACKEND_DIST = path.join(CLI_ROOT, 'dist', 'backend');

function checkBuilds() {
  const frontendExists = fs.existsSync(path.join(FRONTEND_DIST, 'index.html'));
  const backendExists = fs.existsSync(path.join(BACKEND_DIST, 'main.js'));

  if (!frontendExists || !backendExists) {
    console.error(chalk.red('Error: build files not found.'));
    console.error(chalk.yellow(`Frontend exists: ${frontendExists}`));
    console.error(chalk.yellow(`Backend exists: ${backendExists}`));
    console.error(chalk.blue('Run: npm run build:dist'));
    process.exit(1);
  }
}

function run(command, args, options = {}) {
  const p = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
  p.on('error', (e) => console.error(chalk.red(`Error: ${e.message}`)));
  return p;
}

function openBrowser(url) {
  try {
    if (process.platform === 'win32') {
      run('cmd', ['/c', 'start', '', url]);
    } else if (process.platform === 'darwin') {
      run('open', [url]);
    } else {
      run('xdg-open', [url]);
    }
  } catch (_) {
    // ignore
  }
}


function startDevelopment() {
  console.log(chalk.red('Development mode not available in CLI distribution.'));
  console.log(chalk.blue('For development, run: npm run dev'));
  process.exit(1);
}

function startSplit(options) {
  console.log(chalk.blue.bold('Starting Omega Testing (split mode)'));

  const backendPort = options.port || '3000';
  const frontendPort = options.frontendPort || '5173';
  // Default to a folder in the user's current working directory (visible to the user)
  const defaultWorkspace = path.resolve(process.cwd(), 'playwright-workspaces');
  const workspacePath = options.workspacePath
    ? path.resolve(process.cwd(), options.workspacePath)
    : defaultWorkspace;

  // Serve static frontend via bundled script to avoid Windows -e quoting issues
  const staticServer = run(process.execPath, [path.join(CLI_ROOT, 'bin', 'static-frontend.js')], {
    cwd: CLI_ROOT,
    env: {
      ...process.env,
      FRONTEND_DIST,
      PORT: String(frontendPort),
    },
  });

  const backendProcess = run('node', ['main.js'], {
    cwd: BACKEND_DIST,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: backendPort,
      PLAYWRIGHT_WORKSPACES_PATH: workspacePath,
    },
  });

  console.log(chalk.green(`Frontend: http://localhost:${frontendPort}`));
  console.log(chalk.green(`Backend : http://localhost:${backendPort}`));
  console.log(chalk.green(`Swagger : http://localhost:${backendPort}/docs`));

  if (options.open !== false) {
    setTimeout(() => openBrowser(`http://localhost:${frontendPort}`), 1200);
  }

  const cleanup = () => {
    console.log(chalk.gray('Shutting down...'));
    try { staticServer.kill(); } catch {}
    try { backendProcess.kill(); } catch {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

program
  .name('omega-testing')
  .description('Complete testing suite with React frontend and NestJS backend')
  .version('1.0.0');

program
  .command('start-local')
  .description('Start in split mode with default ports (frontend 5173, backend 3000)')
  .option('--no-open', 'Do not open the browser automatically')
  .action((options) => {
    checkBuilds();
    startSplit({ frontendPort: 5173, port: 3000, open: options.open });
  });

// Removed monolithic start command until fully validated

program
  .command('dev')
  .description('Start in development mode (not available in CLI)')
  .action(() => {
    startDevelopment();
  });

program
  .command('split')
  .description('Start frontend (static) and backend separately: 5173 + 3000')
  .option('-p, --port <port>', 'Backend port', '3000')
  .option('-f, --frontend-port <port>', 'Frontend port', '5173')
  .option('--workspace-path <path>', 'Playwright workspaces path')
  .option('--no-open', 'Do not open the browser automatically')
  .action((options) => {
    checkBuilds();
    startSplit(options);
  });

program
  .command('info')
  .description('Show installation info')
  .action(() => {
    console.log(chalk.blue.bold('Omega Testing CLI Info'));
    console.log('CLI Root:', CLI_ROOT);
    console.log('Frontend Build:', FRONTEND_DIST);
    console.log('Backend Build:', BACKEND_DIST);

    const frontendExists = fs.existsSync(path.join(FRONTEND_DIST, 'index.html'));
    const backendExists = fs.existsSync(path.join(BACKEND_DIST, 'main.js'));

    console.log('Frontend Ready:', frontendExists ? 'yes' : 'no');
    console.log('Backend Ready:', backendExists ? 'yes' : 'no');

    if (frontendExists && backendExists) {
      console.log('\nRun: npx omega-testing start');
    } else {
      console.log('\nBuild files missing. Run: npm run build:dist');
    }
  });

program.parse();


