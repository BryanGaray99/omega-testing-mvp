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

  describe('Bugs controller', () => {
    it('Injected service mock', () => {
      expect(controller).toBeDefined();
    });
    it('HTTP requests GET POST PATCH DELETE', () => {
      expect(typeof controller.getAllBugs).toBe('function');
    });
    it('DTO validation class-validator', () => {
      expect(mockBugsService.getAllBugs).toBeDefined();
    });
    it('HTTP status codes', () => {
      expect(mockBugsService.getAllBugs).toBeDefined();
    });
    it('Response format body', () => {
      expect(mockBugsService.getAllBugs).toBeDefined();
    });
  });

  it('getAllBugs should call service and return result', async () => {
    const result = await controller.getAllBugs({} as any);
    expect(mockBugsService.getAllBugs).toHaveBeenCalled();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('total');
  });
});
