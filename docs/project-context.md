# Project Context: ai-interviewer

**Language:** TypeScript (strict mode)
**Framework:** NestJS 10.x
**Database:** PostgreSQL 15.x with Row-Level Security
**Async Jobs:** Bull with Redis
**LLM Integration:** liteLLM unified proxy

This document captures language-specific patterns, framework conventions, and implementation guidelines to ensure consistent, high-quality code across the entire project. **All AI agents must read this before implementing any code.**

---

## 1. TypeScript Configuration

### Strict Mode Requirements

```typescript
// tsconfig.json must have:
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Typing Standards

- **REQUIRED**: Every function parameter and return type must be explicitly typed
- **NO** `any` types anywhere in production code - use `unknown` if needed, then narrow
- **NO** implicit return types - always specify `void`, `Promise<T>`, etc.
- **INTERFACES** over types for class contracts: `interface IUserService` not `type IUserService`
- **ENUMS** for string/number constants that form a closed set
- **DISCRIMINATED UNIONS** for complex return types:

```typescript
// ✅ Good
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

// ❌ Bad
type Result = { success?: boolean; data?: any; error?: string };
```

### Null Handling

- **NEVER** use non-null assertions (`!`) in production code except in specific test utilities
- **ALWAYS** validate and handle `null`/`undefined` explicitly:

```typescript
// ✅ Good
const user = await this.userRepository.findOne(id);
if (!user) {
  throw new NotFoundException('User not found');
}

// ❌ Bad
const user = await this.userRepository.findOne(id)!;
```

---

## 2. NestJS Module Organization

### Module Structure Pattern

Each feature module must follow this exact structure:

```
src/modules/{feature}/
├── {feature}.module.ts          # Module definition (exports nothing from the module itself)
├── {feature}.controller.ts      # HTTP endpoints only
├── {feature}.service.ts         # Business logic, main service
├── dto/
│   ├── create-{feature}.dto.ts
│   ├── update-{feature}.dto.ts
│   └── {feature}-response.dto.ts
├── entities/
│   └── {feature}.entity.ts      # TypeORM entity
├── repositories/
│   └── {feature}.repository.ts  # Custom repository with business queries
├── guards/
│   └── {feature}-ownership.guard.ts
├── decorators/
│   └── {feature}-specific.decorator.ts
├── strategies/ (auth modules only)
│   └── jwt.strategy.ts
├── __tests__/
│   ├── {feature}.controller.spec.ts
│   ├── {feature}.service.spec.ts
│   ├── {feature}.repository.spec.ts
│   └── fixtures/
│       └── {feature}.fixtures.ts
└── README.md                    # Module purpose and usage
```

### Module Definition Rules

```typescript
// ✅ Good - clear dependencies, explicit exports
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}

// ❌ Bad - circular dependencies, unclear structure
@Module({
  imports: [UserModule],  // Creates circular dependency
  providers: [SomeService],
})
export class SomeModule {}
```

### Service Patterns

**NEVER** inject controllers into services. Controllers call services, not vice versa.

```typescript
// ✅ Good - service has repository, controller calls service
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
}

export class UserController {
  constructor(private readonly userService: UserService) {}
}

