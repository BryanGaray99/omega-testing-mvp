import { Test, TestingModule } from '@nestjs/testing';
import { AIGeneralController } from 'src/modules/ai/controllers/ai-general.controller';
import { ConfigService } from '@nestjs/config';
import { OpenAIConfigService } from 'src/modules/ai/services/openai-config.service';

describe('AIGeneralController', () => {
  let controller: AIGeneralController;
  const mockOpenAIConfigService = {
    getOpenAIKey: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIGeneralController],
      providers: [
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: OpenAIConfigService, useValue: mockOpenAIConfigService },
      ],
    }).compile();

    controller = module.get<AIGeneralController>(AIGeneralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
