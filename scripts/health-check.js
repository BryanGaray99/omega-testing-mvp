const http = require('http');
const chalk = require('chalk');

function check(url, name) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(chalk.green(`✅ ${name} OK (${res.statusCode})`));
        resolve();
      } else {
        console.log(chalk.red(`❌ ${name} ERROR (${res.statusCode})`));
        reject();
      }
    });
    req.on('error', () => {
      console.log(chalk.red(`❌ ${name} not available`));
      reject();
    });
    req.setTimeout(3000, () => {
      req.destroy();
      console.log(chalk.red(`❌ ${name} timeout`));
      reject();
    });
  });
}

async function main() {
  console.log(chalk.blue('🏥 Health check'));
  try { await check('http://localhost:5173', 'Frontend'); } catch {}
  try { await check('http://localhost:3000/v1/api/health', 'Backend'); } catch {}
}

main();