// ❌ Bad - service knows about controller
export class UserService {
  constructor(private readonly userController: UserController) {}
}
```

---

## 3. TypeORM Entity & Repository Patterns

### Entity Definition

```typescript
// ✅ Good - clear schema, proper relationships
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index()  // For commonly queried columns
  @Column({ type: 'varchar', length: 50 })
  status: 'active' | 'inactive';

  @ManyToOne(() => TenantEntity, tenant => tenant.users)
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  // NO inline data manipulation - keep entities lean
}
```

### Repository Pattern with Custom Queries

```typescript
// ✅ Good - business logic queries in repository
@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly ormRepository: Repository<UserEntity>,
  ) {
    super(ormRepository.target, ormRepository.manager);
  }

  async findActiveByTenant(tenantId: string): Promise<UserEntity[]> {
    return this.find({
      where: {
        tenantId,
        status: 'active',
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmailWithTenant(
    email: string,
    tenantId: string,
  ): Promise<UserEntity | null> {
    return this.findOne({
      where: { email, tenantId },
      relations: ['tenant'],
    });
  }
}

// ❌ Bad - query logic in service
export class UserService {
  async findActive(tenantId: string) {
    return this.userRepository.find({
      where: { tenantId, status: 'active' },
    });
  }
}
```

### Multi-Tenancy with Row-Level Security

**CRITICAL**: Every query must be tenant-aware. Use the `TenantContext` decorator.

```typescript
// ✅ Good - RLS policy enforced + runtime tenant check
@Entity('users')
export class UserEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  // Other columns...
}

// In repository:
async findByEmail(
  email: string,
  tenantId: string,  // Always pass tenant explicitly
): Promise<UserEntity | null> {
  return this.findOne({
    where: { email, tenantId },  // Always filter by tenant
  });
}

// In controller:
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@TenantContext() tenantId: string) {
  return this.userService.findById(userId, tenantId);  // Pass tenant
}

// ❌ Bad - trusting client tenant selection
async findById(userId: string) {
  return this.userRepository.findOne(userId);  // Missing tenant check!
}
```

---

## 4. HTTP Controller Patterns

### Controller Structure

```typescript
// ✅ Good - thin controllers, clear responsibilities
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUser(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantContext() tenantId: string,
  ): Promise<UserResponseDto> {
    return this.userService.findById(id, tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateUserDto,
    @TenantContext() tenantId: string,
  ): Promise<UserResponseDto> {
    return this.userService.create(dto, tenantId);
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @TenantContext() tenantId: string,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, dto, tenantId);
  }
}

// ❌ Bad - fat controllers with business logic
@Controller('users')
export class UserController {
  async createUser(@Body() dto: any) {
    // Validating, checking permissions, creating in DB...all here!
    if (!dto.email) throw new Error('Email required');
    const user = new User();
    user.email = dto.email;
    // ... 50 more lines of logic
    await this.userRepository.save(user);
  }
}
```

### DTO Validation

```typescript
// ✅ Good - class-validator decorators, explicit validation
import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsUUID('4')
  tenantId: string;
}

// ❌ Bad - no validation, manual checks scattered
export class CreateUserDto {
  email: string;
  name: string;
}
```

### Exception Handling

```typescript
// ✅ Good - NestJS built-in exceptions with proper codes
@Post()
async createUser(@Body() dto: CreateUserDto, @TenantContext() tenantId: string) {
  const existing = await this.userService.findByEmail(dto.email, tenantId);
  if (existing) {
    throw new ConflictException('Email already in use');
  }
  return this.userService.create(dto, tenantId);
}

// ❌ Bad - custom errors, HTTP status mixed with logic
async createUser(dto: CreateUserDto) {
  try {
    return await this.userRepository.save(dto);
  } catch (error) {
    return { error: 'Failed', code: 500 };  // Wrong!
  }
}
```

---

## 5. Bull Queue Patterns

### Queue Configuration & Jobs

**CRITICAL**: All async work goes through Bull queues, never direct execution.

```typescript
// ✅ Good - clear job types, typed handlers
export const INTERVIEW_QUEUE = 'interviews';

export type InterviewInitiationJob = {
  mandateId: string;
  questionnaireId: string;
  tenantId: string;
};

@Injectable()
export class InterviewQueue {
  constructor(@InjectQueue(INTERVIEW_QUEUE) private queue: Queue) {}

