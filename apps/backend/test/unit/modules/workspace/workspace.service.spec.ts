import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceService } from 'src/modules/workspace/workspace.service';
import * as path from 'path';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  const originalEnv = process.env.PLAYWRIGHT_WORKSPACES_PATH;

  beforeAll(() => {
    const tmp = require('os').tmpdir();
    const testWorkspaces = path.join(tmp, 'omega-test-workspaces-' + Date.now());
    process.env.PLAYWRIGHT_WORKSPACES_PATH = path.resolve(testWorkspaces);
  });

  afterAll(() => {
    process.env.PLAYWRIGHT_WORKSPACES_PATH = originalEnv;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceService],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Workspace service', () => {
    it('Injected dependencies', () => {
      expect(service).toBeDefined();
    });
    it('Methods under test', () => {
      expect(typeof service.getWorkspacePath).toBe('function');
      expect(typeof service.listWorkspaces).toBe('function');
      expect(typeof service.workspaceExists).toBe('function');
    });
    it('Edge cases', () => {
      expect(service.workspaceExists).toBeDefined();
    });
  });

  describe('getWorkspacePath', () => {
    it('should return joined path for given name', () => {
      const name = 'my-project';
      const result = service.getWorkspacePath(name);
      expect(result).toContain(name);
      expect(result).toContain('workspaces');
    });
  });

  describe('listWorkspaces', () => {
    it('should return array of directory names', async () => {
      const result = await service.listWorkspaces();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('workspaceExists', () => {
    it('should return false for non-existent workspace', async () => {
      const result = await service.workspaceExists('non-existent-' + Date.now());
      expect(result).toBe(false);
    });
  });
});
