import { Test, TestingModule } from '@nestjs/testing';
import { BugsGeneralController } from 'src/modules/bugs/controllers/bugs-general.controller';
import { BugsService } from 'src/modules/bugs/services/bugs.service';

describe('BugsGeneralController', () => {
  let controller: BugsGeneralController;
  const mockBugsService = {
    getAllBugs: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BugsGeneralController],
      providers: [
        { provide: BugsService, useValue: mockBugsService },
      ],
    }).compile();

    controller = module.get<BugsGeneralController>(BugsGeneralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllBugs should call service and return result', async () => {
    const result = await controller.getAllBugs({} as any);
    expect(mockBugsService.getAllBugs).toHaveBeenCalled();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total');
  });
});
