---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-ai-interviewer-2026-01-20.md', '_bmad-output/planning-artifacts/research/market-spontaneous-consultation-frameworks-research-2026-01-20.md']
documentCounts:
  briefCount: 1
  researchCount: 1
  brainstormingCount: 0
  projectDocsCount: 0
project_name: ai-interviewer
user_name: Hoani
date: '2026-01-20'
workflowType: 'prd'
classification:
  projectType: api_backend
  domain: general
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - ai-interviewer

**Author:** Hoani
**Date:** 2026-01-20

## Executive Summary
**ai-interviewer** is a specialized autonomous agent platform ("emissaries") designed to eliminate synchronous coordination overhead in enterprises. Users delegate surgical information-gathering tasks to an AI agent that interviews stakeholders asynchronously via IM channels (Slack/Teams). The system acts as a neutral collector, ensuring raw, high-purity fact retrieval for decision-making processes like ADR validations or requirement gathering.

## Success Criteria

### User Success
*   **Mission Autonomy:** 90% of missions reach terminal state (Success or Explicit Refusal) without human coordinator intervention.
*   **SME Efficiency:** Active attention required from Subject Matter Experts (SME) is < 2 minutes per interaction.
*   **Actionability:** 80% of final reports enable immediate decision-making without follow-up meetings.

### Business Success
*   **Operational Velocity:** 30% reduction in latency for dependent decisions (e.g., accelerating ADR status from "pending" to "accepted").
*   **Meeting Reduction:** Measurable decrease in "alignment-only" meetings within adopting teams.
*   **Viral Growth:** > 5% conversion rate of SMEs becoming Coordinators by integrating the API into their own workflows.

### Technical Success
*   **Developer Experience (DX):** "Time to first interview" < 30 minutes for new developers integrating the API.
*   **Reliability:** > 99.9% success rate for Webhook delivery.
*   **Scalability:** Support for 100+ concurrent interviews per tenant without latency degradation.
*   **Platform Coverage:** Native, seamless support for Slack and Microsoft Teams from MVP.

## User Journeys

### 1. The Overwhelmed Coordinator: Sarah's ADR Validation
**Actor:** Sarah, Tech Lead.
**Context:** Needs to validate an Architectural Decision Record (ADR) involving database migration.
**Pain Point:** Senior architects are unavailable for a sync meeting for 4 days.
**Journey:**
1.  **Trigger:** Sarah mandates the agent via API: "Ask Dave, Mike, and Jenna if they validate Option B. Capture blockers."
2.  **Execution:** System handles asynchronous outreach and respectful follow-ups.
3.  **Result:** Sarah receives a consolidated report via webhook within 60 minutes.
4.  **Value:** Dave/Jenna approve; Mike flags a rollback concern. Sarah schedules a 10-minute focused call with Mike only. Decision saved 3 days.

### 2. The Focused Expert: Marc's "Sniper" Interaction
**Actor:** Marc, Senior Backend Engineer (SME).
**Context:** Deep focus work.
**Pain Point:** Interrupted by vague "Got a sec?" messages that derail flow.
**Journey:**
1.  **Interaction:** Bot pings Marc: "On behalf of Sarah: Do you validate Option B for DB Migration?"
2.  **Action:** Marc clicks "No" and provides a one-sentence technical reason.
3.  **Completion:** Bot acknowledges and closes. Marc returns to code immediately.
4.  **Value:** Context switch limited to < 60 seconds.

### 3. The Builder: Alex's HR Automation
**Actor:** Alex, Internal Tools Developer.
**Context:** Automating onboarding check-ins.
**Journey:**
1.  **Implementation:** Alex connects `ai-interviewer` to HRIS webhooks.
2.  **Action:** System automatically triggers check-in interviews on Day 1, 7, and 30 for new hires.
3.  **Value:** HR receives structured weekly reports of onboarding friction without manual chasing.

## Domain-Specific Requirements

### Information Security & Privacy
*   **Classification Model:** Every mandate and response must include a classification attribute: `Public`, `Internal/Confidential`, `Secret`, or `Top Secret`.
*   **PII Flag:** Mandatory boolean flag for Personal Identifiable Information (GDPR compliance).
*   **Handling Rules:** Data retention and encryption policies are strictly driven by classification levels (e.g., "Top Secret" content is purged immediately after delivery).

