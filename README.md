# AI Interviewer

A modern, scalable platform for conducting AI-assisted interviews powered by liteLLM and NestJS.

## Overview

AI Interviewer enables organizations to deploy intelligent interview workflows at scale. Built with a strong architectural foundation, it provides multi-tenant support, secure LLM integration, and comprehensive job processing capabilities.

## Key Features

- **Multi-Tenant Architecture**: Isolated data per tenant with Row-Level Security (RLS) at the database level
- **Unified LLM Integration**: Support for multiple LLM providers (OpenAI, Anthropic, Google, Cohere, Azure) through liteLLM
- **Async Job Processing**: Reliable interview processing with Bull queues and Redis
- **Enterprise Security**: JWT authentication, tenant context validation, and secure data isolation
- **Production-Ready**: Strict TypeScript, comprehensive error handling, and structured logging

## Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Runtime** | Node.js 18+ | Execution environment |
| **Framework** | NestJS 10.x | Backend framework |
| **Language** | TypeScript (strict) | Type-safe development |
| **Database** | PostgreSQL 15.x | Primary data store with RLS |
| **Cache/Queue** | Redis | Bull queue broker |
| **Job Processing** | Bull | Async task queue |
| **LLM Proxy** | liteLLM | Unified LLM provider interface |
| **Authentication** | JWT (Passport.js) | Stateless authentication |

## Project Structure

```
ai-interviewer/
├── src/
│   ├── modules/               # Feature modules
│   │   ├── auth/             # Authentication & authorization
│   │   ├── users/            # User management
│   │   ├── mandates/         # Interview mandates
│   │   ├── interviews/       # Interview execution
│   │   ├── questionnaires/   # Interview templates
│   │   └── llm/              # LLM integration
│   ├── common/               # Shared utilities
│   │   ├── decorators/       # Custom decorators (e.g., TenantContext)
│   │   ├── guards/           # Authentication guards
│   │   └── filters/          # Exception filters
│   ├── config/               # Environment & app config
│   └── main.ts               # Application entry point
├── docs/
│   └── project-context.md    # Implementation patterns & guidelines
├── .mcp.json                 # MCP server configuration
└── package.json              # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migration:run

# Start the application
npm run start
```

### Development

```bash
# Watch mode
npm run start:dev

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Linting
npm run lint
```

## Implementation Guidelines

All developers must read `docs/project-context.md` before implementing code. This document covers:

- TypeScript strict mode requirements
- NestJS module organization patterns
- Multi-tenant data isolation
- LiteLLM integration patterns
- Authentication & authorization
- Bull queue best practices
- Testing patterns
- Security considerations

### Key Principles

1. **Tenant-First**: Every query includes tenant context
2. **Type Safety**: Strict TypeScript, no `any` types
3. **Error Handling**: Explicit exceptions with proper HTTP status codes
4. **Testing**: Unit tests for services, integration tests for repositories
5. **Async Work**: All background tasks go through Bull queues
6. **Security**: No hardcoded secrets, validation at system boundaries

## Architecture Decisions

### Multi-Tenancy

Data isolation is enforced at two levels:
- **Database Level**: PostgreSQL Row-Level Security (RLS) policies
- **Application Level**: Tenant ID validation in services

Every entity includes a `tenantId` field, and repositories enforce tenant filtering.

### LLM Provider Selection

Provider selection is driven by data classification:
- **PUBLIC**: Cohere, Claude 3.5 Sonnet
- **CONFIDENTIAL**: Claude 3.5 Sonnet, GPT-4 Turbo
- **SECRET**: GPT-4 Turbo, Claude 3.5 Sonnet
- **TOP_SECRET**: On-premise models only

### Async Processing

Interview workflows use Bull queues with exponential backoff retry logic:
- 3 retry attempts per job
- Exponential backoff with 2-second base delay
- Persistent job storage in Redis
- Automatic failure logging

## BMAD Workflow

This project is managed using **BMAD (Business Mindset AI Development)** - a comprehensive AI-assisted development methodology that structures product design and implementation through collaborative agent workflows.

### BMAD Phases

**Solutioning Phase**: Discovery and design
- **Research**: Market, technical, and domain analysis
- **Product Brief**: Stakeholder interviews and vision definition
- **PRD**: Comprehensive requirements documentation
- **Architecture**: System design and technology decisions
- **UX Design**: Interface and interaction specifications
- **Epics & Stories**: Work breakdown and acceptance criteria
- **Implementation Readiness**: Pre-flight validation

**Implementation Phase**: Development and delivery
- **Sprint Planning**: Extract and track work items
- **Dev Stories**: Implement individual user stories
- **Code Review**: Adversarial quality review
- **Test Automation**: Expand and maintain test coverage
- **CI/CD Setup**: Quality gates and pipelines

### Accessing BMAD Artifacts

All planning artifacts are stored in `_bmad-output/planning-artifacts/`:

```
_bmad-output/planning-artifacts/
├── product-brief-*.md              # Initial discovery and vision
├── prd.md                          # Product Requirements Document
├── architecture.md                 # System design and tech decisions
├── ux-design-specification.md      # Interface and UX patterns
├── prd-validation-report.md        # Requirements validation
└── bmm-workflow-status.yaml        # Current phase and progress
```

### Running BMAD Workflows

Use the available BMAD workflow skills to advance the project:

```bash
# Check current project status
claude-code /workflow-status

# Create next user story
claude-code /create-story

# Execute a story implementation
claude-code /dev-story [story-id]

# Run code review
claude-code /code-review

# Generate test cases
claude-code /testarch-atdd
```

For a complete list of available BMAD workflows, see `AGENTS.md`.

## Contributing

1. Read `docs/project-context.md` carefully
2. Follow TypeScript strict mode guidelines
3. Write tests for new features
4. Include tenant context in all data operations
5. Use Gitmoji for atomic, descriptive commits
6. Keep modules focused on single responsibility
7. **Important**: Document any significant implementation decisions in `AGENTS.md` for future agents

## Deployment

The application is containerized and can be deployed to:
- Docker containers
- Kubernetes clusters
- Cloud platforms (AWS, GCP, Azure)

Ensure all required environment variables are set before deployment.

## Support & Documentation

- **Implementation Patterns**: See `docs/project-context.md`
- **Agent Workflows**: See `AGENTS.md`
- **API Documentation**: Generated from NestJS Swagger decorators

## License

Proprietary - All rights reserved

## Contact

For questions or issues, contact the development team.
