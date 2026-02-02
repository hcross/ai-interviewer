import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiKeyService } from '../services/api-key.service';
import { ApiKeyEntity } from '../entities/api-key.entity';
import { LoggerService } from '../../../common/services/logger.service';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let repository: jest.Mocked<Repository<ApiKeyEntity>>;
  let logger: { logWithMeta: jest.Mock };

  const mockApiKey: Partial<ApiKeyEntity> = {
    id: 'api-key-123',
    tenantId: 'tenant-123',
    keyHash: '', // Will be set in beforeEach
    keyPrefix: 'sk_12345',
    isActive: true,
    tenant: {
      id: 'tenant-123',
      name: 'Test Tenant',
      isActive: true,
      settings: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      apiKeys: [],
    },
  };

  const rawApiKey = 'sk_12345678_abcdefghijklmnopqrstuvwxyz123456';

  beforeEach(async () => {
    // Hash the raw key for comparison
    mockApiKey.keyHash = await bcrypt.hash(rawApiKey, 12);

    const mockRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockLogger = {
      logWithMeta: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: getRepositoryToken(ApiKeyEntity),
          useValue: mockRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    repository = module.get(getRepositoryToken(ApiKeyEntity));
    logger = module.get(LoggerService);
  });

  describe('validateApiKey', () => {
    it('should return validated key for valid API key', async () => {
      repository.findOne.mockResolvedValue(mockApiKey as ApiKeyEntity);
      repository.update.mockResolvedValue({ affected: 1 } as never);

      const result = await service.validateApiKey(rawApiKey);

      expect(result).toEqual({
        apiKeyId: 'api-key-123',
        tenantId: 'tenant-123',
        tenantName: 'Test Tenant',
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          keyPrefix: 'sk_12345',
          isActive: true,
        },
        relations: ['tenant'],
      });
    });

    it('should return null for non-existent API key', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.validateApiKey('sk_invalid_key');

      expect(result).toBeNull();
      expect(logger.logWithMeta).toHaveBeenCalledWith(
        'debug',
        'API key not found or inactive',
        expect.any(Object),
      );
    });

    it('should return null for inactive tenant', async () => {
      const inactiveApiKey = {
        ...mockApiKey,
        tenant: { ...mockApiKey.tenant, isActive: false },
      };
      repository.findOne.mockResolvedValue(inactiveApiKey as ApiKeyEntity);

      const result = await service.validateApiKey(rawApiKey);

      expect(result).toBeNull();
      expect(logger.logWithMeta).toHaveBeenCalledWith(
        'warn',
        'API key tenant is inactive',
        expect.any(Object),
      );
    });

    it('should return null for invalid hash', async () => {
      const wrongHashApiKey = {
        ...mockApiKey,
        keyHash: await bcrypt.hash('different_key', 12),
      };
      repository.findOne.mockResolvedValue(wrongHashApiKey as ApiKeyEntity);

      const result = await service.validateApiKey(rawApiKey);

      expect(result).toBeNull();
      expect(logger.logWithMeta).toHaveBeenCalledWith(
        'debug',
        'API key hash mismatch',
        expect.any(Object),
      );
    });

    it('should return null for empty API key', async () => {
      const result = await service.validateApiKey('');

      expect(result).toBeNull();
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should return null for null API key', async () => {
      const result = await service.validateApiKey(null as unknown as string);

      expect(result).toBeNull();
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('should update lastUsedAt on successful validation', async () => {
      repository.findOne.mockResolvedValue(mockApiKey as ApiKeyEntity);
      repository.update.mockResolvedValue({ affected: 1 } as never);

      await service.validateApiKey(rawApiKey);

      // Wait for the fire-and-forget update
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(repository.update).toHaveBeenCalledWith('api-key-123', {
        lastUsedAt: expect.any(Date),
      });
    });
  });

  describe('generateApiKey', () => {
    it('should generate and store a new API key', async () => {
      const tenantId = 'tenant-uuid-1234-5678';
      const name = 'Test Key';

      repository.create.mockImplementation(
        (entity) => entity as unknown as ApiKeyEntity,
      );
      repository.save.mockResolvedValue({
        id: 'new-api-key-id',
        tenantId,
        name,
        keyHash: 'hashed',
        keyPrefix: 'sk_tenan',
        isActive: true,
        lastUsedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        tenant: {} as never,
      });

      const result = await service.generateApiKey(tenantId, name);

      expect(result.rawKey).toMatch(/^sk_[a-z0-9]+_[A-Za-z0-9_-]+$/);
      expect(result.apiKeyId).toBe('new-api-key-id');
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(logger.logWithMeta).toHaveBeenCalledWith(
        'info',
        'API key generated',
        expect.any(Object),
      );
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke an API key successfully', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as never);

      const result = await service.revokeApiKey('api-key-123', 'tenant-123');

      expect(result).toBe(true);
      expect(repository.update).toHaveBeenCalledWith(
        { id: 'api-key-123', tenantId: 'tenant-123' },
        { isActive: false },
      );
      expect(logger.logWithMeta).toHaveBeenCalledWith(
        'info',
        'API key revoked',
        expect.any(Object),
      );
    });

    it('should return false if API key not found', async () => {
      repository.update.mockResolvedValue({ affected: 0 } as never);

      const result = await service.revokeApiKey('nonexistent', 'tenant-123');

      expect(result).toBe(false);
    });
  });
});
