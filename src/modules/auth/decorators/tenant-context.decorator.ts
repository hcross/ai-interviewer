import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../guards/auth.guard';

/**
 * Parameter decorator to extract the tenant ID from the authenticated request.
 *
 * This decorator must be used in routes protected by AuthGuard.
 * It extracts the tenantId from the request.tenantContext set by the AuthGuard.
 *
 * @throws UnauthorizedException if tenant context is not found (unauthenticated request)
 *
 * @example
 * @Get('mandates')
 * @UseGuards(AuthGuard)
 * async getMandates(@TenantContext() tenantId: string) {
 *   return this.mandateService.findByTenant(tenantId);
 * }
 */
export const TenantContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const tenantId = request.tenantContext?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found');
    }

    return tenantId;
  },
);

/**
 * Full tenant context including apiKeyId and tenantName.
 *
 * Use this when you need more than just the tenantId.
 *
 * @example
 * @Get('profile')
 * @UseGuards(AuthGuard)
 * async getProfile(@FullTenantContext() context: ValidatedApiKey) {
 *   console.log(`Request from tenant: ${context.tenantName}`);
 *   return this.profileService.get(context.tenantId);
 * }
 */
export const FullTenantContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const tenantContext = request.tenantContext;

    if (!tenantContext) {
      throw new UnauthorizedException('Tenant context not found');
    }

    return tenantContext;
  },
);