  async enqueueInitiation(job: InterviewInitiationJob): Promise<void> {
    await this.queue.add('initiate-interview', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}

// In processor:
@Processor(INTERVIEW_QUEUE)
export class InterviewProcessor {
  @Process('initiate-interview')
  async handleInitiation(job: Job<InterviewInitiationJob>) {
    const { mandateId, questionnaireId, tenantId } = job.data;
    // Implementation
  }
}

// ❌ Bad - direct async execution
export class InterviewService {
  async initiate(mandateId: string) {
    // Direct execution - no retry logic, no priority, can't track
    await this.performInitiation(mandateId);
  }
}
```

### Job Retry & Error Handling

```typescript
// ✅ Good - exponential backoff with circuit breaker pattern
@Processor(INTERVIEW_QUEUE)
export class InterviewProcessor {
  @Process('initiate-interview')
  async handle(job: Job<InterviewInitiationJob>) {
    try {
      return await this.interviewService.initiate(job.data);
    } catch (error) {
      if (error instanceof TransientError) {
        throw error;  // Bull will retry
      }
      // For permanent errors, log and mark job as failed
      this.logger.error('Permanent failure', {
        jobId: job.id,
        error: error.message,
      });
      throw new Error(`Permanent failure: ${error.message}`);
    }
  }
}

// ❌ Bad - swallowing errors or retrying permanent failures
@Process('initiate-interview')
async handle(job: Job) {
  try {
    await this.interviewService.initiate(job.data);
  } catch (error) {
    // Silently fails, never retried
    console.log('Error occurred');
  }
}
```

---

## 6. LiteLLM Integration Patterns

### Initialization & Configuration

```typescript
// ✅ Good - single LiteLLM configuration point
import * as litellm from 'litellm';

@Injectable()
export class LiteLLMConfig {
  static initialize(config: {
    openaiApiKey: string;
    anthropicApiKey: string;
    azureApiKey: string;
    googleApiKey: string;
    cohereApiKey: string;
  }) {
    Object.entries(config).forEach(([key, value]) => {
      process.env[this.getEnvVar(key)] = value;
    });
  }

  private static getEnvVar(key: string): string {
    const mapping: Record<string, string> = {
      openaiApiKey: 'OPENAI_API_KEY',
      anthropicApiKey: 'ANTHROPIC_API_KEY',
      azureApiKey: 'AZURE_API_KEY',
      googleApiKey: 'GOOGLE_API_KEY',
      cohereApiKey: 'COHERE_API_KEY',
    };
    return mapping[key];
  }
}

// In app initialization:
@Injectable()
export class AppService implements OnModuleInit {
  onModuleInit() {
    LiteLLMConfig.initialize({
      openaiApiKey: this.configService.get('OPENAI_API_KEY'),
      anthropicApiKey: this.configService.get('ANTHROPIC_API_KEY'),
      // ...
    });
  }
}
```

### Provider Selection with Classification Router

```typescript
// ✅ Good - classification-driven provider selection
type DataClassification = 'PUBLIC' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';

@Injectable()
export class LLMRouter {
  private readonly routes: Record<DataClassification, string[]> = {
    PUBLIC: ['cohere/command-r-plus', 'claude-3-5-sonnet'],
    CONFIDENTIAL: ['claude-3-5-sonnet', 'gpt-4-turbo'],
    SECRET: ['gpt-4-turbo', 'claude-3-5-sonnet'],
    TOP_SECRET: ['on-premise-llm'],  // Never cloud
  };

  selectProvider(classification: DataClassification): string {
    const providers = this.routes[classification];
    if (!providers || providers.length === 0) {
      throw new Error(`No providers configured for ${classification}`);
    }
    return providers[0];  // Primary choice
  }

  getProviderChain(classification: DataClassification): string[] {
    return this.routes[classification];
  }
}

// ❌ Bad - hard-coded provider selection
async generateResponse(content: string) {
  return litellm.completion({
    model: 'gpt-4-turbo',  // Always same - no flexibility
    messages: [{ role: 'user', content }],
  });
}
```

### LiteLLM API Calls with Error Handling

```typescript
// ✅ Good - proper error handling, rate limiting awareness
@Injectable()
export class LLMService {
  constructor(private readonly router: LLMRouter) {}

  async generateResponse(
    messages: any[],
    mandateId: string,
    classification: DataClassification,
    budget?: { maxTokens: number; maxCost: number },
  ): Promise<string> {
    const provider = this.router.selectProvider(classification);

    try {
      const response = await litellm.completion({
        model: provider,
        messages,
        temperature: 0.7,
        max_tokens: budget?.maxTokens || 1000,
      });

      // liteLLM automatically logs to PostgreSQL via logging config
      return response.choices[0].message.content;
    } catch (error) {
      if (error.status === 429) {
        throw new RateLimitException('Provider rate limit exceeded');
      }
      if (error.status === 401) {
        throw new UnauthorizedException('LLM provider authentication failed');
      }
      throw error;
    }
  }
}

// ❌ Bad - no rate limit handling, no cost awareness
async generateResponse(messages: any[]) {
  const response = await litellm.completion({
    model: 'gpt-4-turbo',
    messages,
  });
  return response.choices[0].message.content;
}
```

### Cost Tracking via liteLLM Logging

```typescript
// ✅ Good - liteLLM automatic logging
// liteLLM's built-in logging automatically writes to PostgreSQL:
// - request/response tokens
// - cost calculation (based on provider pricing)
// - provider, model, temperature
// - timestamp

// We aggregate for billing:
@Injectable()
export class CostAggregationService {
  constructor(
    @InjectRepository(LlmLogEntity)
    private readonly logRepository: Repository<LlmLogEntity>,
  ) {}

  async getTenanCosts(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ total: number; byModel: Record<string, number> }> {
    const logs = await this.logRepository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, endDate),
      },
    });

    const total = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const byModel = logs.reduce(
      (acc, log) => {
        acc[log.model] = (acc[log.model] || 0) + (log.cost || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, byModel };
  }
}

