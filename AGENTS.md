# AI Agents & Workflows

This document describes the AI agents that support development and architecture decisions for the AI Interviewer platform.

## BMAD (Business Mindset AI Development)

This project uses **BMAD** - a comprehensive AI-assisted development methodology that orchestrates multiple specialized agents through structured workflows. BMAD provides a proven path from vision to production-ready code through collaborative agent interactions.

### Why BMAD?

- **Structured Approach**: Clear phases (Solutioning → Implementation → Validation)
- **Agent Collaboration**: Multiple agents with distinct expertise working together
- **Knowledge Capture**: Continuous documentation of decisions and patterns
- **Quality Gates**: Validation checkpoints before moving to next phase
- **Scalability**: Patterns and decisions reusable across future projects

### Key BMAD Artifacts

Located in `_bmad-output/planning-artifacts/`:

| Document | Purpose | Owner | Status |
|----------|---------|-------|--------|
| `product-brief-*.md` | Vision, stakeholders, market context | PM + Analyst | ✅ Complete |
| `prd.md` | Detailed requirements and acceptance criteria | PM + Analyst | ✅ Complete |
| `architecture.md` | System design, tech decisions, data models | Architect | ✅ Complete |
| `ux-design-specification.md` | Interface designs, user flows, interactions | UX Designer | ✅ Complete |
| `bmm-workflow-status.yaml` | Current phase and progress tracking | SM | 🔄 Updated per sprint |

### Accessing BMAD Workflows

All available BMAD workflows are accessible through Claude Code skills:

```bash
# View all available workflows
claude-code /help

# Check current project phase and what's next
claude-code /workflow-status

# Create the next story from epics
claude-code /create-story

# Implement a specific story
claude-code /dev-story [story-id]

# Run adversarial code review
claude-code /code-review

# Design and implement tests
claude-code /testarch-atdd

# Facilitate team brainstorming
claude-code /brainstorming
```

### For AI Agents: Critical Rule for Future Development

**⚠️ KNOWLEDGE RETENTION REQUIREMENT**

Any action or decision that could impact future agents MUST be documented in this file. Examples:

- New implementation patterns discovered
- Workarounds for framework limitations
- Tenant-specific configuration details
- Performance optimizations applied
- Security considerations encountered
- Integration issues and solutions
- Testing patterns that proved effective
- Deployment considerations

**Update Procedure**:
1. Complete your implementation task
2. Identify what future agents should know
3. Add a new subsection in appropriate agent role section or in a "Lessons Learned" section
4. Commit with message: `📚 docs: record [brief description] in AGENTS.md`

This ensures knowledge accumulates and prevents repeated mistakes or research.

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

## GitHub Issue Workflow

### Modus Operandi for Issue Management

When working on any story or task linked to a GitHub issue, follow this workflow:

#### 1. **Before Starting Work**
- Assign yourself to the GitHub issue
- Move issue to "In Progress" status (if using project boards)
- Reference the issue number in your work context

#### 2. **During Implementation**
- Keep notes on key implementation decisions
- Track files created/modified
- Document any workarounds or special considerations

#### 3. **After Completing Work**
Update the GitHub issue with:

```markdown
### Implementation Details

#### Files Created/Modified:
- `path/to/file.ts` - Description of changes

#### Key Implementation Points:
1. Point 1
2. Point 2

#### Build Validation:
✅ `npm run build` passes successfully
```

#### 4. **Closing the Issue**
- Update the issue body with detailed implementation notes
- Check all acceptance criteria boxes `[x]`
- Close the issue with state: "closed"
- Ensure assignee is set

### Issue Update Template

When closing an issue, update its body to include:

```markdown
## Story [ID]: [Title]

**Epic:** [Epic Name]
**Points:** [X]
**Priority:** [Critical/High/Medium/Low]

### Acceptance Criteria
- [x] Criterion 1
- [x] Criterion 2

### Implementation Details

#### Files Created:
- `src/path/file.ts` - Description

#### Configuration:
[Code snippets or key configuration details]

#### Build Validation:
✅ All tests pass
```

### GitHub MCP Integration

**Important**: Always use MCP (Model Context Protocol) for GitHub operations:

```typescript
// Use MCP tools, NOT gh CLI
mcp__github__update_issue   // Update issue details
mcp__github__get_issue      // Read issue information
mcp__github__create_issue   // Create new issues
mcp__github__list_issues    // List repository issues
```

This ensures consistent access and proper authentication across all environments.

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

### All Agents - Knowledge Retention (CRITICAL)

**Every implementation MUST include knowledge capture in this file.**

When you complete any significant work:

1. **Identify** what future agents need to know
2. **Document** in the appropriate agent section or create new subsection
3. **Update** this file with findings, workarounds, patterns
4. **Commit** with: `📚 docs: record [description] in AGENTS.md`

Examples of what to document:
- New discovered patterns or best practices
- Framework quirks or limitations encountered
- Tenant context handling edge cases
- Database query optimization insights
- LLM integration challenges and solutions
- Testing strategies that worked well
- Build/deployment gotchas
- Performance optimization techniques

**This is not optional.** Failure to update AGENTS.md means:
- Future agents duplicate work
- Knowledge is lost between sprints
- Institutional learning never accumulates
- Quality and velocity decline over time

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
