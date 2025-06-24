# Internal MVNO Operations Platform – Product Requirements Document (PRD)

## 1. Executive Summary
Build an in-house web application that replaces BeQuick for a **single** MVNO operation while introducing native AI features.  The platform must streamline day-to-day subscriber management, automate decisions with machine-learning, and expose modern APIs for future integrations.

## 2. Goals & Success Metrics
| Goal | KPI | Target |
| ---- | --- | ------ |
| Reduce average plan cost per subscriber | $/sub/month | −8 % within 6 months |
| Speed of new-line onboarding | Minutes from order → SIM active | <3 min |
| Decision automation coverage | % tickets auto-resolved or agent-assisted by AI | 60 % |
| Reporting agility | Avg. ad-hoc report build time | <5 min GUI |

## 3. In-Scope Features (MVP)
### 3.1 Plan Optimization Logic
• Collect real-time usage & billing data via carrier and charging feeds.<br/>
• ML model clusters subscribers, predicts next-cycle usage, surfaces cheaper plans.<br/>
• Bulk or per-subscriber "Apply Plan Change" action with rollback.

### 3.2 AI Knowledge Base
• Embedding-indexed document store (policies, carrier specs, SOPs).<br/>
• Chat UI + API (OpenAI function-calling spec) to answer ops questions.<br/>
• Continuous ingestion from Google Drive / Confluence.

### 3.3 AI Recommendations Engine
• Hooks into workflow events (e.g., payment failure, high-usage spike).<br/>
• Returns ranked actions: send SMS, offer add-on, suspend line, escalate.<br/>
• Feedback loop captures agent acceptance/rejection for model retrain.

### 3.4 Turnkey API Connections
| Integration | Purpose | Protocol |
|-------------|---------|----------|
| Verizon ThingSpace | SIM activation, MDN assignment | REST/JSON + OAuth |
| Stripe / Zift | Payments, card vault | REST/Webhooks |
| CCH SureTax | Real-time tax calc | REST/XML |
| Twilio | SMS, WhatsApp notifications | REST/JSON |

A pluggable adapter pattern must allow swapping or adding carriers/gateways in <2 days.

### 3.5 Seamless MVNO Onboarding
• Wizard imports existing subscriber CSV or via BeQuick export API.<br/>
• Validates data, resolves plan mapping, schedules port-ins.<br/>
• Generates sandbox vs production environments automatically.

### 3.6 Analytics & Custom Reporting Dashboard
• Warehouse raw events in Snowflake (or Postgres initially).<br/>
• Looker-style drag-and-drop GUI plus SQL runner.<br/>
• Pre-built dashboards: Subscriber Growth, Churn Forecast, Revenue Waterfall.

### 3.7 Operator AI Command Console
A natural-language "command palette" that lets authorized operators describe bulk or one-off actions which the AI translates into validated transactions.

• Chat-based prompt → semantic parser → domain DSL → preview screen → commit/rollback.
• Supports entity scopes: single MSISDN, account segment query, uploaded CSV, or dynamic cohort (e.g., "all subscribers on Plan A with <500 MB remaining").
• Actions supported Day-1: change plan, add/remove add-on, credit wallet, suspend/resume, send notification, tag for follow-up.
• Role-based safeties: Operator role can execute, others only draft; every execution stored in audit ledger.
• 'Dry-run' mode shows impact counts and financial delta before commit.

## 4. Out of Scope (MVP)
• Public self-service subscriber portal.<br/>
• Multi-tenant brand management.<br/>
• Call-center staffing modules.

## 5. User Stories
1. **Operator** types "Suspend all lines with >3 consecutive failed payments" and, after previewing 127 impacted lines, executes with one click.
2. **Ops Analyst** wants to view subscribers predicted to overshoot data bucket so she can upsell before bill shock.
3. **Finance Lead** generates month-end revenue & tax liability export with one click.
4. **Support Agent** asks chatbot "why was line #555-123-4567 suspended?" and receives answer with deep-links.

## 6. System Architecture (High-Level)
```mermaid
flowchart TD
    subgraph Frontend
        A[React Admin UI]
        B[Chatbot Widget]
    end
    subgraph Backend
        APIGW[GraphQL / REST Gateway]
        AUTH[Auth Service (JWT, RBAC)]
        CUST[Customer Service]
        BILL[Billing Service]
        PAY[Payment Service]
        PROV[Provisioning Service]
        AIENG[AI Engine]
        ETL[Data Pipeline]
    end
    subgraph Infra
        DB[(Postgres)]
        BUS[(Kafka / NATS)]
        WAREHOUSE[(Snowflake)]
    end
    A --> APIGW
    B --> APIGW
    APIGW --> AUTH
    APIGW --> CUST & BILL & PAY & PROV
    CUST --> DB
    BILL --> DB
    PAY --> DB
    PROV --> DB
    BILL --> BUS
    PROV --> BUS
    BUS --> AIENG
    AIENG --> APIGW
    BUS --> ETL --> WAREHOUSE
```

## 7. Tech Stack Recommendations
• **Backend:** Node.js (Typescript, NestJS) or Python (FastAPI) microservices<br/>
• **AI:** Python, LangChain, OpenAI/Anthropic models; vector DB = Weaviate or pgvector
• **Frontend:** React + MUI (admin dashboard), Streamlit for rapid AI prototypes
• **Data:** Postgres, Kafka (Redpanda), dbt + DuckDB for quick marts
• **Infra:** Docker, Kubernetes (EKS), Terraform IaC

## 8. Security & Compliance
• Tokenized payments only; no PAN storage.<br/>
• Role-based access, field-level encryption for PII.
• Audit-log every state-changing API call (write-ahead immutable ledger).

## 9. Milestones & Timeline (Aggressive)
| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| 0. Infra bootstrap | 2 wks | K8s cluster, CI/CD, auth skeleton |
| 1. Core APIs & DB | 4 wks | Customer, Plan, Provisioning adapters |
| 2. Billing & Payment | 3 wks | Invoice engine, Stripe integration |
| 3. AI KB & Chatbot | 3 wks | Embeddings pipeline, chat UI |
| 4. Plan Optimization MVP | 3 wks | ML model v0, bulk change flow |
| 5. Reporting GUI | 2 wks | Dashboard templates |
| 6. Pilot & Hardening | 4 wks | Data migration, load test, security review |

Go-live target: **≈ 20 weeks (~5 months)** from project kickoff.

## 10. Open Questions
1. Which carrier(s) must be day-one?  
2. Preferred payment processor (Stripe vs Zift)?  
3. Cloud preference (AWS vs GCP)?  
4. Budget for LLM usage / data hosting?

---
*Last updated: {{DATE}}*
