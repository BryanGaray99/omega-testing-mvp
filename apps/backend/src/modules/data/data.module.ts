import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataService } from './data.service';
import { DataController } from './data.controller';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
    ]),
  ],
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
