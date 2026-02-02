# Epics & User Stories - AI Interviewer

**Created:** 2026-02-02
**Based on:** PRD v1.0, Architecture v1.0
**Phase:** MVP (Slack Integration)

---

## Epic Overview

| Epic | Name | Priority | Stories | Est. Points |
|------|------|----------|---------|-------------|
| E0 | Project Foundation & Infrastructure | P0 | 5 | 21 |
| E1 | Mandate Management | P0 | 6 | 26 |
| E2 | Authentication & Multi-Tenancy | P0 | 4 | 18 |
| E3 | LLM Integration | P1 | 4 | 21 |
| E4 | Slack Integration | P1 | 5 | 26 |
| E5 | Interview Execution | P1 | 6 | 34 |
| E6 | Webhooks & Notifications | P2 | 4 | 16 |

**Total:** 34 stories, ~162 story points

---

## Epic 0: Project Foundation & Infrastructure

**Goal:** Establish the NestJS project foundation with database, Redis, and core infrastructure.

**Dependencies:** None (Foundation)

### Story E0-S1: Initialize NestJS Project

**As a** developer
**I want** a properly configured NestJS project with TypeScript strict mode
**So that** I have a solid foundation for implementing features

**Acceptance Criteria:**
- [ ] NestJS 10.x project initialized with `nest new ai-interviewer`
- [ ] TypeScript strict mode enabled (all strict options in tsconfig.json)
- [ ] ESLint + Prettier configured with project conventions
- [ ] Jest configured for unit and integration testing
- [ ] Package.json includes all core dependencies per architecture doc
- [ ] .env.example with all required environment variables
- [ ] .gitignore properly configured
- [ ] README.md updated with setup instructions

**Technical Notes:**
- Follow architecture.md Section: "Selected Starter: NestJS"
- Use node 20.x LTS

**Story Points:** 3

---

### Story E0-S2: Configure PostgreSQL with TypeORM

**As a** developer
**I want** PostgreSQL database connection with TypeORM configured
**So that** I can persist and query data with type safety

**Acceptance Criteria:**
- [ ] TypeORM 0.3.x installed and configured
- [ ] PostgreSQL 15+ connection via environment variables
- [ ] Database module created at `src/database/database.module.ts`
- [ ] Migration system configured (`npm run migration:generate`, `migration:run`)
- [ ] Connection pooling configured for production
- [ ] Database health check endpoint added

**Technical Notes:**
- Follow project-context.md Section 3: "TypeORM Entity & Repository Patterns"
- Use `DATABASE_URL` environment variable

**Story Points:** 5

---

### Story E0-S3: Configure Redis and Bull Queues

**As a** developer
**I want** Redis connection with Bull queue infrastructure
**So that** I can process async jobs reliably

**Acceptance Criteria:**
- [ ] Redis 7.x connection configured
- [ ] @nestjs/bull installed and configured
- [ ] Queue module created at `src/queues/queue.module.ts`
- [ ] Base job processor with retry logic (exponential backoff)
- [ ] Failed job handling with dead-letter queue
- [ ] Redis health check added to health endpoint

**Technical Notes:**
- Follow architecture.md: "Asynchronous Orchestration & Task Queue"
- Retry: 3 attempts, exponential backoff (2s base)

**Story Points:** 5

---

### Story E0-S4: Implement Structured Logging

**As a** developer
**I want** Winston-based structured logging with classification-aware sanitization
**So that** logs are useful for debugging without exposing sensitive data

**Acceptance Criteria:**
- [ ] Winston 3.x configured with JSON formatter
- [ ] Log levels: DEBUG, INFO, WARN, ERROR
- [ ] Sensitive field sanitization (classification-aware)
- [ ] Request ID injection in all logs
- [ ] Logger service at `src/common/services/logger.service.ts`
- [ ] Logging interceptor for request/response logging

**Technical Notes:**
- Never log Confidential+ content in plaintext
- Follow architecture.md: "Logging, Audit & Compliance"

**Story Points:** 5

---

### Story E0-S5: Create Health Check Module

**As a** developer
**I want** a comprehensive health check endpoint
**So that** Kubernetes can monitor application health

**Acceptance Criteria:**
- [ ] GET /health endpoint returns status and timestamp
- [ ] Database connectivity check
- [ ] Redis connectivity check
- [ ] Proper HTTP status codes (200 healthy, 503 unhealthy)
- [ ] Health module at `src/modules/health/`

**Technical Notes:**
- Response format per architecture.md API patterns

