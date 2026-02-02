import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ApiKeyService, ValidatedApiKey } from '../services/api-key.service';
import { LoggerService } from '../../../common/services/logger.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Extended Request interface with tenant context.
 */
export interface AuthenticatedRequest extends Request {
  tenantContext: ValidatedApiKey;
}

/**
 * AuthGuard validates API keys from the Authorization header.
 *
 * Expects: Authorization: Bearer sk_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxx
 *
 * On success, attaches tenant context to request.tenantContext
 * On failure, throws UnauthorizedException with appropriate message
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly logger: LoggerService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      this.logger.logWithMeta('debug', 'No API key provided in request', {
        path: request.path,
        method: request.method,
      });
      throw new UnauthorizedException('API key is required');
    }

    const validatedKey = await this.apiKeyService.validateApiKey(apiKey);

    if (!validatedKey) {
      this.logger.logWithMeta('warn', 'Invalid API key attempt', {
        path: request.path,
        method: request.method,
        keyPrefix: apiKey.substring(0, 8),
      });
      throw new UnauthorizedException('Invalid API key');
    }

    // Attach tenant context to request for downstream use
    (request as AuthenticatedRequest).tenantContext = validatedKey;

    this.logger.logWithMeta('debug', 'Request authenticated', {
      tenantId: validatedKey.tenantId,
      apiKeyId: validatedKey.apiKeyId,
      path: request.path,
    });

    return true;
  }

  /**
   * Extracts the API key from the Authorization header.
   *
   * Supports: Bearer <token>
   */
  private extractApiKey(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    // Support "Bearer <token>" format
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Also support raw token (for backwards compatibility)
    return authHeader;
  }
}
