import { Test, TestingModule } from '@nestjs/testing';
import { DataController } from 'src/modules/data/data.controller';
import { DataService } from 'src/modules/data/data.service';

describe('DataController', () => {
  let controller: DataController;
  const mockDataService = {
    resetAll: jest.fn().mockResolvedValue({
      deleted: { test_results: 0, test_executions: 0, projects: 0 },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
      providers: [
        { provide: DataService, useValue: mockDataService },
      ],
    }).compile();

    controller = module.get<DataController>(DataController);
  });

  afterEach(() => {
    mockDataService.resetAll.mockClear();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('resetAll', () => {
    it('should call dataService.resetAll and return success response', async () => {
      const result = await controller.resetAll({ confirmation: 'RESET ALL DATA' });
      expect(mockDataService.resetAll).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.message).toContain('permanently deleted');
    });
  });
});
