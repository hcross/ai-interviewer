import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for marking endpoints as public (no auth required).
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark an endpoint as public.
 *
 * Public endpoints skip API key validation.
 *
 * @example
 * @Public()
 * @Get('health')
 * async healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
