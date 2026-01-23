---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['_bmad-output/analysis/brainstorming-session-2026-01-18.md', '_bmad-output/planning-artifacts/research/market-spontaneous-consultation-frameworks-research-2026-01-20.md']
date: 2026-01-20
author: Hoani
---

# Product Brief: ai-interviewer

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

**ai-interviewer** is a platform of autonomous conversational agents designed to solve the inefficiency of synchronous coordination in enterprises. Instead of convening expensive meetings to collect partial information from multiple stakeholders, users mandate an AI agent (an "emissary") to interview the right people on specific topics (availability, ADR validation, requirement gathering). The tool acts as a neutral and surgical collector, optimizing experts' time by capturing distributed information asynchronously.

---

## Core Vision

### Problem Statement

Team coordination and the collection of distributed information currently rely excessively on synchronous meetings ("meeting madness") or inefficient email chains. Often, many people are solicited while only a few hold critical information, generating massive collective time waste and cognitive fatigue.

### Problem Impact

*   **Productivity Loss:** Experts spend their time in "alignment" meetings rather than producing.
*   **Bottlenecks:** Decision-making processes (such as ADR validation) drag on due to lack of calendar alignment.
*   **Cognitive Pollution:** Unnecessary interruption of people not concerned with the entirety of a topic.

### Why Existing Solutions Fall Short

*   **Classic Surveys (Forms):** Too rigid, incapable of intelligent follow-ups or adapting to context.
*   **Scheduling Tools (Calendly/Doodle):** Passive, they do not proactively "go fetch" the information.
*   **Generic AI Assistants:** Reactive by nature, they do not act as emissaries mandated with a specific capture objective.

### Proposed Solution

An **asynchronous delegation** system where the user mandates an interviewer agent to:
1.  Contact only the identified experts with a clear mandate ("I come on behalf of...").
2.  Capture information surgically (Sniper UX).
3.  Report raw facts and positions without attempting mediation or reconciliation.
Key Example: Animating the lifecycle of an ADR by collecting individual technical opinions.

### Key Differentiators

*   **The Explicit Mandate:** Immediate legitimacy through the identification of the mandator.
*   **Neutral Collector:** The agent does not negotiate; it guarantees the purity of the collected information for the human decision-maker.
*   **"Sniper" Approach:** Strict focus on obtaining the target information to minimize the interviewee's cognitive load.

---

## Target Users

### Primary Users: The Decision Coordinator

**Profile:** Anyone tasked with gathering specific data points or approvals from multiple stakeholders to move a project forward (e.g., Project Managers, Executive Assistants, Technical Leads, or Department Heads).

**Context:** They often act as human "middleware," spending significant time chasing experts for binary or simple qualitative answers.

**Success Vision:** They can delegate the "chasing" task to an agent in seconds and receive a structured report of facts, freeing them to focus on the actual decision-making rather than data collection.

### Secondary Users: The Subject Matter Expert (SME)

**Profile:** High-value stakeholders (Directors, Legal Experts, Production Leads) whose time is extremely limited.

**Context:** They are often the bottleneck of projects because they are overwhelmed by non-surgical communication (vague emails, unnecessary meetings).

**Success Vision:** They receive clear, mandated, and highly specific requests that can be answered in a few seconds, asynchronously, without context switching into a meeting.

### User Journey

1.  **Mandate Creation:** The Coordinator defines the mission: "Ask Expert A about information X" and "Ask Expert B about information Y."
2.  **Agent Deployment:** One or multiple agents are dispatched to the identified SMEs.
3.  **Surgical Interaction:** Each SME is contacted with a clear mandate. The agent captures the specific info using "Sniper UX" principles.
4.  **Information Retrieval:** The agent(s) return the raw facts to the Coordinator.
5.  **Handoff:** The Coordinator receives the structured data, ready to be used in their own workflow or decision-making engine.

---

## Success Metrics

Success for **ai-interviewer** is defined by its ability to act as a seamless information-gathering layer that requires zero manual intervention once a mission is launched.

### User Success Metrics

*   **Completion Rate:** Percentage of mandated missions where the agent successfully captures the target information without the Coordinator's intervention.
*   **Response Speed (SME):** Average time taken by the Subject Matter Expert to provide the answer (Target: < 2 minutes of active attention).
*   **Information Purity:** Qualitative assessment that the captured facts are actionable by the Coordinator without needing a follow-up meeting.

### Business Objectives

*   **Meeting Reduction:** Quantifiable decrease in "alignment-only" meetings within teams adopting the tool.
*   **Operational Velocity:** Accelerating decision cycles (e.g., reducing the time an ADR stays in "pending" status).
*   **Adoption Virality:** Tracking the conversion rate of Subject Matter Experts (SMEs) becoming Coordinators themselves after experiencing the "Sniper UX."

### Key Performance Indicators

*   **Mission Autonomy:** % of missions completed with 0 manual follow-ups from the Coordinator.
*   **Time-to-Fact:** Total elapsed time from mandate creation to report delivery (Target: < 4 hours for 80% of requests).
*   **NPS (SME side):** Net Promoter Score specifically from the "Interrogated" side to ensure the agent is perceived as a value-add, not a nuisance.

---

## MVP Scope

### Core Features

*   **Mandate Configuration:** A simple interface (CLI or Web) where the Coordinator can define:
    *   Target User (SME) handle/address.
    *   Mandate Context (Who is asking and why).
    *   Specific Question/Task.
*   **Autonomous Interviewing Agent:** An agent capable of:
    *   Initiating contact on IM channels.
    *   Stating its mandate clearly.
    *   Persistent yet respectful follow-ups if no response is received.
    *   Capturing the raw response accurately.
*   **Surgical Response Capture (Sniper UX):** Optimization of the interaction to ensure the SME can answer in a single turn.
*   **Fact Reporting:** Delivery of the raw, unedited facts back to the Coordinator once the mission is complete.

### Out of Scope for MVP

*   **Complex Orchestration:** Logic-based dependencies (e.g., "If A says Yes, then ask B").
*   **Multi-Channel Synchronization:** Managing the same mission across different platforms simultaneously.
*   **Calendar Negotiation:** Deep integration with meeting scheduling tools.
*   **Advanced NLP Summarization:** The MVP focuses on raw fact capture rather than AI-generated synthesis.

### MVP Success Criteria

*   **Technical Feasibility:** Successful deployment of an agent that can send/receive messages on at least one IM platform.
*   **Task Completion:** 90% of initiated missions reach a terminal state (Success or Explicit Refusal).
*   **User Validation:** At least 5 "Decision Coordinators" use the tool to replace a manual follow-up task and report time savings.

### Future Vision

*   **Cross-Platform Emissaries:** Agents that can jump between Slack, Teams, and Email depending on where the expert is most active.
*   **Decision Workflows:** Integration with orchestration engines to handle sequential approvals (like the ADR lifecycle example).
*   **Insights Engine:** AI-powered clustering and sentiment analysis across dozens of simultaneous interviews.