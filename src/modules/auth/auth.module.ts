import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { ApiKeyEntity } from './entities/api-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, ApiKeyEntity])],
  exports: [TypeOrmModule],
})
export class AuthModule {}