**Story Points:** 3

---

## Epic 1: Mandate Management

**Goal:** Implement core mandate CRUD operations with classification support.

**Dependencies:** E0 (Project Foundation)

**Requirements Coverage:** FR1, FR2, FR3, FR4, FR5

### Story E1-S1: Create Mandate Entity and Migration

**As a** developer
**I want** the Mandate entity with all required fields
**So that** mandates can be persisted with proper schema

**Acceptance Criteria:**
- [ ] Mandate entity at `src/modules/mandates/entities/mandate.entity.ts`
- [ ] Fields: id, tenantId, targetEmail, initiatorName, subject, question, context, classification, piiFlag, status, createdAt, updatedAt
- [ ] Classification enum: PUBLIC, CONFIDENTIAL, SECRET, TOP_SECRET
- [ ] Status enum: PENDING, INITIATED, RESPONDED, COMPLETED, REFUSED, TIMEOUT, CANCELLED
- [ ] TypeORM migration created and tested
- [ ] Index on tenantId for RLS queries

**Technical Notes:**
- Use snake_case for database columns
- Follow entity patterns in project-context.md

**Story Points:** 5

---

### Story E1-S2: Implement Mandate Repository

**As a** developer
**I want** a custom repository with tenant-aware queries
**So that** all data access enforces multi-tenancy

**Acceptance Criteria:**
- [ ] MandateRepository at `src/modules/mandates/repositories/mandate.repository.ts`
- [ ] All queries include tenantId filter
- [ ] findByIdAndTenant(id, tenantId)
- [ ] findAllByTenant(tenantId, filters)
- [ ] Unit tests for repository methods

**Technical Notes:**
- NEVER query without tenantId
- Follow project-context.md Section 3

**Story Points:** 5

---

### Story E1-S3: Create Mandate DTOs

**As a** developer
**I want** validated DTOs for mandate operations
**So that** API inputs are properly validated

**Acceptance Criteria:**
- [ ] CreateMandateDto with class-validator decorators
- [ ] UpdateMandateDto for partial updates
- [ ] MandateResponseDto for API responses
- [ ] Classification validation (enum)
- [ ] Email validation for targetEmail
- [ ] PII flag as boolean

**Technical Notes:**
- Follow architecture.md API naming (camelCase in responses)

**Story Points:** 3

---

### Story E1-S4: Implement Mandate Service

**As a** developer
**I want** business logic for mandate CRUD operations
**So that** mandates can be created, retrieved, and managed

**Acceptance Criteria:**
- [ ] MandateService at `src/modules/mandates/mandates.service.ts`
- [ ] create(dto, tenantId) - creates new mandate in PENDING state
- [ ] findById(id, tenantId) - retrieves single mandate
- [ ] findAll(tenantId, filters) - retrieves paginated list
- [ ] cancel(id, tenantId) - cancels active mandate
- [ ] State transition validation
- [ ] Unit tests with 80%+ coverage

**Technical Notes:**
- Throw ConflictException for invalid state transitions

**Story Points:** 5

---

### Story E1-S5: Implement Mandate Controller

**As a** developer
**I want** REST endpoints for mandate operations
**So that** clients can interact with the mandate API

**Acceptance Criteria:**
- [ ] MandateController at `src/modules/mandates/mandates.controller.ts`
- [ ] POST /api/mandates - create mandate (FR1, FR2, FR3)
- [ ] GET /api/mandates/:id - get mandate status (FR4)
- [ ] GET /api/mandates - list mandates with pagination
- [ ] DELETE /api/mandates/:id - cancel mandate (FR5)
- [ ] @TenantContext() decorator usage
- [ ] Swagger/OpenAPI documentation
- [ ] Integration tests

**Technical Notes:**
- Use standard response wrapper format
- ParseUUIDPipe for :id validation

**Story Points:** 5

---

### Story E1-S6: Implement Field-Level Encryption

**As a** developer
**I want** sensitive mandate fields encrypted at rest
**So that** data security requirements are met

**Acceptance Criteria:**
- [ ] @Encrypted() decorator at `src/common/decorators/encrypted.decorator.ts`
- [ ] Encryption service using AES-256-GCM
- [ ] Encrypted fields: question, context
- [ ] Transparent encrypt on save, decrypt on retrieve
- [ ] ENCRYPTION_KEY from environment
- [ ] Unit tests for encryption/decryption

**Technical Notes:**
- Follow architecture.md: "Data Encryption & Security at Rest"

