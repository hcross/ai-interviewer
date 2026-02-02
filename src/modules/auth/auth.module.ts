import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { ApiKeyEntity } from './entities/api-key.entity';
import { ApiKeyService } from './services/api-key.service';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, ApiKeyEntity])],
  providers: [ApiKeyService, AuthGuard],
  exports: [TypeOrmModule, ApiKeyService, AuthGuard],
})
export class AuthModule {}
