/**
 * E2E tests: API endpoints (smoke tests).
 * Verifies that the app boots and main routes respond without errors.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { join } from 'path';
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const basePath = '/v1/api';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.PLAYWRIGHT_WORKSPACES_PATH = join(require('os').tmpdir(), 'omega-e2e-workspaces');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('v1/api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health & Welcome', () => {
    it(`GET ${basePath}/health returns 200 and healthy status`, () => {
      return request(app.getHttpServer())
        .get(`${basePath}/health`)
        .expect(200)
        .expect((res) => {
          expect(res.body?.success).toBe(true);
          const payload = res.body?.data?.data ?? res.body?.data;
          expect(payload?.status).toBe('healthy');
        });
    });

    it(`GET ${basePath}/ returns 200 and welcome message`, () => {
      return request(app.getHttpServer())
        .get(basePath)
        .expect(200)
        .expect((res) => {
          expect(res.body?.success).toBe(true);
          const payload = res.body?.data?.data ?? res.body?.data;
          expect(payload?.message).toBeDefined();
          expect(payload?.documentation).toBe('/docs');
        });
    });
  });

  describe('Projects module', () => {
    it(`GET ${basePath}/projects returns 200 (list)`, () => {
      return request(app.getHttpServer())
        .get(`${basePath}/projects`)
        .expect(200);
    });
  });

  describe('Endpoints module', () => {
    it(`GET ${basePath}/endpoints returns 200 (list)`, () => {
      return request(app.getHttpServer())
        .get(`${basePath}/endpoints`)
        .expect(200);
    });
  });

  describe('Test cases module', () => {
    it(`GET ${basePath}/test-cases returns 200 (list)`, () => {
      return request(app.getHttpServer())
        .get(`${basePath}/test-cases`)
        .expect(200);
    });
  });

  describe('Test execution module', () => {
    it(`GET ${basePath}/test-execution returns 200 or 404 (global)`, async () => {
      const res = await request(app.getHttpServer()).get(`${basePath}/test-execution`);
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Bugs module', () => {
    it(`GET ${basePath}/bugs returns 200 (list)`, () => {
      return request(app.getHttpServer())
        .get(`${basePath}/bugs`)
        .expect(200);
    });
  });

  describe('AI module', () => {
    it(`GET ${basePath}/ai returns 200 or 404`, async () => {
      const res = await request(app.getHttpServer()).get(`${basePath}/ai`);
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Sync module', () => {
    it(`GET ${basePath}/sync returns 200 or 404`, async () => {
      const res = await request(app.getHttpServer()).get(`${basePath}/sync`);
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Data module', () => {
    it(`POST ${basePath}/data/reset without valid body returns 422`, () => {
      return request(app.getHttpServer())
        .post(`${basePath}/data/reset`)
        .send({})
        .expect(422);
    });

    it(`POST ${basePath}/data/reset with invalid confirmation returns 422`, () => {
      return request(app.getHttpServer())
        .post(`${basePath}/data/reset`)
        .send({ confirmation: 'wrong' })
        .expect(422);
    });
  });
});