**Story Points:** 3

---

## Epic 2: Authentication & Multi-Tenancy

**Goal:** Implement API key authentication and tenant isolation.

**Dependencies:** E0 (Project Foundation)

**Requirements Coverage:** FR11, FR13

### Story E2-S1: Create Tenant and API Key Entities

**As a** developer
**I want** tenant and API key entities
**So that** multi-tenant data isolation is possible

**Acceptance Criteria:**
- [ ] Tenant entity with id, name, createdAt
- [ ] ApiKey entity with id, tenantId, keyHash, name, createdAt, lastUsedAt
- [ ] Relationship: Tenant hasMany ApiKeys
- [ ] Migrations created

**Technical Notes:**
- API key format: `sk_[tenant_id]_[random_base64]`
- Store hashed key only (bcrypt cost 12)

**Story Points:** 5

---

### Story E2-S2: Implement API Key Authentication Guard

**As a** developer
**I want** Bearer token authentication via API keys
**So that** API access is authenticated and tenant-aware

**Acceptance Criteria:**
- [ ] AuthGuard at `src/common/guards/auth.guard.ts`
- [ ] Extract Bearer token from Authorization header
- [ ] Validate against hashed keys in database
- [ ] Attach tenant context to request
- [ ] Return 401 for invalid/missing keys
- [ ] Unit tests

**Technical Notes:**
- Follow architecture.md: "API Key Management & Authentication"

**Story Points:** 5

---

### Story E2-S3: Implement TenantContext Decorator

**As a** developer
**I want** a decorator to extract tenant context in controllers
**So that** all endpoints have easy access to tenant ID

**Acceptance Criteria:**
- [ ] @TenantContext() decorator at `src/common/decorators/tenant-context.decorator.ts`
- [ ] Extracts tenantId from request (set by AuthGuard)
- [ ] Throws UnauthorizedException if missing
- [ ] Unit tests

**Technical Notes:**
- Follow project-context.md Section 7

**Story Points:** 3

---

### Story E2-S4: Implement Rate Limiting

**As a** developer
**I want** Redis-backed rate limiting per API key
**So that** API abuse is prevented (FR13)

**Acceptance Criteria:**
- [ ] RateLimitGuard at `src/common/guards/rate-limit.guard.ts`
- [ ] Redis-backed counter per API key
- [ ] Default: 60 RPM per API key
- [ ] Return 429 with Retry-After header
- [ ] @RateLimit() decorator for custom limits
- [ ] Unit tests

**Technical Notes:**
- Follow architecture.md: "Resource Management"

**Story Points:** 5

---

## Epic 3: LLM Integration

**Goal:** Implement multi-provider LLM integration with liteLLM.

**Dependencies:** E0 (Project Foundation), E2 (Authentication)

**Requirements Coverage:** FR10

### Story E3-S1: Configure liteLLM Integration

**As a** developer
**I want** liteLLM configured with multiple providers
**So that** LLM calls can route to appropriate providers

**Acceptance Criteria:**
- [ ] liteLLM package installed and configured
- [ ] Provider configuration in `src/modules/llm/config/litellm-config.ts`
- [ ] Environment variables for all provider API keys
- [ ] Automatic cost logging to PostgreSQL enabled
- [ ] Budget alerts configured

**Technical Notes:**
- Follow architecture.md: "LLM Architecture: liteLLM-Based Multi-Provider Orchestration"

**Story Points:** 5

---

### Story E3-S2: Implement Classification-Based Router

**As a** developer
**I want** classification-based LLM provider selection
**So that** sensitive data is routed to appropriate providers

**Acceptance Criteria:**
- [ ] RouterService at `src/modules/llm/router.service.ts`
- [ ] Classification → provider mapping:
  - PUBLIC: cohere/command-r-plus
  - CONFIDENTIAL: claude-3-5-sonnet
  - SECRET: gpt-4-turbo
  - TOP_SECRET: on-premise-llm only
- [ ] Fallback chain per classification
- [ ] Unit tests for routing logic

**Technical Notes:**
- TOP_SECRET never routes to cloud providers

**Story Points:** 5

---

### Story E3-S3: Implement LLM Service

**As a** developer
**I want** a unified LLM service for all completions
**So that** other modules can easily request LLM processing

**Acceptance Criteria:**
- [ ] LLMService at `src/modules/llm/llm.service.ts`
- [ ] generateCompletion(messages, classification, options)
- [ ] extractAnswer(mandate, message) - for interview answer extraction
- [ ] Error handling for rate limits (429), auth failures (401)
- [ ] Integration tests with mock providers

