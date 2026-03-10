const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  console.log(chalk.blue.bold('Building distribution package...'));

  const root = path.join(__dirname, '..');
  const distDir = path.join(root, 'dist');

  // Clean dist
  console.log(chalk.yellow('Cleaning previous dist...'));
  cleanDir(distDir);

  // Frontend build
  const frontendSrc = path.join(root, 'apps', 'frontend', 'dist', 'spa');
  const frontendDest = path.join(distDir, 'frontend');
  if (!fs.existsSync(frontendSrc)) {
    console.error(chalk.red('Frontend build not found at:'), frontendSrc);
    console.error(chalk.yellow('Run: npm run build:frontend'));
    process.exit(1);
  }
  console.log(chalk.green('Copying frontend build...'));
  copyDir(frontendSrc, frontendDest);

  // Backend build
  const backendSrc = path.join(root, 'apps', 'backend', 'dist');
  const backendDest = path.join(distDir, 'backend');
  if (!fs.existsSync(backendSrc)) {
    console.error(chalk.red('Backend build not found at:'), backendSrc);
    console.error(chalk.yellow('Run: npm run build:backend'));
    process.exit(1);
  }
  console.log(chalk.green('Copying backend build...'));
  copyDir(backendSrc, backendDest);

  // Preserve existing test results so Settings > Tests Report still shows data after build/npm pack
  const backendTestResultsSrc = path.join(root, 'apps', 'backend', 'test-results');
  const frontendTestResultsSrc = path.join(root, 'apps', 'frontend', 'test-results');
  const testResultsDest = path.join(distDir, 'backend', 'test-results');
  if (fs.existsSync(backendTestResultsSrc) || fs.existsSync(frontendTestResultsSrc)) {
    if (!fs.existsSync(testResultsDest)) {
      fs.mkdirSync(testResultsDest, { recursive: true });
    }
    const backendJson = ['unit-results.json', 'integration-api-results.json'];
    for (const name of backendJson) {
      const src = path.join(backendTestResultsSrc, name);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(testResultsDest, name));
        console.log(chalk.gray('  Copied test-results/' + name));
      }
    }
    const lighthouseSrc = path.join(frontendTestResultsSrc, 'frontend-lighthouse-results.json');
    if (fs.existsSync(lighthouseSrc)) {
      fs.copyFileSync(lighthouseSrc, path.join(testResultsDest, 'frontend-lighthouse-results.json'));
      console.log(chalk.gray('  Copied test-results/frontend-lighthouse-results.json'));
    }
  }

  console.log(chalk.green.bold('Distribution package ready.'));
  console.log('Frontend ->', frontendDest);
  console.log('Backend  ->', backendDest);
}

main().catch((err) => {
  console.error(chalk.red('Error building distribution package:'), err);
  process.exit(1);
});