### Identity Federation
*   **System Identity:** Internal `SystemUserID` acts as the primary key for all humans.
*   **Channel Mapping:** Mappings for `SystemUserID` to `ChannelIDs` (Slack ID, Teams ID, Email).
*   **MVP Implementation:** Static configuration file/table for identity resolution.

### Governance
*   **Audit Trails:** Comprehensive logging of API access (Who, When, Mandate ID).
*   **Mandate Lifecycle:** Immutable metadata logs for every mandate state change.

## API & Technical Requirements

### Protocol & Documentation
*   **REST API:** JSON-based RESTful interface.
*   **OpenAPI:** Auto-generated Swagger specification for all endpoints.
*   **Node.js SDK:** Official client library provided for MVP.

### Authentication & Security
*   **API Keys:** Bearer Token authentication (`sk_...`) per tenant.
*   **Webhook Signing:** HMAC-SHA256 signatures on all outgoing notifications.

### Core Endpoints
*   `POST /mandates`: Initialize mandate (Target, Context, Question, Classification, PII Flag).
    *   **Example Request:**
        ```json
        {
          "target_email": "marc@company.com",
          "initiator_name": "Sarah",
          "subject": "ADR Migration Validation",
          "question": "Do you validate Option B for DB Migration?",
          "classification": "Confidential",
          "pii_flag": false
        }
        ```
*   `GET /mandates/{id}`: Retrieve status and results.
*   `GET /identities`: Query identity mapping status.
*   `POST /webhooks`: Manage callback URLs.

### Error Handling
The API shall use standard HTTP status codes supplemented by specific business error codes:
*   `mapping_failed`: The system could not resolve the target email to a valid IM handle.
*   `unauthorized_classification`: The provided API key does not have permissions to create a mandate with the requested classification level.
*   `quota_exceeded`: The tenant has reached its concurrent interview or monthly token limit.

### Resource Management
*   **Rate Limits:** Default 60 RPM per API Key.
*   **Concurrency:** Max 10 active interviews per tenant (adjustable via DB config).

## Project Scoping & Roadmap

### MVP Strategy (Phase 1)
*   **Goal:** Prove autonomous fact-capture via Slack.
*   **Features:** Core API, Node.js SDK, Slack connector, static identity mapping, and classification-aware data model.

### Growth (Phase 2)
*   **Goal:** Expand ecosystem and channel support.
*   **Features:** Microsoft Teams support, Python SDK, dynamic identity management API, and interactive UI components (Slack Buttons).

### Vision (Phase 3)
*   **Goal:** Intelligent orchestration.
*   **Features:** Conditional logic branching, sentiment analysis, cross-platform failover (Slack -> Email), and insights engine.

## Functional Requirements

### Mandate Management
*   **FR1:** Coordinator can create a mandate with target, question, and context.
*   **FR2:** Coordinator can assign security classification to a mandate.
*   **FR3:** Coordinator can flag mandates for PII content.
*   **FR4:** Coordinator can track mandate status via unique ID.
*   **FR5:** Coordinator can cancel active mandates.

### Agent Execution
*   **FR6:** Agent can initiate contact via Slack.
*   **FR7:** Agent can state mandate context (including Initiator Name and Subject) before asking questions to ensure clarity for the SME.
*   **FR8:** Agent can detect user refusal/declines.
*   **FR9:** Agent can execute reminder logic based on configurable timeouts.
*   **FR10:** Agent can extract core answers from conversational responses by filtering out identified noise (e.g., greetings, filler words) with a target accuracy of 95% on validated test sets.

### Identity & Integration
*   **FR11:** System can resolve Email to Slack ID via config mapping.
*   **FR12:** System can send signed Webhooks (HMAC-SHA256) for all state changes.
*   **FR13:** System can enforce per-tenant rate and concurrency limits.

## Non-Functional Requirements

### Performance
*   **Interaction Latency:** Agent must acknowledge user input on Slack within 2 seconds.
*   **Initiation Speed:** Time from API call to first Slack message < 10 seconds.

### Security & Reliability
*   **Encryption:** All data encrypted at rest (AES-256) and in transit (TLS 1.2+).
*   **Log Privacy:** Application logs must never contain "Confidential" or higher content.
*   **Uptime:** 99.5% API availability during business hours.
*   **Durability:** RPO of 1 hour for major database failures.

### Scalability
*   **Throughput:** Support 100 concurrent interviews per tenant without latency increase.
