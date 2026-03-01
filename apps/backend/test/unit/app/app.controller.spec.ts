import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { TestReportService } from 'src/test-report/test-report.service';

describe('AppController', () => {
  let controller: AppController;
  const mockTestReportService = {
    getReport: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: TestReportService, useValue: mockTestReportService },
      ],
    }).compile();

    controller = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return success and healthy status', () => {
      const result = controller.getHealth();
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('healthy');
      expect(result.data?.timestamp).toBeDefined();
      expect(result.data?.uptime).toBeDefined();
      expect(result.data?.services?.database).toBe('connected');
      expect(result.message).toBe('Service is healthy');
    });
  });

  describe('getHello', () => {
    it('should return welcome message and documentation', () => {
      const result = controller.getHello();
      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('Central Backend MVP');
      expect(result.data?.documentation).toBe('/docs');
      expect(result.data?.endpoints).toBeDefined();
    });
  });
});
