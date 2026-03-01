import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from 'src/modules/projects/projects.controller';
import { ProjectsService } from 'src/modules/projects/projects.service';
import { CreateProjectDto } from 'src/modules/projects/dto/create-project.dto';
import { Project } from 'src/modules/projects/project.entity';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  const mockProjectsService = {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockProjectsService },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of projects', async () => {
      const result = await controller.findAll();
      expect(mockProjectsService.findAll).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('create', () => {
    it('should call service.create with dto', async () => {
      const dto: CreateProjectDto = {
        name: 'test-project',
        baseUrl: 'http://localhost:3000',
      };
      const project = { id: '1', name: dto.name } as Project;
      mockProjectsService.create.mockResolvedValue(project);
      await controller.create(dto);
      expect(mockProjectsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('remove', () => {
    it('should return success message with id', async () => {
      const id = 'project-123';
      const result = await controller.remove(id);
      expect(mockProjectsService.remove).toHaveBeenCalledWith(id);
      expect(result.success).toBe(true);
      expect(result.message).toContain(id);
    });
  });
});
