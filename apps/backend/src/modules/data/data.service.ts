import { Inject, Injectable } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { DeleteResult } from 'typeorm';
import { TestResult } from '../test-execution/entities/test-result.entity';
import { TestExecution } from '../test-execution/entities/test-execution.entity';
import { TestStep } from '../test-cases/entities/test-step.entity';
import { AIGeneration } from '../test-cases/entities/ai-generation.entity';
import { TestCase } from '../test-cases/entities/test-case.entity';
import { Bug } from '../bugs/entities/bug.entity';
import { TestSuite } from '../test-suites/entities/test-suite.entity';
import { Endpoint } from '../endpoints/endpoint.entity';
import { Project } from '../projects/project.entity';
import { AIAssistant } from '../ai/entities/ai-assistant.entity';
import { AIThread } from '../ai/entities/ai-thread.entity';
import { AISuggestion } from '../ai/entities/ai-suggestion.entity';

/**
 * Service to reset all application data (Danger Zone).
 * Deletes in dependency order to respect foreign keys.
 */
@Injectable()
export class DataService {
  constructor(
    @Inject(getRepositoryToken(TestResult)) private readonly testResultRepo: Repository<TestResult>,
    @Inject(getRepositoryToken(TestExecution)) private readonly testExecutionRepo: Repository<TestExecution>,
    @Inject(getRepositoryToken(TestStep)) private readonly testStepRepo: Repository<TestStep>,
    @Inject(getRepositoryToken(AIGeneration)) private readonly aiGenerationRepo: Repository<AIGeneration>,
    @Inject(getRepositoryToken(Bug)) private readonly bugRepo: Repository<Bug>,
    @Inject(getRepositoryToken(TestSuite)) private readonly testSuiteRepo: Repository<TestSuite>,
    @Inject(getRepositoryToken(TestCase)) private readonly testCaseRepo: Repository<TestCase>,
    @Inject(getRepositoryToken(Endpoint)) private readonly endpointRepo: Repository<Endpoint>,
    @Inject(getRepositoryToken(AIAssistant)) private readonly aiAssistantRepo: Repository<AIAssistant>,
    @Inject(getRepositoryToken(AIThread)) private readonly aiThreadRepo: Repository<AIThread>,
    @Inject(getRepositoryToken(AISuggestion)) private readonly aiSuggestionRepo: Repository<AISuggestion>,
    @Inject(getRepositoryToken(Project)) private readonly projectRepo: Repository<Project>,
  ) {}

  /**
   * Permanently deletes all data in the correct order (children first).
   */
  async resetAll(): Promise<{ deleted: Record<string, number> }> {
    const deleted: Record<string, number> = {};

    const run = async (result: Promise<DeleteResult>, name: string): Promise<void> => {
      const r = await result;
      deleted[name] = r.affected ?? 0;
    };

    await run(this.testResultRepo.createQueryBuilder().delete().from(TestResult).execute(), 'test_results');
    await run(this.testExecutionRepo.createQueryBuilder().delete().from(TestExecution).execute(), 'test_executions');
    await run(this.testStepRepo.createQueryBuilder().delete().from(TestStep).execute(), 'test_steps');
    await run(this.aiGenerationRepo.createQueryBuilder().delete().from(AIGeneration).execute(), 'ai_generations');
    await run(this.bugRepo.createQueryBuilder().delete().from(Bug).execute(), 'bugs');
    await run(this.testSuiteRepo.createQueryBuilder().delete().from(TestSuite).execute(), 'test_suites');
    await run(this.testCaseRepo.createQueryBuilder().delete().from(TestCase).execute(), 'test_cases');
    await run(this.endpointRepo.createQueryBuilder().delete().from(Endpoint).execute(), 'endpoints');
    await run(this.aiSuggestionRepo.createQueryBuilder().delete().from(AISuggestion).execute(), 'ai_suggestions');
    await run(this.aiThreadRepo.createQueryBuilder().delete().from(AIThread).execute(), 'ai_threads');
    await run(this.aiAssistantRepo.createQueryBuilder().delete().from(AIAssistant).execute(), 'ai_assistants');
    await run(this.projectRepo.createQueryBuilder().delete().from(Project).execute(), 'projects');

    return { deleted };
  }
}
