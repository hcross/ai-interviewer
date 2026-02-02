# AI Agents & Workflows

This document describes the AI agents that support development and architecture decisions for the AI Interviewer platform.

## Agent Roles

### Product Manager (PM)
**Responsibility**: Vision, requirements, and feature prioritization

- Owns the Product Requirements Document (PRD)
- Defines user stories and acceptance criteria
- Prioritizes features based on business value
- Communicates with stakeholders
- Tracks product metrics and success criteria

**Tools**: Figma, Jira, analytics dashboards

---

### Business Analyst (Analyst)
**Responsibility**: Requirements discovery and documentation

- Conducts stakeholder interviews
- Documents detailed business processes
- Creates user personas and journey maps
- Translates business needs into technical requirements
- Validates requirements with stakeholders

**Deliverables**: Requirement specifications, process flows, acceptance criteria

---

### Architect (Architect)
**Responsibility**: Technical design and system-level decisions

- Designs system architecture and component interactions
- Makes technology stack decisions
- Defines data models and relationships
- Ensures scalability and security patterns
- Resolves technical conflicts between teams

**Key Decisions**:
- Multi-tenant architecture with Row-Level Security
- LiteLLM as unified LLM provider interface
- Bull queues for async processing
- PostgreSQL with Row-Level Security enforcement

---

### UX Designer (UX Designer)
**Responsibility**: User experience and interface design

- Creates wireframes and prototypes
- Designs user flows and interactions
- Conducts usability testing
- Ensures accessibility standards
- Maintains design consistency

**Deliverables**: Wireframes, design systems, interaction specs

---

### Developer (Dev)
**Responsibility**: Code implementation

- Implements features according to specifications
- Writes unit and integration tests
- Performs code reviews
- Maintains code quality and performance
- Documents complex implementation details

**Standards**:
- TypeScript strict mode
- NestJS module patterns from `docs/project-context.md`
- 80%+ test coverage for new modules
- Atomic commits with Gitmoji

---

### QA & Test Architect (TEA)
**Responsibility**: Test strategy and quality assurance

- Designs comprehensive test strategies
- Creates test automation frameworks
- Develops acceptance test specs
- Validates quality gates before release
- Documents test coverage and test plans

**Test Types**:
- Unit tests (Jest)
- Integration tests (real database)
- E2E tests (real workflows)
- Non-functional testing (performance, security, reliability)

---

### Scrum Master (SM)
**Responsibility**: Process management and team coordination

- Facilitates sprint planning and retrospectives
- Removes blockers for the team
- Tracks sprint velocity and burndown
- Manages workflow status tracking
- Coaches team on agile practices

---

### Tech Writer (Tech Writer)
**Responsibility**: Technical documentation

- Maintains architecture documentation
- Creates API documentation
- Writes implementation guides
- Documents deployment procedures
- Updates project context as patterns evolve

**Key Docs**:
- `docs/project-context.md` - Implementation patterns
- `README.md` - Project overview
- Module-level README files
- API specifications

---

## Workflow Orchestration

### BMAD (Business Mindset AI Development) Workflows

The project uses BMAD workflows for structured development:

#### 1. **Workflow Initialization** (`workflow-init`)
- Determines project phase and type
- Establishes workflow path
- Sets up project structure

#### 2. **Solutioning Phase**
- **Research**: Market, technical, and domain research
- **Product Brief**: Define product vision and scope
- **PRD**: Create comprehensive requirements document
- **Architecture**: Design system components and patterns
- **UX Design**: Create wireframes and design specifications
- **Epics & Stories**: Break requirements into implementation units
- **Implementation Readiness Check**: Validate PRD, architecture, and stories

#### 3. **Implementation Phase**
- **Sprint Planning**: Extract and track epics/stories in sprint
- **Dev Stories**: Implement individual user stories
- **Code Review**: Adversarial review to find issues
- **Test Automation**: Expand test coverage
- **CI/CD Setup**: Configure quality gates and pipelines

#### 4. **Quality & Validation**
- **Test Design**: Create acceptance tests before implementation
- **Test Framework**: Set up automation infrastructure
- **Test Traceability**: Map requirements to tests
- **Test Review**: Assess test quality and coverage
- **NFR Validation**: Verify non-functional requirements

#### 5. **Retrospective**
- Review epic success
- Extract lessons learned
- Identify emerging requirements

---

## Agent Collaboration Patterns

### Pre-Implementation Meeting
1. **PM** presents feature requirements
2. **Analyst** clarifies acceptance criteria
3. **Architect** discusses technical approach
4. **TEA** outlines test strategy
5. **Dev** identifies implementation tasks

### During Implementation
1. **Dev** implements according to spec and `project-context.md`
2. **TEA** writes and executes tests
3. **Dev** ensures test coverage ≥ 80%
4. **SM** unblocks obstacles

### Code Review Process
1. **Dev** submits PR with implementation
2. **Architect** validates against architecture patterns
3. **TEA** validates test coverage and quality
4. **Lead Dev** performs adversarial code review
5. **Tech Writer** ensures documentation is updated

### Release Preparation
1. **SM** confirms all stories complete
2. **TEA** validates quality gates
3. **Tech Writer** ensures docs are current
4. **PM** signs off on feature

---

## Implementation Standards Each Agent Must Follow

### All Agents
- Read `docs/project-context.md` before any code review or implementation
- Use TypeScript strict mode (no `any` types)
- Ensure every database query includes tenant context
- Write tests for new functionality

### Developers Specifically
- Follow NestJS module structure from `project-context.md`
- Use custom repositories for all database queries
- Implement TenantContext decorator in all controllers
- Commit with Gitmoji following atomic commit patterns
- Maintain consistency with existing codebase patterns

### Test Architects
- Aim for 80%+ code coverage on new modules
- Write integration tests using real database
- Test multi-tenant isolation (RLS enforcement)
- Include performance and security tests

### Tech Writers
- Keep `docs/project-context.md` updated as patterns evolve
- Document each module with a README.md
- Use code examples from actual implementation
- Maintain a current glossary of domain terms

---

## Quick Start for New Agents

1. **Clone the repository** and review `README.md`
2. **Study** `docs/project-context.md` (required reading)
3. **Review** current sprint status in `sprint-status.yaml`
4. **Understand** the current architecture
5. **Ask questions** in team discussions
6. **Follow** established patterns from day one

---

## Key Contacts & Decision Makers

| Role | Primary Decision | Escalation |
|------|------------------|-----------|
| PM | Feature prioritization, deadlines | Product leadership |
| Analyst | Requirements interpretation | PM + Architect |
| Architect | Technical approach, framework choices | Tech lead |
| Dev | Implementation details | Tech lead + Architect |
| TEA | Quality standards, test strategy | QA lead |
| SM | Sprint process, timeline | Scrum lead |

---

## Success Metrics

- **Code Quality**: 80%+ test coverage, <5 bugs per sprint
- **Velocity**: Consistent story points delivered per sprint
- **Quality**: Zero security issues, <2% defect escape rate
- **Documentation**: All modules documented, patterns updated
- **Satisfaction**: Positive team retrospectives, zero blockers

---

**Last Updated**: 2026-02-02
**Version**: 1.0