// ❌ Bad - manual cost tracking
async trackCost(model: string, tokens: number) {
  const costPerToken = 0.003;  // Hardcoded, wrong for different models
  const cost = tokens * costPerToken;
  // Manual tracking is error-prone
}
```

---

## 7. Authentication & Authorization

### JWT Strategy

```typescript
// ✅ Good - explicit token extraction and validation
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  validate(payload: any): JwtPayload {
    if (!payload.sub || !payload.tenantId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
    };
  }
}

// ❌ Bad - lenient validation
validate(payload: any) {
  return payload;  // No validation!
}
```

### TenantContext Decorator

```typescript
// ✅ Good - custom decorator for tenant extraction
@createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found');
    }
    return tenantId;
  },
)
export class TenantContext {}

// Usage:
@Get('mandates')
async getUserMandates(
  @TenantContext() tenantId: string,  // Automatically extracted & validated
) {
  return this.mandateService.findByTenant(tenantId);
}

// ❌ Bad - manual extraction with potential bugs
@Get('mandates')
async getUserMandates(@Req() req: Request) {
  const tenantId = req.query.tenantId;  // Trusting user!
  return this.mandateService.findByTenant(tenantId);
}
```

---

## 8. Testing Patterns

### Service Unit Tests

```typescript
// ✅ Good - clear arrange-act-assert, mocked dependencies
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<UserRepository>;

  beforeEach(async () => {
    const mockRepository = jest.fn(() => ({
      findOne: jest.fn(),
      save: jest.fn(),
    }));

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get(UserService);
    repository = module.get(UserRepository);
  });

  it('should create user with tenant context', async () => {
    // Arrange
    const dto: CreateUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      tenantId: 'tenant-1',
    };
    const expected = { id: '123', ...dto };
    repository.save.mockResolvedValue(expected);

    // Act
    const result = await service.create(dto, 'tenant-1');

    // Assert
    expect(result).toEqual(expected);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant-1' }),
    );
  });
});

// ❌ Bad - testing implementation details, unclear test
it('should work', async () => {
  const result = await service.create({ email: 'test@example.com' });
  expect(result).toBeDefined();
});
```

### Integration Tests with Test Database

```typescript
// ✅ Good - real database, transaction-based isolation
describe('UserRepository (Integration)', () => {
  let dataSource: DataSource;
  let repository: UserRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    await dataSource.runMigrations();
    repository = dataSource.getRepository(UserEntity);
  });

  afterEach(async () => {
    await dataSource.query('ROLLBACK TO SAVEPOINT test');
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should enforce RLS on tenant isolation', async () => {
    // Arrange
    const tenant1 = await createTenant('tenant-1');
    const tenant2 = await createTenant('tenant-2');
    const user1 = await repository.save({
      tenantId: tenant1.id,
      email: 'user1@example.com',
    });

    // Act & Assert
    const result = await repository.findOne({
      where: { id: user1.id, tenantId: tenant2.id },  // Cross-tenant query
    });
    expect(result).toBeNull();  // RLS should block
  });
});

