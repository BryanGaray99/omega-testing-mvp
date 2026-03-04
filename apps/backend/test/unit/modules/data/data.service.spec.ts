import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataService } from 'src/modules/data/data.service';
import { TestResult } from 'src/modules/test-execution/entities/test-result.entity';
import { TestExecution } from 'src/modules/test-execution/entities/test-execution.entity';
import { TestStep } from 'src/modules/test-cases/entities/test-step.entity';
import { AIGeneration } from 'src/modules/test-cases/entities/ai-generation.entity';
import { TestCase } from 'src/modules/test-cases/entities/test-case.entity';
import { Bug } from 'src/modules/bugs/entities/bug.entity';
import { TestSuite } from 'src/modules/test-suites/entities/test-suite.entity';
import { Endpoint } from 'src/modules/endpoints/endpoint.entity';
import { Project } from 'src/modules/projects/project.entity';
import { AIAssistant } from 'src/modules/ai/entities/ai-assistant.entity';
import { AIThread } from 'src/modules/ai/entities/ai-thread.entity';
import { AISuggestion } from 'src/modules/ai/entities/ai-suggestion.entity';

const mockDeleteResult = { affected: 2 };
const mockQueryBuilder = {
  delete: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue(mockDeleteResult),
};
const mockRepo = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const entities = [
  TestResult,
  TestExecution,
  TestStep,
  AIGeneration,
  Bug,
  TestSuite,
  TestCase,
  Endpoint,
  AIAssistant,
  AIThread,
  AISuggestion,
  Project,
];

describe('DataService', () => {
  let service: DataService;

  beforeEach(async () => {
    mockQueryBuilder.execute.mockResolvedValue(mockDeleteResult);
    const providers = entities.map((entity) => ({
      provide: getRepositoryToken(entity),
      useValue: mockRepo,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [DataService, ...providers],
    }).compile();

    service = module.get<DataService>(DataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resetAll', () => {
    it('should delete all entities and return counts', async () => {
      const result = await service.resetAll();
      expect(result.deleted).toBeDefined();
      expect(result.deleted.test_results).toBe(mockDeleteResult.affected);
      expect(result.deleted.projects).toBeDefined();
    });
  });
});
