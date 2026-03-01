import { Test, TestingModule } from '@nestjs/testing';
import { SyncController } from 'src/modules/sync/controllers/sync.controller';
import { SyncService } from 'src/modules/sync/services/sync.service';

describe('SyncController', () => {
  let controller: SyncController;
  const mockSyncService = {
    syncProject: jest.fn().mockResolvedValue({ success: true, data: {} }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncController],
      providers: [
        { provide: SyncService, useValue: mockSyncService },
      ],
    }).compile();

    controller = module.get<SyncController>(SyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('syncProject should call service with projectId', async () => {
    const projectId = 'proj-123';
    await controller.syncProject(projectId);
    expect(mockSyncService.syncProject).toHaveBeenCalledWith(projectId);
  });
});