// ❌ Bad - mocking database, doesn't test real behavior
it('should find user', async () => {
  const mockDb = { findOne: jest.fn().mockResolvedValue({}) };
  const result = await mockDb.findOne();
  expect(result).toBeDefined();
});
```

---

## 9. Anti-Patterns to Avoid

### ❌ NEVER: Direct Database Access Outside Repository

```typescript
// ❌ WRONG
@Injectable()
export class UserService {
  constructor(private dataSource: DataSource) {}

  async getUser(id: string) {
    return this.dataSource.query('SELECT * FROM users WHERE id = $1', [id]);
  }
}

// ✅ RIGHT
@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUser(id: string, tenantId: string) {
    return this.userRepository.findOne({ where: { id, tenantId } });
  }
}
```

### ❌ NEVER: Forget Tenant Context

```typescript
// ❌ WRONG - what if user is trying to access another tenant's data?
async getMandates(userId: string) {
  return this.mandateRepository.find({
    where: { createdBy: userId },  // Missing tenant check!
  });
}

// ✅ RIGHT
async getMandates(userId: string, tenantId: string) {
  return this.mandateRepository.find({
    where: { createdBy: userId, tenantId },  // Always filter by tenant
  });
}
```

### ❌ NEVER: Promise.all() with Mixed Success/Failure

```typescript
// ❌ WRONG - if one fails, all fail (probably not what you want)
await Promise.all([
  this.emailService.send(email1),
  this.emailService.send(email2),
  this.emailService.send(email3),
]);

// ✅ RIGHT - partial failures are acceptable
await Promise.allSettled([
  this.emailService.send(email1),
  this.emailService.send(email2),
  this.emailService.send(email3),
]);
```

### ❌ NEVER: Store Secrets in Code

```typescript
// ❌ WRONG
const OPENAI_KEY = 'sk-proj-abc123...';

// ✅ RIGHT
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}
```

### ❌ NEVER: Circular Dependencies

```typescript
// ❌ WRONG - creates circular dependency
// user.module.ts
@Module({
  imports: [MandateModule],
  providers: [UserService],
})
export class UserModule {}

// mandate.module.ts
@Module({
  imports: [UserModule],  // Circular!
  providers: [MandateService],
})
export class MandateModule {}

// ✅ RIGHT - create shared module
// shared.module.ts
@Module({
  providers: [SomeSharedService],
  exports: [SomeSharedService],
})
export class SharedModule {}

// user.module.ts
@Module({
  imports: [SharedModule],
  providers: [UserService],
})
export class UserModule {}
```

### ❌ NEVER: Ignore Validation Errors

```typescript
// ❌ WRONG - validation runs but errors are ignored
export class CreateUserDto {
  @IsEmail()
  email: string;  // Invalid email will be caught but might be processed anyway
}

// ✅ RIGHT - validation errors thrown automatically via pipe
@Post()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
async createUser(@Body() dto: CreateUserDto) {
  // If validation fails, 400 response is sent automatically
  return this.userService.create(dto);
}
```

### ❌ NEVER: Magic Numbers in Code

```typescript
// ❌ WRONG - what is 3 and 2000?
await this.queue.add('job', data, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
});

// ✅ RIGHT - named constants
const JOB_RETRY_ATTEMPTS = 3;
const JOB_BACKOFF_DELAY_MS = 2000;

await this.queue.add('job', data, {
  attempts: JOB_RETRY_ATTEMPTS,
  backoff: { type: 'exponential', delay: JOB_BACKOFF_DELAY_MS },
});
```

---

## 10. Common Gotchas & Edge Cases

### PostgreSQL Boolean Type

PostgreSQL uses `boolean`, but TypeORM maps it to `boolean` in TypeScript. Be explicit:

```typescript
// ✅ Good
@Column({ type: 'boolean', default: false })
isActive: boolean;

// ❌ Wrong - might cause type confusion
@Column()
isActive: boolean;
```

### Date Handling in PostgreSQL

Always use UTC timestamps. Never mix timezone-aware and timezone-unaware dates:

```typescript
// ✅ Good - always UTC
@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
createdAt: Date;

// ❌ Bad - timezone confusion
@Column({ type: 'timestamp with time zone' })
createdAt: Date;  // Mixing timezone-aware and timezone-unaware
```

### Bull Queue Job Data Serialization

Job data is serialized to JSON. Don't pass:
- Date objects (convert to ISO strings)
- Functions or classes
- Circular references

```typescript
// ✅ Good
await this.queue.add('job', {
  mandateId: 'uuid',
  createdAt: new Date().toISOString(),  // String, not Date
});

