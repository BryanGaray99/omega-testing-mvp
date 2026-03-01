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

  it('listAllTestCases should return array', async () => {
    const result = await controller.listAllTestCases();
    expect(mockTestCasesService.listAllTestCases).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });
});
