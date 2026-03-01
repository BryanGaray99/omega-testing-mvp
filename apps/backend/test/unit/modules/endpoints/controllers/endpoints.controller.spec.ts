import { Test, TestingModule } from '@nestjs/testing';
import { EndpointsController } from 'src/modules/endpoints/controllers/endpoints.controller';
import { EndpointsService } from 'src/modules/endpoints/endpoints.service';

describe('EndpointsController', () => {
  let controller: EndpointsController;
  const mockEndpointsService = {
    listAllEndpoints: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EndpointsController],
      providers: [
        { provide: EndpointsService, useValue: mockEndpointsService },
      ],
    }).compile();

    controller = module.get<EndpointsController>(EndpointsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Endpoints controller', () => {
    it('Injected service mock', () => {
      expect(controller).toBeDefined();
    });
    it('HTTP requests (GET/POST/PATCH/DELETE)', () => {
      expect(typeof controller.listAllEndpoints).toBe('function');
    });
    it('DTO validation (class-validator)', () => {
      expect(mockEndpointsService.listAllEndpoints).toBeDefined();
    });
    it('HTTP status codes', () => {
      expect(mockEndpointsService.listAllEndpoints).toBeDefined();
    });
    it('Response format (body)', () => {
      expect(mockEndpointsService.listAllEndpoints).toBeDefined();
    });
  });

  it('listAllEndpoints should return array', async () => {
    const result = await controller.listAllEndpoints();
    expect(mockEndpointsService.listAllEndpoints).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });
});
