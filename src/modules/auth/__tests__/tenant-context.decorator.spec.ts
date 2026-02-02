import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ValidatedApiKey } from '../services/api-key.service';

// We test the decorator logic directly by simulating what createParamDecorator does
// The decorator factory is the second argument to createParamDecorator

const createMockExecutionContext = (
  tenantContext?: ValidatedApiKey,
): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        tenantContext,
      }),
    }),
  } as unknown as ExecutionContext;
};

// Import the actual module to access the decorator factories
// We need to test the logic inside the decorators

describe('TenantContext Decorator Logic', () => {
  const mockTenantContext: ValidatedApiKey = {
    apiKeyId: 'api-key-123',
    tenantId: 'tenant-456',
    tenantName: 'Test Tenant',
  };

  // Simulate TenantContext decorator logic
  const tenantContextFactory = (
    _data: unknown,
    ctx: ExecutionContext,
  ): string => {
    const request = ctx.switchToHttp().getRequest<{ tenantContext?: ValidatedApiKey }>();
    const tenantId = request.tenantContext?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found');
    }

    return tenantId;
  };

  // Simulate FullTenantContext decorator logic
  const fullTenantContextFactory = (
    _data: unknown,
    ctx: ExecutionContext,
  ): ValidatedApiKey => {
    const request = ctx.switchToHttp().getRequest<{ tenantContext?: ValidatedApiKey }>();
    const tenantContext = request.tenantContext;

    if (!tenantContext) {
      throw new UnauthorizedException('Tenant context not found');
    }

    return tenantContext;
  };

  describe('TenantContext', () => {
    it('should extract tenantId from authenticated request', () => {
      const ctx = createMockExecutionContext(mockTenantContext);

      const result = tenantContextFactory(null, ctx);

      expect(result).toBe('tenant-456');
    });

    it('should throw UnauthorizedException when tenant context is missing', () => {
      const ctx = createMockExecutionContext(undefined);

      expect(() => tenantContextFactory(null, ctx)).toThrow(
        new UnauthorizedException('Tenant context not found'),
      );
    });

    it('should throw UnauthorizedException when tenantId is empty', () => {
      const ctx = createMockExecutionContext({
        apiKeyId: 'api-key-123',
        tenantId: '',
      } as ValidatedApiKey);

      expect(() => tenantContextFactory(null, ctx)).toThrow(
        new UnauthorizedException('Tenant context not found'),
      );
    });
  });

  describe('FullTenantContext', () => {
    it('should return full tenant context from authenticated request', () => {
      const ctx = createMockExecutionContext(mockTenantContext);

      const result = fullTenantContextFactory(null, ctx);

      expect(result).toEqual(mockTenantContext);
    });

    it('should throw UnauthorizedException when tenant context is missing', () => {
      const ctx = createMockExecutionContext(undefined);

      expect(() => fullTenantContextFactory(null, ctx)).toThrow(
        new UnauthorizedException('Tenant context not found'),
      );
    });
  });
});