**Technical Notes:**
- Target 95% accuracy for answer extraction

**Story Points:** 8

---

### Story E3-S4: Implement Cost Tracking Aggregation

**As a** developer
**I want** LLM costs aggregated per tenant
**So that** billing and budget monitoring work correctly

**Acceptance Criteria:**
- [ ] CostAggregationService at `src/modules/llm/cost-aggregation.service.ts`
- [ ] Aggregate liteLLM logs to audit_logs
- [ ] getTenantCosts(tenantId, startDate, endDate)
- [ ] getCostsByModel(tenantId, startDate, endDate)
- [ ] Scheduled task to aggregate costs

**Technical Notes:**
- Follow architecture.md cost tracking patterns

**Story Points:** 3

---

## Epic 4: Slack Integration

**Goal:** Implement Slack connectivity for interview messaging.

**Dependencies:** E0, E2, E3

**Requirements Coverage:** FR6, FR7

### Story E4-S1: Configure Slack Bolt SDK

**As a** developer
**I want** Slack Bolt SDK configured in socket mode
**So that** the app can send and receive Slack messages

**Acceptance Criteria:**
- [ ] @slack/bolt installed
- [ ] Slack module at `src/modules/slack/slack.module.ts`
- [ ] Socket mode connection with auto-reconnect
- [ ] Environment variables: SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_APP_TOKEN
- [ ] Connection health check

**Technical Notes:**
- Follow architecture.md: "IM Platform Integration"

**Story Points:** 5

---

### Story E4-S2: Implement Identity Mapping Service

**As a** developer
**I want** email to Slack ID resolution
**So that** mandates can be sent to correct users (FR11)

**Acceptance Criteria:**
- [ ] IdentitiesService at `src/modules/identities/identities.service.ts`
- [ ] YAML-based mapping at `src/config/identity-mapping.yaml`
- [ ] resolveSlackId(email): string | null
- [ ] Return null for unresolved identities
- [ ] Unit tests

**Technical Notes:**
- MVP uses static YAML; Phase 2 adds dynamic API

**Story Points:** 3

---

### Story E4-S3: Implement Slack Message Sender

**As a** developer
**I want** to send formatted messages to Slack users
**So that** interviews can be initiated (FR6)

**Acceptance Criteria:**
- [ ] SlackService.sendMessage(slackUserId, message)
- [ ] Message formatting with mandate context (FR7)
- [ ] Error handling for user not found, rate limits
- [ ] Message builder utility at `src/utils/slack-formatting.util.ts`
- [ ] Unit tests with mocked Slack client

**Technical Notes:**
- Include initiator name and subject in messages

**Story Points:** 5

---

### Story E4-S4: Implement Slack Event Handlers

**As a** developer
**I want** to receive and process Slack message events
**So that** user responses can be captured

**Acceptance Criteria:**
- [ ] Message event handler at `src/modules/slack/event-handlers/message-event.handler.ts`
- [ ] Filter bot messages (ignore self)
- [ ] Route messages to interview service
- [ ] Handle direct messages only (not channels)
- [ ] Integration tests

**Technical Notes:**
- Acknowledge within 2 seconds per NFR

**Story Points:** 8

---

### Story E4-S5: Handle Slack Connection Errors

**As a** developer
**I want** graceful handling of Slack service disruptions
**So that** the system remains resilient

**Acceptance Criteria:**
- [ ] Automatic reconnection on disconnect
- [ ] Queue outgoing messages during outage
- [ ] Log connection state changes
- [ ] Health check reflects Slack status
- [ ] Alert on prolonged disconnect (>5 min)

**Technical Notes:**
- Follow architecture.md error handling patterns

**Story Points:** 5

---

## Epic 5: Interview Execution

**Goal:** Implement the complete interview workflow with state machine.

**Dependencies:** E0, E1, E2, E3, E4

**Requirements Coverage:** FR8, FR9, FR10

### Story E5-S1: Create Interview Session Entity

**As a** developer
**I want** interview session tracking
**So that** multi-turn conversations are persisted

**Acceptance Criteria:**
- [ ] InterviewSession entity with id, mandateId, tenantId, status, startedAt, completedAt
- [ ] InterviewMessage entity with id, sessionId, direction (inbound/outbound), content, timestamp
- [ ] Relationships: Mandate hasOne Session, Session hasMany Messages
- [ ] Migrations created

