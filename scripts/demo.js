#!/usr/bin/env node
/**
 * Demo environment setup: creates a Playwright project, registers endpoints, and seeds mock bugs.
 * Run with: npm run demo
 * Requires: backend running at API_BASE_URL (default http://localhost:3000)
 * Cross-platform (Node 18+); no PowerShell required.
 */

const path = require('path');
const fs = require('fs');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/v1/api';
const PROJECT_READY_TIMEOUT_MS = 120000;
const PROJECT_POLL_INTERVAL_MS = 3000;

function log(msg, color = 'reset') {
  const colors = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m', reset: '\x1b[0m' };
  console.log(`${colors[color] || ''}${msg}${colors.reset}`);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  return text ? JSON.parse(text) : {};
}

function unwrap(res) {
  return res?.data !== undefined ? res.data : res;
}

async function waitForProjectReady(projectId) {
  const start = Date.now();
  while (Date.now() - start < PROJECT_READY_TIMEOUT_MS) {
    const raw = await fetchJson(`${API_BASE}/projects/${projectId}`);
    const project = unwrap(raw);
    const status = project?.status;
    if (status === 'ready') return true;
    if (status === 'failed') throw new Error('Project generation failed');
    log(`  Project status: ${status}, waiting...`, 'cyan');
    await new Promise((r) => setTimeout(r, PROJECT_POLL_INTERVAL_MS));
  }
  throw new Error('Timeout waiting for project to be ready');
}

const DEMO_PROJECT = {
  name: 'mi-proyecto-test-1',
  displayName: 'Mi Proyecto de Testing E2E',
  baseUrl: 'http://localhost:3004',
  basePath: '/v1/api',
  type: 'playwright-bdd',
};

const DEMO_ENDPOINT = {
  section: 'ecommerce',
  name: 'Product CRUD',
  entityName: 'Product',
  path: '/products',
  methods: [
    { method: 'GET' },
    {
      method: 'POST',
      requestBodyDefinition: [
        { name: 'name', type: 'string', example: 'iPhone 15 Pro', validations: { minLength: 2, required: true } },
        { name: 'description', type: 'string', example: 'Latest Apple iPhone with advanced features', validations: { required: true } },
        { name: 'price', type: 'number', example: 999.99, validations: { minimum: 0, required: true } },
        { name: 'categoryId', type: 'string', example: 'cat-1', validations: { required: true } },
        { name: 'stock', type: 'number', example: 50, validations: { minimum: 0, required: true } },
        { name: 'imageUrl', type: 'string', example: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg' },
        { name: 'isActive', type: 'boolean', example: true, validations: { default: true } },
      ],
    },
    {
      method: 'PATCH',
      requestBodyDefinition: [
        { name: 'name', type: 'string', example: 'iPhone 15 Pro Max', validations: { minLength: 2, required: false } },
        { name: 'description', type: 'string', example: 'Updated description', validations: { required: false } },
        { name: 'price', type: 'number', example: 1099.99, validations: { minimum: 0, required: false } },
        { name: 'categoryId', type: 'string', example: 'cat-1', validations: { required: false } },
        { name: 'stock', type: 'number', example: 75, validations: { minimum: 0, required: false } },
        { name: 'imageUrl', type: 'string', example: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', validations: { required: false } },
        { name: 'isActive', type: 'boolean', example: true, validations: { required: false } },
      ],
    },
    { method: 'DELETE' },
  ],
};

async function main() {
  log('\n🎬 Omega Testing – Demo environment setup\n', 'cyan');
  log(`API base: ${API_BASE}`, 'cyan');

  const bugsPath = path.join(__dirname, '..', 'resources', 'testing-mocks', 'bugs-dashboard-seed.json');
  if (!fs.existsSync(bugsPath)) {
    log(`Bugs seed file not found: ${bugsPath}`, 'red');
    process.exit(1);
  }

  let projectId;

  try {
    // 1. Create project
    log('\n1. Creating project...', 'cyan');
    const projectRes = await fetchJson(`${API_BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify(DEMO_PROJECT),
    });
    projectId = projectRes.data?.id ?? projectRes.id;
    if (!projectId) {
      throw new Error('Project response missing id. Response: ' + JSON.stringify(projectRes));
    }
    log(`   Project created: ${projectId}`, 'green');

    // 2. Wait for project to be ready (generation runs in background)
    log('\n2. Waiting for project generation (playwright-workspaces)...', 'cyan');
    await waitForProjectReady(projectId);
    log('   Project ready.', 'green');

    // 3. Register endpoint
    log('\n3. Registering endpoint (Product CRUD)...', 'cyan');
    await fetchJson(`${API_BASE}/projects/${projectId}/endpoints`, {
      method: 'POST',
      body: JSON.stringify(DEMO_ENDPOINT),
    });
    log('   Endpoint registered.', 'green');

    // 4. Seed bugs
    log('\n4. Seeding mock bugs...', 'cyan');
    const bugs = JSON.parse(fs.readFileSync(bugsPath, 'utf8'));
    let created = 0;
    let failed = 0;
    for (const bug of bugs) {
      try {
        await fetchJson(`${API_BASE}/projects/${projectId}/bugs`, {
          method: 'POST',
          body: JSON.stringify(bug),
        });
        created++;
        process.stdout.write('.');
      } catch (err) {
        failed++;
        log(`\n   Warning: ${bug.title}: ${err.message}`, 'yellow');
      }
    }
    log(`\n   Bugs created: ${created}${failed ? `, failed: ${failed}` : ''}`, 'green');

    log('\n✅ Demo environment ready.', 'green');
    log(`   Frontend: http://localhost:5173  →  open project "${DEMO_PROJECT.displayName}"`, 'cyan');
    log(`   Backend:  ${API_BASE.replace('/v1/api', '')}`, 'cyan');
    log('');
  } catch (err) {
    log(`\n❌ Demo setup failed: ${err.message}`, 'red');
    if (err.message.includes('fetch')) {
      log('   Ensure the backend is running: npm run dev:backend (or npm run dev)', 'yellow');
    }
    process.exit(1);
  }
}

main();
