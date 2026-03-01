import { TestFilterUtils } from 'src/modules/test-execution/utils/test-filter.utils';
import { ExecuteTestsDto, TestType } from 'src/modules/test-execution/dto/execute-tests.dto';

describe('TestFilterUtils', () => {
  describe('buildCucumberFilter', () => {
    it('should return empty string when dto has no filters', () => {
      const dto = new ExecuteTestsDto();
      expect(TestFilterUtils.buildCucumberFilter(dto)).toBe('');
    });

    it('should include entity require path when entityName is set', () => {
      const dto = new ExecuteTestsDto();
      dto.entityName = 'Product';
      const filter = TestFilterUtils.buildCucumberFilter(dto);
      expect(filter).toContain('ecommerce/product.feature');
    });

    it('should include tags when tags array is set', () => {
      const dto = new ExecuteTestsDto();
      dto.tags = ['@smoke', '@create'];
      const filter = TestFilterUtils.buildCucumberFilter(dto);
      expect(filter).toContain('@smoke');
      expect(filter).toContain('@create');
    });

    it('should include specific scenario name when set', () => {
      const dto = new ExecuteTestsDto();
      dto.specificScenario = 'Create Product';
      const filter = TestFilterUtils.buildCucumberFilter(dto);
      expect(filter).toContain('Create Product');
    });

    it('should include positive test type tag when testType is positive', () => {
      const dto = new ExecuteTestsDto();
      dto.testType = TestType.POSITIVE;
      const filter = TestFilterUtils.buildCucumberFilter(dto);
      expect(filter).toContain('@positive');
    });

    it('should include method tag when method is set', () => {
      const dto = new ExecuteTestsDto();
      dto.method = 'POST';
      const filter = TestFilterUtils.buildCucumberFilter(dto);
      expect(filter).toContain('@post');
    });
  });

  describe('validateScenarioAgainstFilters', () => {
    it('should return true when no filters are set', () => {
      const scenario = { name: 'Any', tags: [], feature: {} };
      expect(TestFilterUtils.validateScenarioAgainstFilters(scenario, { entityName: '' })).toBe(true);
    });

    it('should return false when entityName does not match feature name', () => {
      const scenario = { name: 'S1', tags: [], feature: { name: 'Cart' } };
      expect(
        TestFilterUtils.validateScenarioAgainstFilters(scenario, { entityName: 'Product' }),
      ).toBe(false);
    });

    it('should return true when entityName matches feature name', () => {
      const scenario = { name: 'S1', tags: [], feature: { name: 'Product flow' } };
      expect(
        TestFilterUtils.validateScenarioAgainstFilters(scenario, { entityName: 'product' }),
      ).toBe(true);
    });

    it('should return false when method tag is required but missing', () => {
      const scenario = { name: 'S1', tags: [{ name: '@get' }], feature: {} };
      expect(
        TestFilterUtils.validateScenarioAgainstFilters(scenario, { entityName: '', method: 'POST' }),
      ).toBe(false);
    });

    it('should return true when scenario name matches specificScenario', () => {
      const scenario = { name: 'Create Product', tags: [], feature: {} };
      expect(
        TestFilterUtils.validateScenarioAgainstFilters(scenario, {
          entityName: '',
          specificScenario: 'Create Product',
        }),
      ).toBe(true);
    });
  });

  describe('getAvailableScenarios', () => {
    it('should return empty array when feature file does not exist', async () => {
      const scenarios = await TestFilterUtils.getAvailableScenarios(
        __dirname + '/nonexistent',
        'Product',
      );
      expect(scenarios).toEqual([]);
    });
  });
});