**Technical Notes:**
- Encrypt message content field

**Story Points:** 5

---

### Story E5-S2: Implement Interview Initiation Job

**As a** developer
**I want** a Bull job to initiate interviews
**So that** Slack messages are sent asynchronously (FR6)

**Acceptance Criteria:**
- [ ] InterviewInitiationQueue at `src/queues/interview-initiation.queue.ts`
- [ ] Job processor: resolve identity → send Slack message → update state
- [ ] Handle IDENTITY_UNRESOLVED state
- [ ] Retry logic for transient failures
- [ ] Unit tests

**Technical Notes:**
- API to first Slack message < 10 seconds (NFR)

**Story Points:** 5

---

### Story E5-S3: Implement Interview Reminder Job

**As a** developer
**I want** scheduled reminders for non-responsive interviews
**So that** follow-ups happen automatically (FR9)

**Acceptance Criteria:**
- [ ] InterviewReminderQueue at `src/queues/interview-reminder.queue.ts`
- [ ] Configurable reminder delays: 6h, 24h, 48h
- [ ] Max 3 reminders before TIMEOUT
- [ ] Polite reminder message formatting
- [ ] Unit tests

**Technical Notes:**
- Respect user timezone if available

**Story Points:** 5

---

### Story E5-S4: Implement Answer Extraction

**As a** developer
**I want** LLM-powered answer extraction from responses
**So that** conversational noise is filtered (FR10)

**Acceptance Criteria:**
- [ ] InterviewAnswererService at `src/modules/interviews/interview-answerer.service.ts`
- [ ] extractAnswer(mandate, rawResponse): { answer: string, confidence: number }
- [ ] Filter greetings, filler words
- [ ] Target 95% accuracy on test set
- [ ] Unit tests with sample responses

**Technical Notes:**
- Use appropriate LLM based on classification

**Story Points:** 8

---

### Story E5-S5: Implement Refusal Detection

**As a** developer
**I want** automatic detection of user refusals
**So that** mandates transition to REFUSED state (FR8)

**Acceptance Criteria:**
- [ ] detectRefusal(message): boolean
- [ ] Pattern matching + LLM fallback
- [ ] Common refusal phrases: "no", "can't help", "not my area"
- [ ] Update mandate state to REFUSED
- [ ] Unit tests

**Technical Notes:**
- Log refusal reason for coordinator

**Story Points:** 5

---

### Story E5-S6: Implement Interview Completion Job

**As a** developer
**I want** a job to finalize interviews and notify coordinators
**So that** results are delivered reliably

**Acceptance Criteria:**
- [ ] InterviewCompletionQueue at `src/queues/interview-completion.queue.ts`
- [ ] Aggregate session data into final response
- [ ] Trigger webhook notification
- [ ] Update mandate to COMPLETED state
- [ ] Handle classification-based retention
- [ ] Unit tests

**Technical Notes:**
- TOP_SECRET: purge after delivery

**Story Points:** 6

---

## Epic 6: Webhooks & Notifications

**Goal:** Implement webhook delivery with HMAC signing.

**Dependencies:** E0, E1, E2

**Requirements Coverage:** FR12

### Story E6-S1: Create Webhook Entity

**As a** developer
**I want** webhook registration storage
**So that** coordinators can configure notification endpoints

**Acceptance Criteria:**
- [ ] Webhook entity with id, tenantId, url, secret, events[], active, createdAt
- [ ] Migration created
- [ ] Support multiple webhooks per tenant

**Technical Notes:**
- Store secret hashed

**Story Points:** 3

---

### Story E6-S2: Implement Webhook Registration API

**As a** developer
**I want** CRUD endpoints for webhook management
**So that** coordinators can manage their webhooks

**Acceptance Criteria:**
- [ ] POST /api/webhooks - register webhook
- [ ] GET /api/webhooks - list tenant webhooks
- [ ] DELETE /api/webhooks/:id - remove webhook
- [ ] Validation: valid URL, events array
- [ ] Integration tests

**Technical Notes:**
- Events: mandate.created, mandate.state_changed, mandate.completed

**Story Points:** 5

---

### Story E6-S3: Implement HMAC-SHA256 Signing

**As a** developer
**I want** all webhook payloads signed
**So that** coordinators can verify authenticity (FR12)

**Acceptance Criteria:**
- [ ] WebhookSignerService at `src/modules/webhooks/webhook-signer.service.ts`
- [ ] sign(payload, secret): string
- [ ] Signature format: `sha256=abc123...`
- [ ] Include in X-Signature header
- [ ] Unit tests