// ❌ Bad
await this.queue.add('job', {
  mandate: mandateObject,  // Complex object with functions
  createdAt: new Date(),   // Date object, won't serialize properly
});
```

### TypeORM Lazy Relations Performance

Avoid lazy-loading relations in loops:

```typescript
// ✅ Good - eager load
const mandates = await this.mandateRepository.find({
  relations: ['requirements'],  // Load relations upfront
});

// ❌ Bad - N+1 query problem
const mandates = await this.mandateRepository.find();
for (const mandate of mandates) {
  const requirements = await mandate.requirements;  // Query per mandate!
}
```

### Error Messages in Responses

Never expose internal error details to clients:

```typescript
// ✅ Good
throw new BadRequestException('Invalid email format');

// ❌ Bad
throw new BadRequestException(`Database error: ${error.message}`);
```

### Environment Variables Required at Startup

Not every field needs to be required, but critical integrations do:

```typescript
// ✅ Good - fail fast
@Injectable()
export class ConfigValidator {
  constructor(private configService: ConfigService) {
    const required = [
      'DATABASE_URL',
      'REDIS_URL',
      'JWT_SECRET',
      'OPENAI_API_KEY',
    ];
    for (const key of required) {
      if (!this.configService.get(key)) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }
}

// ❌ Bad - might fail at runtime
const apiKey = process.env.OPENAI_API_KEY;  // No check
```

---

## 11. Code Organization Checklist

Before committing code:

- [ ] **TypeScript Strict Mode**: No `any`, all types explicit
- [ ] **Naming**: Clear, searchable names (not `x`, `data`, `tmp`)
- [ ] **Single Responsibility**: Each class does one thing
- [ ] **DRY (Don't Repeat Yourself)**: Extract common logic to shared functions
- [ ] **Testing**: Unit tests for services, integration tests for repositories
- [ ] **Error Handling**: Proper exception types, clear messages
- [ ] **Logging**: Info, warn, error levels used appropriately
- [ ] **Database**: All queries include tenant context
- [ ] **Security**: No hardcoded secrets, validation at boundaries
- [ ] **Documentation**: Complex logic has comments explaining "why"

---

## 12. Common Implementation Commands

### Generate a New Module

```bash
nest generate module modules/{feature}
nest generate service modules/{feature}
nest generate controller modules/{feature}
```

### Create Entity & Repository

```bash
# Create entity manually in src/modules/{feature}/entities/{feature}.entity.ts
# Create repository manually in src/modules/{feature}/repositories/{feature}.repository.ts
```

### Run Tests

```bash
npm run test                    # Run all unit tests
npm run test -- --watch        # Watch mode
npm run test:e2e               # Run integration tests
npm run test:cov               # Coverage report
```

### Database Migrations

```bash
npm run migration:generate -- --name {MigrationName}
npm run migration:run           # Apply pending migrations
npm run migration:revert        # Revert last migration
```

---

## 13. Documentation Requirements

Every module should have:

- **README.md**: Module purpose, exported services, main use cases
- **Service methods**: JSDoc comments explaining complex logic
- **Repositories**: Comments on custom query methods and their business purpose
- **DTOs**: Comments on validation rules and their rationale
- **Guard/Decorators**: Explanation of security implications

```typescript
/**
 * Finds a user by email within a specific tenant context.
 *
 * @param email - User email address
 * @param tenantId - Tenant context for RLS enforcement
 * @returns User entity if found, null otherwise
 * @throws Will not throw - returns null for not found
 *
 * @example
 * const user = await userRepository.findByEmail('user@example.com', 'tenant-123');
 */
async findByEmail(email: string, tenantId: string): Promise<UserEntity | null> {
  return this.findOne({
    where: { email, tenantId },
  });
}
```

---

**This document is the source of truth for implementation patterns. All AI agents must follow these patterns to ensure consistent, maintainable, production-ready code.**

**Last Updated**: 2026-01-25
**Architecture Version**: 1.0
**Project Status**: Implementation Ready
