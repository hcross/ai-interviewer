import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard, AuthenticatedRequest } from '../guards/auth.guard';
import { ApiKeyService, ValidatedApiKey } from '../services/api-key.service';
import { LoggerService } from '../../../common/services/logger.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let apiKeyService: jest.Mocked<ApiKeyService>;
  let reflector: jest.Mocked<Reflector>;
  let logger: { logWithMeta: jest.Mock };

  const mockValidatedKey: ValidatedApiKey = {
    apiKeyId: 'api-key-123',
    tenantId: 'tenant-123',
    tenantName: 'Test Tenant',
  };

  const createMockExecutionContext = (
    headers: Record<string, string> = {},
    path = '/api/test',
    method = 'GET',
  ): ExecutionContext => {
    const request = {
      headers,
      path,
      method,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const mockApiKeyService = {
      validateApiKey: jest.fn(),
    };

    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const mockLogger = {
      logWithMeta: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: ApiKeyService,
          useValue: mockApiKeyService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    apiKeyService = module.get(ApiKeyService);
    reflector = module.get(Reflector);
    logger = module.get(LoggerService);
  });

  describe('canActivate', () => {
    it('should allow access for valid Bearer token', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      apiKeyService.validateApiKey.mockResolvedValue(mockValidatedKey);

      const context = createMockExecutionContext({
        authorization: 'Bearer sk_12345678_validkey',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(apiKeyService.validateApiKey).toHaveBeenCalledWith(
        'sk_12345678_validkey',
      );
    });

    it('should attach tenant context to request', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      apiKeyService.validateApiKey.mockResolvedValue(mockValidatedKey);

      const context = createMockExecutionContext({
        authorization: 'Bearer sk_12345678_validkey',
      });

      await guard.canActivate(context);

      const request = context
        .switchToHttp()
        .getRequest() as AuthenticatedRequest;
      expect(request.tenantContext).toEqual(mockValidatedKey);
    });

    it('should allow access for public endpoints', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const context = createMockExecutionContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(apiKeyService.validateApiKey).not.toHaveBeenCalled();
    });

    it('should check public decorator on handler and class', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      apiKeyService.validateApiKey.mockResolvedValue(mockValidatedKey);

      const context = createMockExecutionContext({
        authorization: 'Bearer sk_12345678_validkey',
      });

      await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        expect.anything(),
        expect.anything(),
      ]);
    });

    it('should throw UnauthorizedException for missing API key', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('API key is required'),
      );
      expect(logger.logWithMeta).toHaveBeenCalledWith(
        'debug',
        'No API key provided in request',
        expect.any(Object),
      );
    });

    it('should throw UnauthorizedException for invalid API key', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      apiKeyService.validateApiKey.mockResolvedValue(null);

      const context = createMockExecutionContext({
        authorization: 'Bearer sk_invalid_key',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Invalid API key'),
      );
      expect(logger.logWithMeta).toHaveBeenCalledWith(
        'warn',
        'Invalid API key attempt',
        expect.any(Object),
      );
    });

    it('should support raw token without Bearer prefix', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      apiKeyService.validateApiKey.mockResolvedValue(mockValidatedKey);

      const context = createMockExecutionContext({
        authorization: 'sk_12345678_validkey',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(apiKeyService.validateApiKey).toHaveBeenCalledWith(
        'sk_12345678_validkey',
      );
    });

    it('should log successful authentication', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      apiKeyService.validateApiKey.mockResolvedValue(mockValidatedKey);

      const context = createMockExecutionContext({
        authorization: 'Bearer sk_12345678_validkey',
      });

      await guard.canActivate(context);

      expect(logger.logWithMeta).toHaveBeenCalledWith(
        'debug',
        'Request authenticated',
        {
          tenantId: 'tenant-123',
          apiKeyId: 'api-key-123',
          path: '/api/test',
        },
      );
    });
  });
});
