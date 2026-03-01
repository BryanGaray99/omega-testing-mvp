import { Test, TestingModule } from '@nestjs/testing';
import { TestSuitesController } from 'src/modules/test-suites/controllers/test-suites.controller';
import { TestSuitesService } from 'src/modules/test-suites/services/test-suites.service';

describe('TestSuitesController', () => {
  let controller: TestSuitesController;
  const mockTestSuitesService = {
    getTestSuites: jest.fn().mockResolvedValue([]),
    createTestSuite: jest.fn().mockResolvedValue({ id: '1', name: 'Suite' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestSuitesController],
      providers: [
        { provide: TestSuitesService, useValue: mockTestSuitesService },
      ],
    }).compile();

    controller = module.get<TestSuitesController>(TestSuitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getTestSuites should return array', async () => {
    const result = await controller.getTestSuites('project-1', {} as any);
    expect(mockTestSuitesService.getTestSuites).toHaveBeenCalledWith('project-1', expect.anything());
    expect(Array.isArray(result)).toBe(true);
  });
});
