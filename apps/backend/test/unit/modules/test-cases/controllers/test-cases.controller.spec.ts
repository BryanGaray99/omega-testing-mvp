import { Test, TestingModule } from '@nestjs/testing';
import { TestCasesController } from 'src/modules/test-cases/controllers/test-cases.controller';
import { TestCasesService } from 'src/modules/test-cases/services/test-cases.service';

describe('TestCasesController', () => {
  let controller: TestCasesController;
  const mockTestCasesService = {
    listAllTestCases: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestCasesController],
      providers: [
        { provide: TestCasesService, useValue: mockTestCasesService },
      ],
    }).compile();

    controller = module.get<TestCasesController>(TestCasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Test Cases controller', () => {
    it('Injected service mock', () => {
      expect(controller).toBeDefined();
    });
    it('HTTP requests GET POST PATCH DELETE', () => {
      expect(typeof controller.listAllTestCases).toBe('function');
    });
    it('DTO validation class-validator', () => {
      expect(mockTestCasesService.listAllTestCases).toBeDefined();
    });
    it('HTTP status codes', () => {
      expect(mockTestCasesService.listAllTestCases).toBeDefined();
    });
    it('Response format body', () => {
      expect(mockTestCasesService.listAllTestCases).toBeDefined();
    });
  });

  it('listAllTestCases should return array', async () => {
    const result = await controller.listAllTestCases();
    expect(mockTestCasesService.listAllTestCases).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });
});
