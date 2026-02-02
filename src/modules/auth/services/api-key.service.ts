import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ApiKeyEntity } from '../entities/api-key.entity';
import { LoggerService } from '../../../common/services/logger.service';

export interface ValidatedApiKey {
  apiKeyId: string;
  tenantId: string;
  tenantName?: string;
}

@Injectable()
export class ApiKeyService {
  private static readonly BCRYPT_COST = 12;
  private static readonly KEY_PREFIX_LENGTH = 8;

  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepository: Repository<ApiKeyEntity>,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Validates an API key and returns the associated tenant information.
   *
   * @param rawApiKey - The raw API key from the Authorization header
   * @returns ValidatedApiKey if valid, null if invalid or inactive
   */
  async validateApiKey(rawApiKey: string): Promise<ValidatedApiKey | null> {
    if (!rawApiKey || typeof rawApiKey !== 'string') {
      return null;
    }

    // Extract prefix for lookup (first 8 characters)
    const keyPrefix = rawApiKey.substring(0, ApiKeyService.KEY_PREFIX_LENGTH);

    // Find API key by prefix
    const apiKey = await this.apiKeyRepository.findOne({
      where: {
        keyPrefix,
        isActive: true,
      },
      relations: ['tenant'],
    });

    if (!apiKey) {
      this.logger.logWithMeta('debug', 'API key not found or inactive', { keyPrefix });
      return null;
    }

    // Verify tenant is active
    if (!apiKey.tenant?.isActive) {
      this.logger.logWithMeta('warn', 'API key tenant is inactive', {
        apiKeyId: apiKey.id,
        tenantId: apiKey.tenantId,
      });
      return null;
    }

    // Verify the full key against the hash
    const isValid = await bcrypt.compare(rawApiKey, apiKey.keyHash);

    if (!isValid) {
      this.logger.logWithMeta('debug', 'API key hash mismatch', { keyPrefix });
      return null;
    }

    // Update last used timestamp (fire and forget)
    this.updateLastUsed(apiKey.id).catch((error: Error) => {
      this.logger.logWithMeta('error', 'Failed to update API key last used timestamp', {
        apiKeyId: apiKey.id,
        error: error.message,
      });
    });

    return {
      apiKeyId: apiKey.id,
      tenantId: apiKey.tenantId,
      tenantName: apiKey.tenant?.name,
    };
  }

  /**
   * Updates the lastUsedAt timestamp for an API key.
   */
  private async updateLastUsed(apiKeyId: string): Promise<void> {
    await this.apiKeyRepository.update(apiKeyId, {
      lastUsedAt: new Date(),
    });
  }

  /**
   * Generates a new API key for a tenant.
   *
   * @param tenantId - The tenant ID
   * @param name - A friendly name for the API key
   * @returns The raw API key (only returned once, must be stored by client)
   */
  async generateApiKey(
    tenantId: string,
    name: string,
  ): Promise<{ rawKey: string; apiKeyId: string }> {
    // Generate key: sk_[tenantId-first-8]_[random-32-bytes-base64]
    const tenantPrefix = tenantId.replace(/-/g, '').substring(0, 8);
    const randomPart = crypto.randomBytes(32).toString('base64url');
    const rawKey = `sk_${tenantPrefix}_${randomPart}`;

    // Hash the key for storage
    const keyHash = await bcrypt.hash(rawKey, ApiKeyService.BCRYPT_COST);

    // Store with prefix for lookup
    const apiKey = this.apiKeyRepository.create({
      tenantId,
      name,
      keyHash,
      keyPrefix: rawKey.substring(0, ApiKeyService.KEY_PREFIX_LENGTH),
      isActive: true,
    });

    const saved = await this.apiKeyRepository.save(apiKey);

    this.logger.logWithMeta('info', 'API key generated', {
      apiKeyId: saved.id,
      tenantId,
      name,
    });

    return {
      rawKey,
      apiKeyId: saved.id,
    };
  }

  /**
   * Revokes an API key.
   */
  async revokeApiKey(apiKeyId: string, tenantId: string): Promise<boolean> {
    const result = await this.apiKeyRepository.update(
      { id: apiKeyId, tenantId },
      { isActive: false },
    );

    if (result.affected && result.affected > 0) {
      this.logger.logWithMeta('info', 'API key revoked', { apiKeyId, tenantId });
      return true;
    }

    return false;
  }
}