**Technical Notes:**
- Follow architecture.md webhook format

**Story Points:** 3

---

### Story E6-S4: Implement Webhook Delivery with Retry

**As a** developer
**I want** reliable webhook delivery with retries
**So that** notifications are not lost

**Acceptance Criteria:**
- [ ] WebhookDeliveryQueue at `src/queues/webhook-delivery.queue.ts`
- [ ] HTTP POST with JSON payload
- [ ] Retry on 5xx errors (3 attempts, exponential backoff)
- [ ] No retry on 4xx (permanent failure)
- [ ] Log delivery status in audit_logs
- [ ] Unit tests

**Technical Notes:**
- 99.9% webhook delivery success (NFR)

**Story Points:** 5

---

## Definition of Done (All Stories)

- [ ] Code follows TypeScript strict mode (no `any`)
- [ ] All queries include tenant context
- [ ] Unit tests with 80%+ coverage
- [ ] Integration tests for API endpoints
- [ ] Code reviewed and approved
- [ ] Documentation updated (JSDoc, README if needed)
- [ ] No linting errors
- [ ] Passes CI pipeline

---

## Sprint Planning Recommendations

### Sprint 1: Foundation (E0 + E2)
- E0-S1: Initialize NestJS Project (3 pts)
- E0-S2: Configure PostgreSQL (5 pts)
- E0-S3: Configure Redis/Bull (5 pts)
- E0-S4: Structured Logging (5 pts)
- E0-S5: Health Check (3 pts)
- E2-S1: Tenant/API Key Entities (5 pts)

**Total: 26 points**

### Sprint 2: Auth + Mandates (E2 + E1)
- E2-S2: Auth Guard (5 pts)
- E2-S3: TenantContext Decorator (3 pts)
- E2-S4: Rate Limiting (5 pts)
- E1-S1: Mandate Entity (5 pts)
- E1-S2: Mandate Repository (5 pts)
- E1-S3: Mandate DTOs (3 pts)

**Total: 26 points**

### Sprint 3: Mandate API + LLM (E1 + E3)
- E1-S4: Mandate Service (5 pts)
- E1-S5: Mandate Controller (5 pts)
- E1-S6: Field Encryption (3 pts)
- E3-S1: liteLLM Config (5 pts)
- E3-S2: Classification Router (5 pts)
- E3-S3: LLM Service (8 pts)

**Total: 31 points**

### Sprint 4: Slack Integration (E3 + E4)
- E3-S4: Cost Tracking (3 pts)
- E4-S1: Slack Bolt Config (5 pts)
- E4-S2: Identity Mapping (3 pts)
- E4-S3: Slack Message Sender (5 pts)
- E4-S4: Slack Event Handlers (8 pts)
- E4-S5: Connection Errors (5 pts)

**Total: 29 points**

### Sprint 5: Interview Execution (E5)
- E5-S1: Interview Session Entity (5 pts)
- E5-S2: Interview Initiation Job (5 pts)
- E5-S3: Interview Reminder Job (5 pts)
- E5-S4: Answer Extraction (8 pts)
- E5-S5: Refusal Detection (5 pts)
- E5-S6: Interview Completion (6 pts)

**Total: 34 points**

### Sprint 6: Webhooks + Polish (E6)
- E6-S1: Webhook Entity (3 pts)
- E6-S2: Webhook API (5 pts)
- E6-S3: HMAC Signing (3 pts)
- E6-S4: Webhook Delivery (5 pts)
- Bug fixes and polish

**Total: 16 points + buffer**

---

## Appendix: Requirements Traceability

| Requirement | Stories |
|-------------|---------|
| FR1: Create mandate | E1-S4, E1-S5 |
| FR2: Assign classification | E1-S1, E1-S3 |
| FR3: Flag PII | E1-S1, E1-S3 |
| FR4: Track status | E1-S5 |
| FR5: Cancel mandate | E1-S4, E1-S5 |
| FR6: Initiate Slack contact | E4-S3, E5-S2 |
| FR7: State mandate context | E4-S3 |
| FR8: Detect refusal | E5-S5 |
| FR9: Retry with timeouts | E5-S3 |
| FR10: Extract answers | E3-S3, E5-S4 |
| FR11: Resolve Email → Slack | E4-S2 |
| FR12: Sign webhooks | E6-S3, E6-S4 |
| FR13: Rate/concurrency limits | E2-S4 |
